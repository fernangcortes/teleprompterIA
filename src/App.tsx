import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useConfig } from "./context/ConfigContext";
import { usePlayback } from "./context/PlaybackContext";
import { usePrompterEngine } from "./hooks/usePrompterEngine";
import { useVoiceTracking } from "./hooks/useVoiceTracking";
import { normalizeText } from "./utils/text";
import { ParsedParagraph, ParsedWord } from "./types";

// Layout components
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";
import TextEditor from "./components/layout/TextEditor";

// Prompter elements
import ParagraphTimeline from "./components/prompter/ParagraphTimeline";
import CountdownOverlay from "./components/prompter/CountdownOverlay";
import FloatingShortcuts from "./components/prompter/FloatingShortcuts";
import ProjectionView from "./components/prompter/ProjectionView";

// Modals
import SettingsModal from "./components/modals/SettingsModal";
import DocsModal from "./components/modals/DocsModal";
import DonationModal from "./components/modals/DonationModal";
import TourOverlay from "./components/modals/TourOverlay";
import MentorChat from "./components/mentor/MentorChat";

export const AppContent: React.FC = () => {
  const {
    text,
    theme,
    fontSize,
    setFontSize,
    margin,
    setMargin,
    speed,
    setSpeed,
    mirrorX,
    setMirrorX,
    mirrorY,
    setMirrorY,
    voiceScrollOffset,
    isEditorOpen,
    setEditorOpen,
    showSettings,
    setShowSettings,
    showDocs,
    setShowDocs,
    isTourActive,
    setIsTourActive,
    setTourStep,
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    showShortcutOverlay,
    setShowShortcutOverlay
  } = useConfig();

  const {
    isPlaying,
    setPlaying,
    isVoiceMode,
    voiceStatus,
    activeWordId,
    setActiveWordId,
    registerInteraction,
    broadcastChannel,
    postMessageToChannel
  } = usePlayback();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Parse text into structured paragraph and word elements
  const parsedText: ParsedParagraph[] = useMemo(() => {
    let wordCount = 0;
    return text.split('\n').map((line, idx) => {
      const words: ParsedWord[] = line.split(' ').map((w) => ({
        id: `w-${wordCount++}`,
        text: w,
        clean: normalizeText(w)
      }));
      return { originalIndex: idx, words };
    });
  }, [text]);

  // Hook driving smooth scroll animation ticks
  const { detectActiveWordFromScroll, syncPopupPercentage } = usePrompterEngine(scrollContainerRef);

  // Hook driving microphone levels and voice text tracking
  const { toggleVoice, stopVoiceMode } = useVoiceTracking(parsedText);

  // Scroll smoothly to a specific word when clicked
  const scrollToWord = useCallback((wordId: string) => {
    setActiveWordId(wordId);
    registerInteraction(); 

    const localEl = document.getElementById(wordId);
    if (localEl && scrollContainerRef.current) {
      const containerHeight = scrollContainerRef.current.clientHeight;
      const targetTop = localEl.offsetTop - (containerHeight * 0.35);
      scrollContainerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    // Broadcast active word scroll to projection window
    postMessageToChannel({
      type: "PLAYBACK_STATE",
      activeWordId: wordId
    });
  }, [setActiveWordId, registerInteraction, postMessageToChannel]);

  const handleRestart = useCallback(() => { 
      setPlaying(false);
      setActiveWordId(null);
      stopVoiceMode();
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); 
      postMessageToChannel({ type: "SCROLL_SYNC", percentage: 0 });
  }, [setPlaying, setActiveWordId, stopVoiceMode, postMessageToChannel]);

  const jumpToParagraph = (idx: number) => {
     const firstWordId = parsedText.find(p => p.originalIndex === idx)?.words[0]?.id;
     if (firstWordId) scrollToWord(firstWordId);
  };

  // Sync state when requested by projection window
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleBroadcastRequest = (e: MessageEvent) => {
      if (e.data?.type === "REQUEST_INITIAL_STATE") {
        postMessageToChannel({
          type: "INITIAL_STATE",
          text,
          activeWordId,
          config: { fontSize, margin, mirrorX, mirrorY, theme, voiceScrollOffset }
        });
      }
    };

    broadcastChannel.addEventListener("message", handleBroadcastRequest);
    return () => {
      broadcastChannel.removeEventListener("message", handleBroadcastRequest);
    };
  }, [broadcastChannel, text, activeWordId, fontSize, margin, mirrorX, mirrorY, theme, voiceScrollOffset, postMessageToChannel]);

  // Central keyboard handler for command keys and shortcut dispatching
  const handleKeyboardTrigger = useCallback((e: { code: string; key: string; shiftKey: boolean; altKey: boolean }) => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') return;

    if (e.code === "Space" || e.code === "KeyK") { 
        if (activeTag === 'button') {
            (document.activeElement as HTMLElement)?.blur();
        }
        if (!isPlaying && speed === 0) {
            setSpeed(20);
            setPlaying(true);
        } else {
            setPlaying(!isPlaying);
        }
    }
    if (e.code === "KeyE") { setEditorOpen(!isEditorOpen); }
    if (e.code === "KeyT") { setShowSettings(true); }
    if (e.code === "KeyI") { setShowDocs(true); }
    if (e.code === "KeyH" || (e.shiftKey && e.code === "Slash")) { setIsTourActive(true); setTourStep(0); }
    if (e.code === "KeyR") { handleRestart(); }
    if (e.code === "KeyX") { setMirrorX(!mirrorX); }
    if (e.code === "KeyY") { setMirrorY(!mirrorY); }
    if (e.code === "KeyV") { toggleVoice(); }
    if (e.code === "KeyB") { 
        const newState = !(leftSidebarOpen && rightSidebarOpen);
        setLeftSidebarOpen(newState);
        setRightSidebarOpen(newState);
    }
    if (e.key === "/") { setShowShortcutOverlay(p => !p); }

    if (e.code === "KeyM" || e.code === "KeyL" || e.code === "ArrowUp") {
        registerInteraction();
        let amount = 2; 
        if (e.shiftKey) amount = 5; 
        if (e.altKey) amount = 1; 
        setSpeed(Math.min(speed + amount, 100));
    }
    if (e.code === "KeyN" || e.code === "KeyJ" || e.code === "ArrowDown") {
        registerInteraction();
        let amount = 2; 
        if (e.shiftKey) amount = 5; 
        if (e.altKey) amount = 1; 
        setSpeed(Math.max(speed - amount, 0));
    }
    
    if (e.code === "Equal" || e.code === "NumpadAdd") {
        setFontSize(Math.min(fontSize + 4, 200));
    }
    if (e.code === "Minus" || e.code === "NumpadSubtract") {
        setFontSize(Math.max(fontSize - 4, 16));
    }
    if (e.key === "]" || e.code === "BracketRight") {
        setMargin(Math.min(margin + 2, 40));
    }
    if (e.key === "[" || e.code === "BracketLeft") {
        setMargin(Math.max(margin - 2, 0));
    }
  }, [
    isPlaying, speed, isEditorOpen, mirrorX, mirrorY, leftSidebarOpen, rightSidebarOpen, 
    fontSize, margin, setPlaying, setSpeed, setEditorOpen, setShowSettings, setShowDocs, 
    setIsTourActive, setTourStep, handleRestart, setMirrorX, setMirrorY, toggleVoice, 
    setLeftSidebarOpen, setRightSidebarOpen, setShowShortcutOverlay, registerInteraction, 
    setFontSize, setMargin
  ]);

  // Listen for local keyboard shortcuts
  useEffect(() => {
    const localKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts if user is focusing an editor
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;
      
      // Let standard browser keydown trigger
      handleKeyboardTrigger({
        code: e.code,
        key: e.key,
        shiftKey: e.shiftKey,
        altKey: e.altKey
      });

      // Prevent scrolling defaults for specific hotkeys
      if (["Space", "ArrowUp", "ArrowDown", "KeyK"].includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", localKeyDown);
    return () => window.removeEventListener("keydown", localKeyDown);
  }, [handleKeyboardTrigger]);

  // Listen for keyboard events forwarded from the projection window
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleBroadcastKey = (e: MessageEvent) => {
      if (e.data?.type === "KEY_EVENT" && e.data.event) {
        handleKeyboardTrigger(e.data.event);
      }
    };

    broadcastChannel.addEventListener("message", handleBroadcastKey);
    return () => {
      broadcastChannel.removeEventListener("message", handleBroadcastKey);
    };
  }, [broadcastChannel, handleKeyboardTrigger]);

  // Update HTML page title with the app name
  useEffect(() => {
    document.title = theme.appName;
  }, [theme.appName]);

  return (
    <div 
      className="h-screen w-screen flex flex-row overflow-hidden font-sans selection:bg-opacity-50" 
      style={{ 
        background: `radial-gradient(circle at top, ${theme.surfaceColor} 0%, ${theme.backgroundColor} 100%)`, 
        color: theme.textColor 
      }}
    >
      <style>{`
        ::selection { background-color: ${theme.primaryColor}; color: ${theme.backgroundColor}; }
        .prompter-text span.active-word { color: ${theme.activeWordColor}; text-shadow: 0 0 15px ${theme.primaryColor}CC; }
        ::-webkit-scrollbar-thumb { background: ${theme.surfaceColor}; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.primaryColor}; }
      `}</style>

      {/* LEFT SIDEBAR */}
      <LeftSidebar onRestart={handleRestart} />

      {/* CENTER VIEWPORT CONTAINER */}
      <div className="flex-1 relative flex overflow-hidden h-full min-w-0">
        {/* Voice Mode countdown timer overlay */}
        <CountdownOverlay />
        
        {/* Editor panel */}
        <TextEditor />

        {/* Text scroll display container */}
        <div 
          ref={scrollContainerRef} 
          className="flex-1 relative overflow-y-auto overflow-x-hidden flex justify-center no-scrollbar bg-transparent h-full"
        >
          {/* Focuser line guideline */}
          <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-center items-center opacity-30 mt-16 mb-24">
             <div 
               className="absolute w-full h-[2px] transition-all duration-300 shadow-[0_0_10px_currentColor]" 
               style={{ 
                 top: `${(0.32 + (voiceScrollOffset / 100)) * 100}%`, 
                 backgroundColor: theme.guideLineColor, 
                 color: theme.guideLineColor 
               }}
             />
          </div>
          
          <div 
            className="absolute top-0 left-0 right-0 h-32 z-10 pointer-events-none sticky" 
            style={{ background: `linear-gradient(to bottom, ${theme.backgroundColor} 0%, transparent 100%)` }} 
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none sticky" 
            style={{ background: `linear-gradient(to top, ${theme.backgroundColor} 0%, transparent 100%)` }} 
          />
          
          <div className="relative z-10 w-full min-h-screen">
            <div 
              className="prompter-text w-full px-4 text-left uppercase py-[50vh]" 
              style={{ 
                fontSize: `${fontSize}px`, 
                paddingLeft: `calc(${margin}% + 1rem)`, 
                paddingRight: `calc(${margin}% + 1rem)` 
              }}
            >
              {parsedText.map((paragraph, i) => (
                <p 
                  key={i} 
                  id={`para-${paragraph.originalIndex}`} 
                  className={`mb-[1.5em] leading-tight ${paragraph.words.length === 0 ? 'h-[1.5em]' : ''}`}
                >
                  {paragraph.words.map((word) => (
                     <React.Fragment key={word.id}>
                       <span 
                         id={word.id}
                         onClick={() => scrollToWord(word.id)}
                         className={`cursor-pointer transition-all duration-200 hover:brightness-150 ${activeWordId === word.id ? 'active-word' : ''}`}
                       >
                         {word.text}
                       </span>
                       {' '}
                     </React.Fragment>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Visual timeline dots */}
        <ParagraphTimeline onJump={jumpToParagraph} />
      </div>

      {/* RIGHT SIDEBAR */}
      <RightSidebar onToggleVoice={toggleVoice} />

      {/* DIALOGS AND FLOATING MODALS */}
      <SettingsModal />
      <DonationModal />
      <DocsModal />
      <MentorChat />
      <TourOverlay />
      <FloatingShortcuts />
    </div>
  );
};

export const App: React.FC = () => {
  const isProjection = new URLSearchParams(window.location.search).has("projection");

  if (isProjection) {
    return <ProjectionView />;
  }

  return <AppContent />;
};

export default App;
