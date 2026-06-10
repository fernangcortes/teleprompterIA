import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { TELEPROMPTER_COURSE, CourseStep } from "../constants/courseLessons";
import { DEFAULT_TEXT } from "../constants";
import { useConfig } from "./ConfigContext";
import { usePlayback } from "./PlaybackContext";

interface CourseContextProps {
  isCourseActive: boolean;
  currentStepIndex: number;
  currentStep: CourseStep;
  isStepValidated: boolean;
  isProjectionActive: boolean;
  stepTasksProgress: boolean[];
  dragPosition: { x: number; y: number } | null;
  setDragPosition: (pos: { x: number; y: number } | null) => void;
  startCourse: () => void;
  exitCourse: () => void;
  resetCourse: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CourseContext = createContext<CourseContextProps | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useConfig();
  const playback = usePlayback();

  const [isCourseActive, setIsCourseActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("teleprompteria_course_active");
    return saved === "true";
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const saved = localStorage.getItem("teleprompteria_course_step");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isStepValidated, setIsStepValidated] = useState<boolean>(false);
  const [isProjectionActive, setIsProjectionActive] = useState<boolean>(false);
  const [stepTasksProgress, setStepTasksProgress] = useState<boolean[]>([]);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Track step reset status to prevent multiple runs and lockups
  const hasResetForStep = useRef<number>(-1);

  // Capture theme and settings upon entering step 5
  const enterSettings = useRef<{
    initialPushSpeed: number;
    appName: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("teleprompteria_course_active", String(isCourseActive));
  }, [isCourseActive]);

  useEffect(() => {
    localStorage.setItem("teleprompteria_course_step", String(currentStepIndex));
  }, [currentStepIndex]);

  const currentStep = TELEPROMPTER_COURSE[currentStepIndex] || TELEPROMPTER_COURSE[0];

  // Reset tasks progress, drag position, and clean up panels/configs on step changes
  useEffect(() => {
    setStepTasksProgress([]);
    setDragPosition(null);

    if (isCourseActive) {
      const step = TELEPROMPTER_COURSE[currentStepIndex];
      if (step) {
        if (step.id === 'test_settings_custom') {
          // Verify if we already reset settings for this step index to prevent lockups
          if (hasResetForStep.current === currentStepIndex) {
            return;
          }
          hasResetForStep.current = currentStepIndex;

          // Close editor & AI panel
          config.setEditorOpen(false);
          
          // Capture current settings upon entering the step
          enterSettings.current = {
            initialPushSpeed: config.initialPushSpeed,
            appName: config.theme.appName || "teleprompterIA",
            primaryColor: config.theme.primaryColor || "#3b82f6",
            backgroundColor: config.theme.backgroundColor || "#000000",
            textColor: config.theme.textColor || "#ffffff"
          };
        } else {
          // Close settings panel when leaving Step 5
          config.setShowSettings(false);
          enterSettings.current = null;
        }

        // Always reset projection active state on step transition
        setIsProjectionActive(false);
        // Ping projection window to check if it's still alive/active
        playback.broadcastChannel?.postMessage({ type: "PING_PROJECTION" });
      }
    } else {
      hasResetForStep.current = -1;
      enterSettings.current = null;
      setIsProjectionActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, isCourseActive]);

  // Limpa o texto padrão do editor ao entrar no passo 3 (Ingestão de Roteiro) para o usuário escrever do zero
  useEffect(() => {
    if (isCourseActive && currentStep.id === 'test_text_input') {
      if (config.text === DEFAULT_TEXT) {
        config.setText("");
      }
    }
  }, [isCourseActive, currentStepIndex, currentStep.id, config.text]);

  // Listen to the BroadcastChannel to detect when the projection window is active
  useEffect(() => {
    const channel = playback.broadcastChannel;
    if (!channel) return;

    const handleMessage = (e: MessageEvent) => {
      // O pop-up secundário solicita o estado inicial ao abrir
      if (e.data?.type === "REQUEST_INITIAL_STATE") {
        setIsProjectionActive(true);
      }
      // Outros eventos de sincronização que confirmem que o pop-up está aberto
      if (e.data?.type === "INITIAL_STATE") {
        setIsProjectionActive(true);
      }
      if (e.data?.type === "PROJECTION_CLOSED") {
        setIsProjectionActive(false);
      }
    };

    channel.addEventListener("message", handleMessage);
    // Também enviamos um ping inicial para ver se a janela já está ativa
    channel.postMessage({ type: "PING_PROJECTION" });

    return () => {
      channel.removeEventListener("message", handleMessage);
    };
  }, [playback.broadcastChannel]);

  const [hotkeysTested, setHotkeysTested] = useState<Record<string, boolean>>({});
  const [selectionText, setSelectionText] = useState("");

  // Reset hotkeys tested when step changes
  useEffect(() => {
    setHotkeysTested({});
  }, [currentStepIndex]);

  // Track document selection for selection validation step
  useEffect(() => {
    if (!isCourseActive) return;
    const handleSelectionChange = () => {
      const sel = window.getSelection()?.toString() || "";
      setSelectionText(sel);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isCourseActive]);

  // Track global key presses for key test step
  useEffect(() => {
    if (!isCourseActive || currentStep.id !== 'test_global_shortcuts') return;

    const handleGlobalKey = (e: KeyboardEvent) => {
      const code = e.code;
      if (["Space", "KeyV", "KeyR", "KeyB", "Slash"].includes(code) || e.key === "/") {
        const keyLabel = code === "Slash" || e.key === "/" ? "Slash" : code;
        setHotkeysTested(prev => ({ ...prev, [keyLabel]: true }));
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isCourseActive, currentStep.id]);

  // Run validation of the current step when configurations or states change
  useEffect(() => {
    if (!isCourseActive) {
      setIsStepValidated(false);
      return;
    }

    if (currentStep.type === 'info') {
      setIsStepValidated(true);
      return;
    }

    if (currentStep.validateTasks) {
      // Skip validation if settings reset is pending to avoid premature validation using stale configs
      if (currentStep.id === 'test_settings_custom' && hasResetForStep.current !== currentStepIndex) {
        return;
      }

      const results = currentStep.validateTasks(
        {
          text: config.text,
          fontSize: config.fontSize,
          margin: config.margin,
          speed: config.speed,
          mirrorX: config.mirrorX,
          mirrorY: config.mirrorY,
          theme: config.theme,
          voiceScrollOffset: config.voiceScrollOffset,
          showSettings: config.showSettings,
          leftSidebarOpen: config.leftSidebarOpen,
          rightSidebarOpen: config.rightSidebarOpen,
          showShortcutOverlay: config.showShortcutOverlay,
          isEditorOpen: config.isEditorOpen,
          initialPushSpeed: config.initialPushSpeed,
          noiseThreshold: config.noiseThreshold,
        },
        {
          isPlaying: playback.isPlaying,
          isVoiceMode: playback.isVoiceMode,
        },
        isProjectionActive,
        hotkeysTested,
        selectionText,
        dragPosition !== null,
        enterSettings.current
      );

      // Persist completed tasks so they don't reset if conditions change (e.g. selection is lost)
      setStepTasksProgress(prev => {
        const next = [...prev];
        while (next.length < results.length) {
          next.push(false);
        }
        let changed = false;
        results.forEach((res, idx) => {
          if (res && !next[idx]) {
            next[idx] = true;
            changed = true;
          }
        });

        // Atomic validation synchronization inside the functional updater to prevent desync
        const isValid = next.every(val => val);
        setIsStepValidated(isValid);

        return changed ? next : prev;
      });
    } else if (currentStep.validate) {
      const isValid = currentStep.validate(
        {
          text: config.text,
          fontSize: config.fontSize,
          margin: config.margin,
          speed: config.speed,
          mirrorX: config.mirrorX,
          mirrorY: config.mirrorY,
          theme: config.theme,
          voiceScrollOffset: config.voiceScrollOffset,
          showSettings: config.showSettings,
          leftSidebarOpen: config.leftSidebarOpen,
          rightSidebarOpen: config.rightSidebarOpen,
          showShortcutOverlay: config.showShortcutOverlay,
          isEditorOpen: config.isEditorOpen,
          initialPushSpeed: config.initialPushSpeed,
          noiseThreshold: config.noiseThreshold,
        },
        {
          isPlaying: playback.isPlaying,
          isVoiceMode: playback.isVoiceMode,
        },
        isProjectionActive,
        hotkeysTested
      );
      setIsStepValidated(isValid);
    } else {
      setIsStepValidated(true);
    }
  }, [
    isCourseActive,
    currentStepIndex,
    currentStep,
    config.text,
    config.fontSize,
    config.margin,
    config.speed,
    config.mirrorX,
    config.mirrorY,
    config.theme,
    config.voiceScrollOffset,
    config.showSettings,
    config.leftSidebarOpen,
    config.rightSidebarOpen,
    config.showShortcutOverlay,
    config.isEditorOpen,
    config.initialPushSpeed,
    config.noiseThreshold,
    playback.isPlaying,
    playback.isVoiceMode,
    isProjectionActive,
    hotkeysTested,
    selectionText,
    dragPosition,
  ]);

  const startCourse = useCallback(() => {
    setIsCourseActive(true);
    // Abre as sidebars para garantir que o usuário veja as ferramentas
    config.setLeftSidebarOpen(true);
    config.setRightSidebarOpen(true);
  }, [config]);

  const exitCourse = useCallback(() => {
    setIsCourseActive(false);
  }, []);

  const resetCourse = useCallback(() => {
    setCurrentStepIndex(0);
    setIsStepValidated(false);
    setIsProjectionActive(false);
    setStepTasksProgress([]);
    setDragPosition(null);
    hasResetForStep.current = -1;

    // Reset core configurations to defaults so no steps are pre-validated
    config.setText(DEFAULT_TEXT);
    config.setEditorOpen(false);
    config.setMirrorX(true);
    config.setMirrorY(false);
    config.setSpeed(30);
    config.setFontSize(64);
    config.setMargin(0);
    config.setVoiceScrollOffset(0);
    config.setNoiseThreshold(10);
    config.setVoiceTolerance(2);
    config.setLeftSidebarOpen(true);
    config.setRightSidebarOpen(true);
    config.setShowShortcutOverlay(false);
    playback.setPlaying(false);
    playback.setVoiceMode(false);
  }, [config, playback]);

  const nextStep = useCallback(() => {
    if ((currentStep.type === 'info' || isStepValidated) && currentStepIndex < TELEPROMPTER_COURSE.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsStepValidated(false);
    } else if (currentStepIndex === TELEPROMPTER_COURSE.length - 1) {
      setIsCourseActive(false);
    }
  }, [currentStepIndex, isStepValidated, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsStepValidated(false);
    }
  }, [currentStepIndex]);

  return (
    <CourseContext.Provider
      value={{
        isCourseActive,
        currentStepIndex,
        currentStep,
        isStepValidated,
        isProjectionActive,
        stepTasksProgress,
        dragPosition,
        setDragPosition,
        startCourse,
        exitCourse,
        resetCourse,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};
export default useCourse;
