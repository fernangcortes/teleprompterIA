import React, { useState, useEffect, useRef, useMemo } from "react";
import { ParsedParagraph, ThemeConfig } from "../../types";
import { normalizeText } from "../../utils/text";

export const ProjectionView: React.FC = () => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(64);
  const [margin, setMargin] = useState(0);
  const [mirrorX, setMirrorX] = useState(true);
  const [mirrorY, setMirrorY] = useState(false);
  const [voiceScrollOffset, setVoiceScrollOffset] = useState(0);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>({
    appName: "teleprompterIA",
    backgroundColor: "#0f172a",
    headerColor: "#0f172a",
    surfaceColor: "#1e293b",
    primaryColor: "#008280",
    secondaryColor: "#d0235b",
    textColor: "#ffffff",
    activeWordColor: "#fff7e6",
    guideLineColor: "#008280",
    logoImage: null,
    donationImage: null
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isSyncingFromMain = useRef(false);

  // Parse text into paragraphs and words
  const parsedText = useMemo(() => {
    let wordCount = 0;
    return text.split('\n').map((line, idx) => {
      const words = line.split(' ').map((w) => ({
        id: `w-${wordCount++}`,
        text: w,
        clean: normalizeText(w)
      }));
      return { originalIndex: idx, words };
    });
  }, [text]);

  // Set up Broadcast Channel for window syncing
  useEffect(() => {
    const channel = new BroadcastChannel("teleprompteria-sync");
    broadcastChannelRef.current = channel;

    // Send a message asking the main operator for the current text and settings
    channel.postMessage({ type: "REQUEST_INITIAL_STATE" });

    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;

      switch (e.data.type) {
        case "INITIAL_STATE":
          if (e.data.text !== undefined) setText(e.data.text);
          if (e.data.activeWordId !== undefined) setActiveWordId(e.data.activeWordId);
          if (e.data.config) {
            const cfg = e.data.config;
            if (cfg.fontSize !== undefined) setFontSize(cfg.fontSize);
            if (cfg.margin !== undefined) setMargin(cfg.margin);
            if (cfg.mirrorX !== undefined) setMirrorX(cfg.mirrorX);
            if (cfg.mirrorY !== undefined) setMirrorY(cfg.mirrorY);
            if (cfg.theme !== undefined) setTheme(cfg.theme);
            if (cfg.voiceScrollOffset !== undefined) setVoiceScrollOffset(cfg.voiceScrollOffset);
          }
          break;

        case "PLAYBACK_STATE":
          if (e.data.activeWordId !== undefined) {
            setActiveWordId(e.data.activeWordId);
            scrollToWord(e.data.activeWordId);
          }
          break;

        case "CONFIG_SYNC":
          if (e.data.config) {
            const cfg = e.data.config;
            if (cfg.fontSize !== undefined) setFontSize(cfg.fontSize);
            if (cfg.margin !== undefined) setMargin(cfg.margin);
            if (cfg.mirrorX !== undefined) setMirrorX(cfg.mirrorX);
            if (cfg.mirrorY !== undefined) setMirrorY(cfg.mirrorY);
            if (cfg.theme !== undefined) setTheme(cfg.theme);
            if (cfg.voiceScrollOffset !== undefined) setVoiceScrollOffset(cfg.voiceScrollOffset);
          }
          break;

        case "SCROLL_SYNC":
          const container = scrollContainerRef.current;
          if (!container) return;

          isSyncingFromMain.current = true;
          const percentage = e.data.percentage;
          const max = container.scrollHeight - container.clientHeight;
          const target = percentage * max;
          
          if (Math.abs(container.scrollTop - target) > 1) {
            container.scrollTop = target;
          }

          setTimeout(() => {
            isSyncingFromMain.current = false;
          }, 50);
          break;

        default:
          break;
      }
    };

    channel.addEventListener("message", handleMessage);

    // Forward keyboard events back to main window so operator commands can be executed
    const handleKeyDown = (e: KeyboardEvent) => {
      channel.postMessage({
        type: "KEY_EVENT",
        event: {
          code: e.code,
          key: e.key,
          shiftKey: e.shiftKey,
          altKey: e.altKey
        }
      });
      // Prevent default for common shortcuts
      if (['Space', 'KeyK', 'KeyR', 'KeyV', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Document title
    document.title = `${theme.appName} - Projeção`;

    return () => {
      channel.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeyDown);
      channel.close();
    };
  }, [theme.appName]);

  // Sync scroll percentage back to main operator window when scrolled in projection
  const handleScroll = () => {
    if (isSyncingFromMain.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const max = container.scrollHeight - container.clientHeight;
    const percentage = max > 0 ? container.scrollTop / max : 0;

    broadcastChannelRef.current?.postMessage({
      type: "SCROLL_SYNC",
      percentage
    });
  };

  // Scroll to active word automatically
  const scrollToWord = (wordId: string | null) => {
    if (!wordId) return;
    const container = scrollContainerRef.current;
    const el = document.getElementById(`proj-${wordId}`);
    if (container && el) {
      const containerHeight = container.clientHeight;
      const offsetRatio = 0.32 + (voiceScrollOffset / 100);
      const targetTop = el.offsetTop - (containerHeight * offsetRatio);
      
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="h-screen w-screen relative overflow-hidden font-sans select-none" 
      style={{ 
        background: `radial-gradient(circle at top, ${theme.surfaceColor} 0%, ${theme.backgroundColor} 100%)`,
        color: theme.textColor
      }}
    >
      <style>{`
        ::-webkit-scrollbar { width: 0px; }
        .word-span.active { 
          color: ${theme.activeWordColor}; 
          text-shadow: 0 0 15px ${theme.primaryColor}CC, 0 0 5px ${theme.primaryColor}AA; 
          filter: brightness(1.3);
        }
      `}</style>

      {/* READING GUIDE LINE */}
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

      {/* SHADOW FADE OVERLAYS */}
      <div 
        className="fixed top-0 left-0 right-0 h-32 z-10 pointer-events-none" 
        style={{ background: `linear-gradient(to bottom, ${theme.backgroundColor} 0%, transparent 100%)` }} 
      />
      <div 
        className="fixed bottom-0 left-0 right-0 h-32 z-10 pointer-events-none" 
        style={{ background: `linear-gradient(to top, ${theme.backgroundColor} 0%, transparent 100%)` }} 
      />

      {/* PROMPTER TEXT CONTAINER */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll scroll-behavior-auto no-scrollbar relative z-10"
      >
        <div 
          className="w-full text-left uppercase py-[50vh] transition-transform duration-300" 
          style={{ 
            fontSize: `${fontSize}px`, 
            paddingLeft: `calc(${margin}% + 1rem)`, 
            paddingRight: `calc(${margin}% + 1rem)`,
            transform: `scaleX(${mirrorX ? -1 : 1}) scaleY(${mirrorY ? -1 : 1})`,
            transformOrigin: "center center"
          }}
        >
          {parsedText.map((paragraph, i) => (
            <p key={i} className={`mb-[1.5em] leading-tight`}>
              {paragraph.words.map((word) => (
                <span 
                  key={word.id}
                  id={`proj-${word.id}`}
                  className={`word-span transition-all duration-200 ${activeWordId === word.id ? 'active' : ''}`}
                >
                  {word.text}{' '}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectionView;
