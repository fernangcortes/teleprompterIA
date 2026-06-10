import React, { useEffect, useRef, useCallback } from "react";
import { useConfig } from "../context/ConfigContext";
import { usePlayback } from "../context/PlaybackContext";

const WORKER_SCRIPT = `
let intervalId;
self.onmessage = function(e) {
  if (e.data === 'start') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => self.postMessage('tick'), 16);
  } else if (e.data === 'stop') {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }
};
`;

export const usePrompterEngine = (
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const { speed, voiceScrollOffset } = useConfig();
  const {
    isPlaying,
    isVoiceMode,
    voiceStatus,
    activeWordId,
    setPlaying,
    setActiveWordId,
    lastManualInteractionRef,
    ignoreVoiceUntilRef,
    transcriptBufferRef,
    postMessageToChannel,
    broadcastChannel
  } = usePlayback();

  const workerRef = useRef<Worker | null>(null);
  const currentVelocity = useRef<number>(0);
  const scrollAccumulator = useRef<number>(0); 
  const isAutoScrolling = useRef<boolean>(false);
  const detectWordThrottle = useRef<number | null>(null);
  const isSyncingFromPopup = useRef(false);

  // Keep latest config/playback states in refs to avoid recreating the Web Worker
  const speedRef = useRef(speed);
  const voiceScrollOffsetRef = useRef(voiceScrollOffset);
  const isPlayingRef = useRef(isPlaying);
  const isVoiceModeRef = useRef(isVoiceMode);
  const voiceStatusRef = useRef(voiceStatus);
  const activeWordIdRef = useRef(activeWordId);

  useEffect(() => {
    speedRef.current = speed;
    voiceScrollOffsetRef.current = voiceScrollOffset;
    isPlayingRef.current = isPlaying;
    isVoiceModeRef.current = isVoiceMode;
    voiceStatusRef.current = voiceStatus;
    activeWordIdRef.current = activeWordId;
  }, [speed, voiceScrollOffset, isPlaying, isVoiceMode, voiceStatus, activeWordId]);

  // Sync scroll position to projection window
  const syncPopupPercentage = useCallback(() => {
    if (isSyncingFromPopup.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const max = container.scrollHeight - container.clientHeight;
    if (max > 0) {
      const percentage = container.scrollTop / max;
      postMessageToChannel({ type: "SCROLL_SYNC", percentage });
    }
  }, [scrollContainerRef, postMessageToChannel]);

  const syncPopupPercentageRef = useRef(syncPopupPercentage);
  useEffect(() => {
    syncPopupPercentageRef.current = syncPopupPercentage;
  }, [syncPopupPercentage]);

  const setPlayingRef = useRef(setPlaying);
  useEffect(() => {
    setPlayingRef.current = setPlaying;
  }, [setPlaying]);

  // Detect which word is currently at the reading guideline
  const detectActiveWordFromScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const baseLine = 0.32; 
    const offsetModifier = (voiceScrollOffset || 0) / 100;
    
    const targetY = rect.top + (rect.height * (baseLine + offsetModifier));
    const targetX = rect.left + (rect.width / 2);

    const element = document.elementFromPoint(targetX, targetY);

    if (element && element.id && element.id.startsWith('w-')) {
        if (activeWordId !== element.id) {
            setActiveWordId(element.id);
        }
    }
  }, [scrollContainerRef, voiceScrollOffset, activeWordId, setActiveWordId]);

  // Listen to the BroadcastChannel for scrolling synced from the projection window
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === "SCROLL_SYNC") {
        const container = scrollContainerRef.current;
        if (!container) return;

        const percentage = e.data.percentage;
        const max = container.scrollHeight - container.clientHeight;
        const target = percentage * max;

        // Prevent echo by setting flag
        isSyncingFromPopup.current = true;
        if (Math.abs(container.scrollTop - target) > 1) {
          container.scrollTop = target;
        }

        setTimeout(() => {
          isSyncingFromPopup.current = false;
        }, 50);
      }
    };

    broadcastChannel.addEventListener("message", handleBroadcast);
    return () => {
      broadcastChannel.removeEventListener("message", handleBroadcast);
    };
  }, [broadcastChannel, scrollContainerRef]);

  // Set up Worker for Anti-Jitter scroll timing
  useEffect(() => {
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (Date.now() < ignoreVoiceUntilRef.current) {
          currentVelocity.current = 0;
          return;
      }

      // Operator sovereignty logic: manual overrides voice mode for 3 seconds
      const timeSinceInteraction = Date.now() - lastManualInteractionRef.current;
      const isManualOverride = timeSinceInteraction < 3000;

      let targetVelocity = 0;

      if (isManualOverride || !isVoiceModeRef.current) {
          if (isPlayingRef.current) {
              targetVelocity = speedRef.current * 0.06;
          } else {
              targetVelocity = 0;
          }
      } else {
          // Voice Mode (Smart Scroll)
          if (voiceStatusRef.current === 'active') {
             if (activeWordIdRef.current) {
                const el = document.getElementById(activeWordIdRef.current);
                if (el) {
                   const containerRect = container.getBoundingClientRect();
                   const elRect = el.getBoundingClientRect();
                   const relativeTop = elRect.top - containerRect.top;
                   const offsetPercent = (voiceScrollOffsetRef.current || 0) / 100;
                   const idealLine = container.clientHeight * (0.32 + offsetPercent);
                   const error = relativeTop - idealLine;
                   
                   if (Math.abs(error) < 20) {
                      targetVelocity = 0;
                   } else {
                       if (error > 250) targetVelocity = 6.0; 
                       else if (error > 150) targetVelocity = 4.0;
                       else if (error > 50) targetVelocity = 2.5; 
                       else if (error > 20) targetVelocity = 1.0; 
                       else if (error > -20) targetVelocity = 0;  
                       else if (error > -100) targetVelocity = -0.8; 
                       else targetVelocity = 0; 
                   }
                } else { targetVelocity = 0; }
             } else { targetVelocity = 0; }
          }
      }

      const smoothingFactor = 0.05; 
      currentVelocity.current += (targetVelocity - currentVelocity.current) * smoothingFactor;

      if (targetVelocity === 0 && Math.abs(currentVelocity.current) < 0.1) {
          currentVelocity.current = 0;
      }

      if (Math.abs(currentVelocity.current) > 0) {
         if (container.scrollTop + container.clientHeight < container.scrollHeight - 1) {
            isAutoScrolling.current = true;
            scrollAccumulator.current += currentVelocity.current;
            const pixelsToScroll = Math.floor(scrollAccumulator.current);
            if (pixelsToScroll !== 0) {
              container.scrollTop += pixelsToScroll;
              scrollAccumulator.current -= pixelsToScroll;
              syncPopupPercentageRef.current();
            }
         } else if (isPlayingRef.current && !isVoiceModeRef.current && !isManualOverride) {
            setPlayingRef.current(false);
         }
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [scrollContainerRef]);

  // Start/Stop worker based on playing status
  useEffect(() => {
    const shouldRun = isPlaying || isVoiceMode;
    
    if (isPlaying) {
        ignoreVoiceUntilRef.current = 0;
    }

    if (shouldRun) workerRef.current?.postMessage('start');
    else {
      scrollAccumulator.current = 0;
      const timeout = setTimeout(() => {
         if (!isPlaying && !isVoiceMode) {
             workerRef.current?.postMessage('stop');
         }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, isVoiceMode]);

  // Attach manual scroll listeners to override auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = () => {
         lastManualInteractionRef.current = Date.now();
         ignoreVoiceUntilRef.current = Date.now() + 2000;
         if (isPlaying) {
            setPlaying(false);
         }
         detectActiveWordFromScroll();
         transcriptBufferRef.current = [];
    };

    const handleScroll = () => {
      syncPopupPercentage();
      
      if (!isAutoScrolling.current) {
        lastManualInteractionRef.current = Date.now();
        if (isPlaying) {
            setPlaying(false);
            currentVelocity.current = 0; 
        }
        if (detectWordThrottle.current) cancelAnimationFrame(detectWordThrottle.current);
        detectWordThrottle.current = requestAnimationFrame(() => {
            detectActiveWordFromScroll();
        });
      }
      isAutoScrolling.current = false;
    };
    
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchmove', handleWheel, { passive: true });
    container.addEventListener('scroll', handleScroll);
    
    return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchmove', handleWheel);
        container.removeEventListener('scroll', handleScroll);
    };
  }, [setPlaying, isPlaying, scrollContainerRef, syncPopupPercentage, detectActiveWordFromScroll]);

  return { detectActiveWordFromScroll, syncPopupPercentage };
};
export default usePrompterEngine;
