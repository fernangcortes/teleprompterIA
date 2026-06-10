import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ThemeConfig, PrompterState } from "../types";
import { PRESETS, DEFAULT_TEXT } from "../constants";
import { gemini } from "../services/gemini";

interface ConfigContextProps {
  text: string;
  apiKey: string;
  deepseekApiKey: string;
  aiModel: string;
  fontSize: number;
  margin: number;
  speed: number;
  initialPushSpeed: number;
  mirrorX: boolean;
  mirrorY: boolean;
  theme: ThemeConfig;
  isEditorOpen: boolean;
  voiceScrollOffset: number;
  noiseThreshold: number;
  voiceTolerance: number;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  showShortcutOverlay: boolean;
  shortcutPos: { x: number; y: number } | null;
  shortcutSize: number;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  textEditorWidth: number;
  aiPanelWidth: number;
  editorFontSize: number;
  
  // UI Dialog States (non-persisted config states)
  showSettings: boolean;
  showDonation: boolean;
  showDocs: boolean;
  showChat: boolean;
  isTourActive: boolean;
  tourStep: number;

  setText: (t: string) => void;
  setApiKey: (k: string) => void;
  setDeepseekApiKey: (k: string) => void;
  setAiModel: (m: string) => void;
  setFontSize: (s: number) => void;
  setMargin: (m: number) => void;
  setSpeed: (s: number) => void;
  setInitialPushSpeed: (s: number) => void;
  setMirrorX: (m: boolean) => void;
  setMirrorY: (m: boolean) => void;
  setTheme: (t: ThemeConfig) => void;
  setEditorOpen: (o: boolean) => void;
  setVoiceScrollOffset: (o: number) => void;
  setNoiseThreshold: (t: number) => void;
  setVoiceTolerance: (t: number) => void;
  setLeftSidebarOpen: (o: boolean) => void;
  setRightSidebarOpen: (o: boolean) => void;
  setShowShortcutOverlay: (o: boolean | ((p: boolean) => boolean)) => void;
  setShortcutPos: (pos: { x: number; y: number } | null) => void;
  setShortcutSize: (s: number | ((p: number) => number)) => void;
  setLeftSidebarWidth: (w: number) => void;
  setRightSidebarWidth: (w: number) => void;
  setTextEditorWidth: (w: number) => void;
  setAiPanelWidth: (w: number) => void;
  setEditorFontSize: (s: number | ((p: number) => number)) => void;
  
  setShowSettings: (s: boolean) => void;
  setShowDonation: (s: boolean) => void;
  setShowDocs: (s: boolean) => void;
  setShowChat: (s: boolean) => void;
  setIsTourActive: (a: boolean) => void;
  setTourStep: (step: number | ((p: number) => number)) => void;

  updateConfig: (updates: Partial<PrompterState>) => void;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<{
    text: string;
    apiKey: string;
    deepseekApiKey: string;
    aiModel: string;
    fontSize: number;
    margin: number;
    speed: number;
    initialPushSpeed: number;
    mirrorX: boolean;
    mirrorY: boolean;
    theme: ThemeConfig;
    isEditorOpen: boolean;
    voiceScrollOffset: number;
    noiseThreshold: number;
    voiceTolerance: number;
    leftSidebarOpen: boolean;
    rightSidebarOpen: boolean;
    showShortcutOverlay: boolean;
    shortcutPos: { x: number; y: number } | null;
    shortcutSize: number;
    leftSidebarWidth: number;
    rightSidebarWidth: number;
    textEditorWidth: number;
    aiPanelWidth: number;
    editorFontSize: number;
  }>(() => {
    const saved = localStorage.getItem("teleprompteria_state_v1");
    const defaultConfig = {
      text: DEFAULT_TEXT,
      apiKey: (process.env as any).GEMINI_API_KEY || "",
      deepseekApiKey: (process.env as any).DEEPSEEK_API_KEY || "",
      aiModel: "gemini-2.5-flash",
      fontSize: 64,
      margin: 0,
      speed: 30,
      initialPushSpeed: 10,
      mirrorX: true,
      mirrorY: false,
      theme: PRESETS.minimal,
      isEditorOpen: false,
      voiceScrollOffset: 0,
      noiseThreshold: 10,
      voiceTolerance: 2,
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      showShortcutOverlay: false,
      shortcutPos: null,
      shortcutSize: 11,
      leftSidebarWidth: 256,
      rightSidebarWidth: 256,
      textEditorWidth: 650,
      aiPanelWidth: 320,
      editorFontSize: 16,
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude ephemeral/playback values from config state loading if any
        return { ...defaultConfig, ...parsed };
      } catch (e) {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  // Modal dialog states
  const [showSettings, setShowSettings] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Sync with API Key and Model service
  useEffect(() => {
    gemini.setApiKey(config.apiKey);
    gemini.setDeepseekApiKey(config.deepseekApiKey);
    gemini.setModel(config.aiModel);
  }, [config.apiKey, config.deepseekApiKey, config.aiModel]);

  // Sync config state to localStorage
  useEffect(() => {
    localStorage.setItem("teleprompteria_state_v1", JSON.stringify(config));
  }, [config]);

  const updateConfig = useCallback((updates: Partial<PrompterState>) => {
    setConfig((prev) => {
      const next = { ...prev };
      // Map updates to config keys if they exist in config
      Object.keys(updates).forEach((k) => {
        if (k in prev) {
          (next as any)[k] = (updates as any)[k];
        }
      });
      return next;
    });
  }, []);

  const setText = useCallback((text: string) => setConfig((p) => ({ ...p, text })), []);
  const setApiKey = useCallback((apiKey: string) => setConfig((p) => ({ ...p, apiKey })), []);
  const setDeepseekApiKey = useCallback((deepseekApiKey: string) => setConfig((p) => ({ ...p, deepseekApiKey })), []);
  const setAiModel = useCallback((aiModel: string) => setConfig((p) => ({ ...p, aiModel })), []);
  const setFontSize = useCallback((fontSize: number) => setConfig((p) => ({ ...p, fontSize })), []);
  const setMargin = useCallback((margin: number) => setConfig((p) => ({ ...p, margin })), []);
  const setSpeed = useCallback((speed: number) => setConfig((p) => ({ ...p, speed })), []);
  const setInitialPushSpeed = useCallback((initialPushSpeed: number) => setConfig((p) => ({ ...p, initialPushSpeed })), []);
  const setMirrorX = useCallback((mirrorX: boolean) => setConfig((p) => ({ ...p, mirrorX })), []);
  const setMirrorY = useCallback((mirrorY: boolean) => setConfig((p) => ({ ...p, mirrorY })), []);
  const setTheme = useCallback((theme: ThemeConfig) => setConfig((p) => ({ ...p, theme })), []);
  const setEditorOpen = useCallback((isEditorOpen: boolean) => setConfig((p) => ({ ...p, isEditorOpen })), []);
  const setVoiceScrollOffset = useCallback((voiceScrollOffset: number) => setConfig((p) => ({ ...p, voiceScrollOffset })), []);
  const setNoiseThreshold = useCallback((noiseThreshold: number) => setConfig((p) => ({ ...p, noiseThreshold })), []);
  const setVoiceTolerance = useCallback((voiceTolerance: number) => setConfig((p) => ({ ...p, voiceTolerance })), []);
  const setLeftSidebarOpen = useCallback((leftSidebarOpen: boolean) => setConfig((p) => ({ ...p, leftSidebarOpen })), []);
  const setRightSidebarOpen = useCallback((rightSidebarOpen: boolean) => setConfig((p) => ({ ...p, rightSidebarOpen })), []);
  const setShowShortcutOverlay = useCallback((val: boolean | ((p: boolean) => boolean)) => {
    setConfig((p) => ({
      ...p,
      showShortcutOverlay: typeof val === "function" ? val(p.showShortcutOverlay) : val,
    }));
  }, []);
  const setShortcutPos = useCallback((shortcutPos: { x: number; y: number } | null) => setConfig((p) => ({ ...p, shortcutPos })), []);
  const setShortcutSize = useCallback((val: number | ((p: number) => number)) => {
    setConfig((p) => ({
      ...p,
      shortcutSize: typeof val === "function" ? val(p.shortcutSize) : val,
    }));
  }, []);
  const setLeftSidebarWidth = useCallback((leftSidebarWidth: number) => setConfig((p) => ({ ...p, leftSidebarWidth })), []);
  const setRightSidebarWidth = useCallback((rightSidebarWidth: number) => setConfig((p) => ({ ...p, rightSidebarWidth })), []);
  const setTextEditorWidth = useCallback((textEditorWidth: number) => setConfig((p) => ({ ...p, textEditorWidth })), []);
  const setAiPanelWidth = useCallback((aiPanelWidth: number) => setConfig((p) => ({ ...p, aiPanelWidth })), []);
  const setEditorFontSize = useCallback((val: number | ((p: number) => number)) => {
    setConfig((p) => ({
      ...p,
      editorFontSize: typeof val === "function" ? val(p.editorFontSize) : val,
    }));
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        showSettings,
        showDonation,
        showDocs,
        showChat,
        isTourActive,
        tourStep,
        setText,
        setApiKey,
        setDeepseekApiKey,
        setAiModel,
        setFontSize,
        setMargin,
        setSpeed,
        setInitialPushSpeed,
        setMirrorX,
        setMirrorY,
        setTheme,
        setEditorOpen,
        setVoiceScrollOffset,
        setNoiseThreshold,
        setVoiceTolerance,
        setLeftSidebarOpen,
        setRightSidebarOpen,
        setShowShortcutOverlay,
        setShortcutPos,
        setShortcutSize,
        setLeftSidebarWidth,
        setRightSidebarWidth,
        setTextEditorWidth,
        setAiPanelWidth,
        setEditorFontSize,
        setShowSettings,
        setShowDonation,
        setShowDocs,
        setShowChat,
        setIsTourActive,
        setTourStep,
        updateConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
