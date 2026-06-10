import React from "react";
import { 
  ChevronLeft, ChevronRight, FileText, MessageCircle, Settings, 
  FlipHorizontal, MoveVertical, MonitorPlay, RefreshCw, CircleHelp, Info 
} from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { usePlayback } from "../../context/PlaybackContext";
import Tooltip from "../common/Tooltip";

interface LeftSidebarProps {
  onRestart: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onRestart }) => {
  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    theme,
    isEditorOpen,
    setEditorOpen,
    showChat,
    setShowChat,
    showSettings,
    setShowSettings,
    mirrorX,
    setMirrorX,
    mirrorY,
    setMirrorY,
    setShowDocs,
    setIsTourActive,
    setTourStep,
    showShortcutOverlay,
    setShowShortcutOverlay,
    apiKey,
    deepseekApiKey,
    aiModel,
    leftSidebarWidth,
    setLeftSidebarWidth
  } = useConfig();

  const hasApiKey = aiModel === 'deepseek-v4-flash' ? !!deepseekApiKey : !!apiKey;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
      setLeftSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const { isPlaying } = usePlayback();

  // Open projection window in a new tab/window
  const togglePopup = () => {
    const win = window.open(
      window.location.origin + "?projection=true", 
      "PrompterWindow", 
      "width=1000,height=800,menubar=no,toolbar=no,location=no"
    );
    if (!win) {
      alert("Pop-up bloqueado! Por favor, libere popups para este site.");
    }
  };

  if (!leftSidebarOpen) {
    return (
      <button 
        onClick={() => setLeftSidebarOpen(true)} 
        className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-24 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-r-2xl flex items-center justify-center text-white/50 hover:text-white transition-all z-40 border-y border-r border-white/10 shadow-lg cursor-pointer"
      >
        <ChevronRight size={24} />
      </button>
    );
  }

  return (
    <div className="relative flex z-50 h-full" style={{ width: leftSidebarWidth }}>
      <aside 
        className="absolute inset-y-0 left-0 flex flex-col py-6 px-4 gap-6 border-r shadow-2xl backdrop-blur-md bg-opacity-95" 
        style={{ width: leftSidebarWidth, backgroundColor: theme.headerColor, borderColor: `${theme.textColor}22` }}
      >
         <div className="flex items-center justify-between w-full mb-2">
             <div className="flex items-center gap-3 select-none hover:scale-[1.02] transition-transform cursor-pointer">
                {theme.logoImage ? (
                  <img src={theme.logoImage} alt="App Logo" className="w-8 h-auto rounded-lg object-contain" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-white text-xs shadow-lg" 
                    style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                  >
                    {theme.appName.slice(0, 2).toLowerCase()}
                  </div>
                )}
                <span className="font-bold text-sm tracking-wide opacity-90 truncate">{theme.appName}</span>
             </div>
             <button 
               onClick={() => setLeftSidebarOpen(false)} 
               className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
             >
                <ChevronLeft size={20} />
             </button>
         </div>

         <div className="flex flex-col gap-3 flex-1 w-full">
            <Tooltip label="Abre o editor de texto para gerenciar seu roteiro. (Atalho: E)" side="right" className="w-full">
              <button 
                id="btn-editor" 
                onClick={() => setEditorOpen(!isEditorOpen)} 
                className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${isEditorOpen ? 'shadow-inner' : 'hover:bg-white/10'}`} 
                style={{ 
                  backgroundColor: isEditorOpen ? theme.textColor : 'transparent', 
                  color: isEditorOpen ? theme.backgroundColor : theme.textColor 
                }}
              >
                  <FileText size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Editor de Texto</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(E)</span>
              </button>
            </Tooltip>
            
            <Tooltip label="Fale com nosso mentor IA para dicas de apresentação e uso do estúdio." side="right" className="w-full">
              <button 
                id="btn-chat" 
                onClick={() => { if (!hasApiKey) { setShowSettings(true); } else { setShowChat(!showChat); } }} 
                className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] relative cursor-pointer`} 
                style={{ 
                  backgroundColor: showChat ? theme.textColor : 'transparent', 
                  color: showChat ? theme.backgroundColor : theme.textColor 
                }}
              >
                  <MessageCircle size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Mentor de Palco</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(?)</span>
              </button>
            </Tooltip>

            <Tooltip label="Configurações (Geral, IA, Temas e Identidade) (Atalho: T)" side="right" className="w-full">
              <button 
                id="btn-theme" 
                onClick={() => setShowSettings(!showSettings)} 
                className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`} 
                style={{ 
                  backgroundColor: showSettings ? theme.textColor : 'transparent', 
                  color: showSettings ? theme.backgroundColor : theme.textColor 
                }}
              >
                  <Settings size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Configurações</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(T)</span>
              </button>
            </Tooltip>

            <div className="w-full h-px my-2" style={{ backgroundColor: `${theme.textColor}22` }}></div>

            <Tooltip label="Inverte o texto horizontalmente para leitura em espelho reflexivo." side="right" className="w-full">
              <button 
                id="btn-mirror" 
                onClick={() => setMirrorX(!mirrorX)} 
                className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition hover:bg-white/5 cursor-pointer ${mirrorX ? '' : 'opacity-60'}`} 
                style={{ color: mirrorX ? theme.primaryColor : theme.textColor }}
              >
                  <FlipHorizontal size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Espelhar (X)</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(X)</span>
              </button>
            </Tooltip>
            
            <Tooltip label="Inverte o texto verticalmente." side="right" className="w-full">
              <button 
                id="btn-flip-y" 
                onClick={() => setMirrorY(!mirrorY)} 
                className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition hover:bg-white/5 cursor-pointer ${mirrorY ? '' : 'opacity-60'}`} 
                style={{ color: mirrorY ? theme.primaryColor : theme.textColor }}
              >
                  <MoveVertical size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Espelhar (Y)</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(Y)</span>
              </button>
            </Tooltip>
            
            <Tooltip label="Abre a janela de projeção secundária. (Atalho: W)" side="right" className="w-full">
              <button 
                id="btn-popup" 
                onClick={togglePopup} 
                className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition hover:scale-[1.02] border cursor-pointer bg-transparent`} 
                style={{ 
                  color: theme.textColor, 
                  borderColor: `${theme.textColor}33` 
                }}
              >
                  <MonitorPlay size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Janela Externa</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(W)</span>
              </button>
            </Tooltip>
            
            <Tooltip label="Retorna o texto para a posição inicial." side="right" className="w-full">
              <button 
                id="btn-restart" 
                onClick={onRestart} 
                className="w-full flex items-center justify-start gap-4 p-3.5 hover:bg-white/5 rounded-xl opacity-70 hover:opacity-100 transition cursor-pointer"
              >
                  <RefreshCw size={20} />
                  <span className="font-medium text-sm whitespace-nowrap">Reiniciar Texto</span>
                  <span className="ml-auto text-xs opacity-50 font-mono">(R)</span>
              </button>
            </Tooltip>
         </div>

         <div className="flex flex-col gap-3 mt-auto w-full">
           <Tooltip label="Revise o tour guiado por todas as funções principais." side="right" className="w-full">
             <button 
               id="btn-tour" 
               onClick={() => { setIsTourActive(true); setTourStep(0); }} 
               className="w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10 cursor-pointer" 
               style={{ color: theme.primaryColor }}
             >
                 <CircleHelp size={18} />
                 <span className="font-medium text-sm whitespace-nowrap">Tour Guiado</span>
                 <span className="ml-auto text-xs opacity-50 font-mono">(H)</span>
             </button>
           </Tooltip>
           <Tooltip label="Veja informações sobre o desenvolvedor e roadmap do projeto." side="right" className="w-full">
             <button 
               id="btn-docs" 
               onClick={() => setShowDocs(true)} 
               className="w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10 cursor-pointer" 
               style={{ color: theme.textColor }}
             >
                 <Info size={18} />
                 <span className="font-medium text-sm whitespace-nowrap">Info & Roadmap</span>
                 <span className="ml-auto text-xs opacity-50 font-mono">(I)</span>
             </button>
           </Tooltip>
         </div>

         <div className="flex flex-col w-full">
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
          
          {/* Drag Resizing Handle */}
          <div 
            className="absolute top-0 right-0 w-[6px] h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500 transition-colors z-50 group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-0 right-0 w-[2px] h-full bg-transparent group-hover:bg-blue-500/50 group-active:bg-blue-500 transition-colors" />
          </div>
       </aside>
    </div>
  );
};

export default LeftSidebar;
