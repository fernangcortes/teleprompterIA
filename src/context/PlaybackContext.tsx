import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useConfig } from "./ConfigContext";

interface PlaybackContextProps {
  isPlaying: boolean;
  isVoiceMode: boolean;
  voiceStatus: 'idle' | 'countdown' | 'active';
  countdownValue: number;
  activeWordId: string | null;
  liveTranscript: string;
  currentVolume: number;

  setPlaying: (playing: boolean) => void;
  setVoiceMode: (v: boolean) => void;
  setVoiceStatus: (s: 'idle' | 'countdown' | 'active') => void;
  setCountdownValue: (c: number) => void;
  setActiveWordId: (id: string | null) => void;
  setLiveTranscript: (t: string) => void;
  setCurrentVolume: (v: number) => void;
  
  // Ref handles for hooks
  lastManualInteractionRef: React.MutableRefObject<number>;
  ignoreVoiceUntilRef: React.MutableRefObject<number>;
  transcriptBufferRef: React.MutableRefObject<string[]>;

  broadcastChannel: BroadcastChannel | null;
  registerInteraction: () => void;
  postMessageToChannel: (message: any) => void;
}

const PlaybackContext = createContext<PlaybackContextProps | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, fontSize, margin, mirrorX, mirrorY, voiceScrollOffset } = useConfig();
  
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'countdown' | 'active'>('idle');
  const [countdownValue, setCountdownValue] = useState(0);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentVolume, setCurrentVolume] = useState(0);

  // Interaction times & timers
  const lastManualInteractionRef = useRef<number>(0);
  const ignoreVoiceUntilRef = useRef<number>(0);
  const transcriptBufferRef = useRef<string[]>([]);

  // Create BroadcastChannel for multi-window syncing
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("teleprompteria-sync");
    setBroadcastChannel(channel);

    return () => {
      channel.close();
    };
  }, []);

  const registerInteraction = useCallback(() => {
    lastManualInteractionRef.current = Date.now();
  }, []);

  const postMessageToChannel = useCallback((message: any) => {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(message);
      } catch (e) {
        console.error("Failed to broadcast message", e);
      }
    }
  }, [broadcastChannel]);

  const setPlaying = useCallback((playing: boolean) => {
    if (playing) registerInteraction();
    setIsPlayingState(playing);
    postMessageToChannel({ type: "PLAYBACK_STATE", isPlaying: playing });
  }, [registerInteraction, postMessageToChannel]);

  const setVoiceMode = useCallback((v: boolean) => {
    setIsVoiceMode(v);
    postMessageToChannel({ type: "PLAYBACK_STATE", isVoiceMode: v });
  }, [postMessageToChannel]);

  // Sync activeWordId
  useEffect(() => {
    postMessageToChannel({ type: "PLAYBACK_STATE", activeWordId });
  }, [activeWordId, postMessageToChannel]);

  // Broadcast configurations whenever they change, so the popup is updated in real time
  useEffect(() => {
    postMessageToChannel({
      type: "CONFIG_SYNC",
      config: { fontSize, margin, mirrorX, mirrorY, theme, voiceScrollOffset }
    });
  }, [fontSize, margin, mirrorX, mirrorY, theme, voiceScrollOffset, postMessageToChannel]);

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        isVoiceMode,
        voiceStatus,
        countdownValue,
        activeWordId,
        liveTranscript,
        currentVolume,
        setPlaying,
        setVoiceMode,
        setVoiceStatus,
        setCountdownValue,
        setActiveWordId,
        setLiveTranscript,
        setCurrentVolume,
        lastManualInteractionRef,
        ignoreVoiceUntilRef,
        transcriptBufferRef,
        broadcastChannel,
        registerInteraction,
        postMessageToChannel
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("usePlayback must be used within a PlaybackProvider");
  }
  return context;
};
