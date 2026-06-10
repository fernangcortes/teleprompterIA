import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useConfig } from "../context/ConfigContext";
import { usePlayback } from "../context/PlaybackContext";
import { ParsedParagraph, ParsedWord } from "../types";
import { normalizeText, findBestMatch } from "../utils/text";

export const useVoiceTracking = (parsedText: ParsedParagraph[]) => {
  const { noiseThreshold, voiceTolerance } = useConfig();
  const {
    isVoiceMode,
    voiceStatus,
    setPlaying,
    setVoiceMode,
    setVoiceStatus,
    setCountdownValue,
    setActiveWordId,
    setLiveTranscript,
    setCurrentVolume,
    liveTranscript,
    currentVolume,
    transcriptBufferRef,
    ignoreVoiceUntilRef,
    activeWordId
  } = usePlayback();

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const volumeCheckIntervalRef = useRef<any>(null);
  const lastLoudNoiseTime = useRef<number>(0);
  const shouldBeOn = useRef(false);

  const allWords = useMemo(() => parsedText.flatMap(p => p.words), [parsedText]);
  const allWordsRef = useRef<ParsedWord[]>([]);
  useEffect(() => { allWordsRef.current = allWords; }, [allWords]);

  const activeWordIdRef = useRef(activeWordId);
  useEffect(() => { activeWordIdRef.current = activeWordId; }, [activeWordId]);

  const voiceToleranceRef = useRef(voiceTolerance);
  useEffect(() => { voiceToleranceRef.current = voiceTolerance; }, [voiceTolerance]);

  const initAudioAnalysis = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (volumeCheckIntervalRef.current) clearInterval(volumeCheckIntervalRef.current);
        
        volumeCheckIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const volume = Math.min(100, Math.round((average / 255) * 200)); 
            setCurrentVolume(volume);

            if (volume > noiseThreshold) {
                lastLoudNoiseTime.current = Date.now();
            }
        }, 50);
    } catch (e) {
        console.error("Audio Context Error", e);
    }
  };

  const stopVoiceMode = useCallback(() => {
    shouldBeOn.current = false;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    } catch (e) {}
    
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    if (volumeCheckIntervalRef.current) clearInterval(volumeCheckIntervalRef.current);

    setVoiceMode(false);
    setVoiceStatus('idle');
    setActiveWordId(null);
    setPlaying(false);
    setLiveTranscript("");
    setCurrentVolume(0);
  }, [setVoiceMode, setVoiceStatus, setActiveWordId, setPlaying, setLiveTranscript, setCurrentVolume]);

  const startRecognition = useCallback(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      
      // Prevent running multiple Web Speech instances
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onerror = (event: any) => {
        console.error("Erro no SpeechRecognition:", event.error);
        if (event.error === 'not-allowed') {
          shouldBeOn.current = false;
          stopVoiceMode();
        }
      };

      recognition.onend = () => {
        if (shouldBeOn.current) {
             console.log("Reiniciando motor de voz...");
             setTimeout(() => {
               if (shouldBeOn.current) {
                 try {
                   recognition.start(); 
                 } catch (err) {
                   console.error("Erro ao reiniciar SpeechRecognition", err);
                 }
               }
             }, 300);
        }
      };

      recognition.onresult = (event: any) => {
         if (Date.now() < ignoreVoiceUntilRef.current) return;
         if (Date.now() - lastLoudNoiseTime.current > 1000) return; 

         const resultIndex = event.resultIndex;
         const results = event.results;
         
         let currentInterim = "";
         if (!results[resultIndex].isFinal) {
             currentInterim = results[resultIndex][0].transcript;
         } else {
             const finalTranscript = results[resultIndex][0].transcript;
             const words = normalizeText(finalTranscript).split(/\s+/);
             transcriptBufferRef.current.push(...words);
             if (transcriptBufferRef.current.length > 50) {
                 transcriptBufferRef.current = transcriptBufferRef.current.slice(-50);
             }
         }

         const interimClean = normalizeText(currentInterim);
         const interimWords = interimClean ? interimClean.split(/\s+/) : [];
         
         const fullStream = [...transcriptBufferRef.current, ...interimWords];
         
         const WINDOW_SIZE = 8; 
         const spokenSnippet = fullStream.slice(-WINDOW_SIZE); 
         
         setLiveTranscript(currentInterim || (fullStream.slice(-5).join(" ")));

         if (spokenSnippet.length < 1) return;

         const currentActiveId = activeWordIdRef.current;
         const currentWords = allWordsRef.current;
         const currentIndex = currentActiveId 
            ? currentWords.findIndex(w => w.id === currentActiveId) 
            : 0;
         
         const SEARCH_BACK = 10;
         const SEARCH_FWD = 15;

         const strictStart = Math.max(0, currentIndex - SEARCH_BACK);
         const strictEnd = Math.min(currentWords.length, currentIndex + SEARCH_FWD);
         
         const match = findBestMatch(spokenSnippet, currentWords, strictStart, strictEnd, voiceToleranceRef.current);

         if (match.score >= 0.5 && match.index !== -1) {
             const targetWord = currentWords[match.index];
             if (targetWord && targetWord.id !== currentActiveId) {
                 setActiveWordId(targetWord.id);
             }
         }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      stopVoiceMode();
    }
  }, [ignoreVoiceUntilRef, setActiveWordId, setLiveTranscript, transcriptBufferRef, stopVoiceMode]);

  const startCountdown = useCallback(() => {
    setVoiceMode(true);
    setVoiceStatus('countdown');
    setCountdownValue(3);
    initAudioAnalysis(); 

    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
      } else {
        clearInterval(timer);
        setVoiceStatus('active');
        setCountdownValue(0);
        setPlaying(true);
        shouldBeOn.current = true;
        transcriptBufferRef.current = []; 
        startRecognition();
      }
    }, 1000);
  }, [setVoiceMode, setVoiceStatus, setCountdownValue, setPlaying, startRecognition, transcriptBufferRef]);

  const toggleVoice = useCallback(() => {
    if (isVoiceMode) {
      stopVoiceMode();
    } else {
      startCountdown();
    }
  }, [isVoiceMode, stopVoiceMode, startCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeOn.current = false;
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        }
      } catch (e) {}
      if (volumeCheckIntervalRef.current) clearInterval(volumeCheckIntervalRef.current);
    };
  }, []);

  return { toggleVoice, liveTranscript, currentVolume, stopVoiceMode };
};
export default useVoiceTracking;
