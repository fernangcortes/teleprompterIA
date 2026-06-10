import React from "react";
import { 
  ChevronLeft, ChevronRight, Mic, MicOff, Pause, Play, 
  Rabbit, Type, Monitor, Volume2, Gauge 
} from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { usePlayback } from "../../context/PlaybackContext";
import Tooltip from "../common/Tooltip";

interface RightSidebarProps {
  onToggleVoice: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onToggleVoice }) => {
  const {
    rightSidebarOpen,
    setRightSidebarOpen,
    theme,
    fontSize,
    setFontSize,
    margin,
    setMargin,
    speed,
    setSpeed,
    voiceScrollOffset,
    setVoiceScrollOffset,
    noiseThreshold,
    setNoiseThreshold,
    showShortcutOverlay,
    setShowShortcutOverlay,
    rightSidebarWidth,
    setRightSidebarWidth
  } = useConfig();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth - deltaX));
      setRightSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const {
    isPlaying,
    setPlaying,
    isVoiceMode,
    currentVolume,
    liveTranscript
  } = usePlayback();

  if (!rightSidebarOpen) {
    return (
      <button 
        onClick={() => setRightSidebarOpen(true)} 
        className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-24 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-l-2xl flex items-center justify-center text-white/50 hover:text-white transition-all z-40 border-y border-l border-white/10 shadow-lg cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>
    );
  }

  return (
    <div className="relative flex z-50 h-full" style={{ width: rightSidebarWidth }}>
      <aside 
        className="absolute inset-y-0 right-0 flex flex-col py-6 px-4 gap-6 border-l shadow-2xl backdrop-blur-md bg-opacity-95" 
        style={{ width: rightSidebarWidth, backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}
      >
          <div className="flex items-center justify-between w-full mb-2">
             <button 
               onClick={() => setRightSidebarOpen(false)} 
               className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
             >
                <ChevronRight size={20} />
             </button>
             <span className="font-bold text-xs uppercase tracking-wider opacity-50 pr-2">Controles</span>
          </div>

          <div className="flex flex-col gap-4 w-full">
              <Tooltip label="Acompanha a sua fala automaticamente usando Inteligência Artificial. (Atalho: V)" side="left" className="w-full">
                <button 
                    id="btn-voice"
                    onClick={onToggleVoice} 
                    className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 relative border-2 cursor-pointer ${isVoiceMode ? 'border-red-500 text-white bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5'}`}
                >
                    {isVoiceMode && <span className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-20" />}
                    {isVoiceMode ? <Mic size={20} className="relative z-10" /> : <MicOff size={20} />}
                    <span className="font-bold whitespace-nowrap relative z-10">Modo de Voz</span>
                    <span className="ml-auto text-xs opacity-50 font-mono relative z-10">(V)</span>
                </button>
              </Tooltip>

              <Tooltip label="Inicia a rolagem no modo manual, ou pausa a escuta no modo voz. (Atalho: Espaço)" side="left" className="w-full">
                <button 
                    id="btn-play"
                    onClick={() => {
                        if (!isPlaying && speed === 0) {
                            setSpeed(20);
                            setPlaying(true);
                        } else {
                            setPlaying(!isPlaying);
                        }
                    }} 
                    className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02] active:scale-95 duration-300 relative group border cursor-pointer`}
                    style={{ 
                        background: isPlaying ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` : 'rgba(255,255,255,0.05)', 
                        borderColor: isPlaying ? 'transparent' : 'rgba(255,255,255,0.2)',
                        color: '#fff' 
                    }}
                >
                    {isPlaying && <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-50" style={{ backgroundColor: theme.primaryColor }}></div>}
                    {isPlaying ? <Pause size={24} fill="#fff" className="text-white relative z-10" /> : <Play size={24} fill="#fff" className="text-white ml-1 relative z-10" />}
                    <span className="font-bold whitespace-nowrap relative z-10" style={{ color: isPlaying ? theme.backgroundColor : '#fff' }}>{isPlaying ? 'Pausar' : 'Iniciar'}</span>
                    <span className="ml-auto text-xs font-mono relative z-10" style={{ color: isPlaying ? `${theme.backgroundColor}99` : 'rgba(255,255,255,0.6)' }}>(Espaço)</span>
                </button>
              </Tooltip>
            <Tooltip label="Exibe um guia flutuante de atalhos. Arraste para mover, scroll para redimensionar. (Atalho: /)" side="right" className="w-full">
              <button 
                id="btn-shortcuts" 
                onClick={() => setShowShortcutOverlay(p => !p)} 
                className={`w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10 cursor-pointer`} 
                style={{ color: showShortcutOverlay ? theme.primaryColor : theme.textColor }}
              >
                 <span className="text-lg leading-none">⌨</span>
                 <span className="font-medium text-sm whitespace-nowrap">Guia de Atalhos</span>
                 <span className="ml-auto text-xs opacity-50 font-mono">(/)</span>
              </button>
            </Tooltip>
          </div>

          <div className="w-full h-px bg-white/10 my-1" />

          <div className="flex flex-col gap-8 w-full pb-6 overflow-y-auto no-scrollbar">
               {/* Speed */}
               <Tooltip label="Velocidade da rolagem automática." side="left" className="w-full">
                 <div className="flex flex-col gap-3 w-full group">
                     <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                         <div className="flex items-center gap-2">
                             <Rabbit size={18}/>
                             <span className="text-sm font-medium whitespace-nowrap">Velocidade <span className="ml-1 text-[10px] font-mono opacity-50">(J/L, M/N ou ↑↓)</span></span>
                         </div>
                         <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{speed}%</span>
                     </div>
                     <input 
                       id="btn-speed" 
                       type="range" 
                       min="0" 
                       max="100" 
                       value={speed} 
                       onChange={(e) => setSpeed(Number(e.target.value))} 
                       className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                       style={{ accentColor: theme.secondaryColor } as any} 
                     />
                 </div>
               </Tooltip>

               {/* Font Size */}
               <Tooltip label="Tamanho da fonte para o texto do roteiro." side="left" className="w-full">
                 <div className="flex flex-col gap-3 w-full group">
                     <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                         <div className="flex items-center gap-2">
                             <Type size={18}/>
                             <span className="text-sm font-medium whitespace-nowrap">Tamanho <span className="ml-1 text-[10px] font-mono opacity-50">(+/-)</span></span>
                         </div>
                         <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{fontSize}px</span>
                     </div>
                     <input 
                       id="btn-font" 
                       type="range" 
                       min="20" 
                       max="120" 
                       value={fontSize} 
                       onChange={(e) => setFontSize(Number(e.target.value))} 
                       className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                       style={{ accentColor: theme.primaryColor } as any} 
                     />
                 </div>
               </Tooltip>
               
               {/* Margin */}
               <Tooltip label="Define as margens laterais do texto para melhorar a leitura." side="left" className="w-full">
                 <div className="flex flex-col gap-3 w-full group">
                     <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                         <div className="flex items-center gap-2">
                             <Monitor size={18}/>
                             <span className="text-sm font-medium whitespace-nowrap">Margem <span className="ml-1 text-[10px] font-mono opacity-50">([ / ])</span></span>
                         </div>
                         <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{margin}%</span>
                     </div>
                     <input 
                       id="btn-margin" 
                       type="range" 
                       min="0" 
                       max="40" 
                       value={margin} 
                       onChange={(e) => setMargin(Number(e.target.value))} 
                       className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                       style={{ accentColor: theme.primaryColor } as any} 
                     />
                 </div>
               </Tooltip>

               {isVoiceMode && (
                   <>
                      {/* Noise Gate */}
                      <Tooltip label="O quão forte você precisa falar para a IA te escutar. Útil em locais ruidosos." side="left" className="w-full">
                        <div className="flex flex-col gap-3 w-full group">
                            <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                                <div className="flex items-center gap-2">
                                    <Volume2 size={18}/>
                                    <span className="text-sm font-medium whitespace-nowrap">Ruído (Gate)</span>
                                </div>
                                <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{noiseThreshold}</span>
                            </div>
                            <div className="relative w-full h-3 rounded-full overflow-hidden bg-black/30 border border-white/10">
                                <div 
                                  className="absolute top-0 left-0 h-full transition-all duration-75" 
                                  style={{ width: `${Math.min(currentVolume * 2, 100)}%`, backgroundColor: theme.textColor, opacity: 0.5 }} 
                                />
                                <input 
                                  id="btn-noise" 
                                  type="range" 
                                  min="0" 
                                  max="50" 
                                  step="1" 
                                  value={noiseThreshold} 
                                  onChange={(e) => setNoiseThreshold(Number(e.target.value))} 
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                                />
                                <div 
                                  className="absolute h-full w-[2px] bg-red-500 z-0 shadow-[0_0_5px_red]" 
                                  style={{ left: `${noiseThreshold * 2}%` }} 
                                />
                            </div>
                        </div>
                      </Tooltip>

                      {/* Offset */}
                      <Tooltip label="Onde o texto de foco da leitura para quando você fala. Ajuda a olhar melhor para a câmera." side="left" className="w-full">
                        <div className="flex flex-col gap-3 w-full group">
                            <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                                <div className="flex items-center gap-2">
                                    <Gauge size={18}/>
                                    <span className="text-sm font-medium whitespace-nowrap">Delay Lógico</span>
                                </div>
                                <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">
                                  {voiceScrollOffset > 0 ? '+' : ''}{voiceScrollOffset}%
                                </span>
                            </div>
                            <input 
                              id="btn-offset" 
                              type="range" 
                              min="-50" 
                              max="50" 
                              step="1" 
                              value={voiceScrollOffset} 
                              onChange={(e) => setVoiceScrollOffset(Number(e.target.value))} 
                              className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                              style={{ accentColor: theme.primaryColor } as any} 
                            />
                        </div>
                      </Tooltip>
                   </>
               )}
          </div>

          {isVoiceMode && liveTranscript && (
             <div className="absolute top-4 right-full mr-4 pointer-events-none z-50 w-56">
               <div 
                 className="backdrop-blur-md px-4 py-2 rounded-xl text-sm font-mono border shadow-lg bg-opacity-90 animate-in fade-in slide-in-from-right-2 text-right break-words" 
                 style={{ 
                   backgroundColor: theme.backgroundColor, 
                   color: theme.textColor, 
                   borderColor: `${theme.textColor}22` 
                 }}
               >
                  {liveTranscript.slice(-30)}
               </div>
             </div>
          )}
          {/* Drag Resizing Handle */}
          <div 
            className="absolute top-0 left-0 w-[6px] h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500 transition-colors z-50 group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-blue-500/50 group-active:bg-blue-500 transition-colors" />
          </div>
       </aside>
    </div>
  );
};

export default RightSidebar;
