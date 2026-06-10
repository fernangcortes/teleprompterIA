import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { TOUR_STEPS } from "../../constants";

export const TourOverlay: React.FC = () => {
  const {
    isTourActive,
    tourStep,
    theme,
    setIsTourActive,
    setTourStep,
    setLeftSidebarOpen,
    setRightSidebarOpen
  } = useConfig();

  const [style, setStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
     if (!isTourActive) return;
     const step = TOUR_STEPS[tourStep];
     
     if (step.target) {
         if (['btn-editor', 'btn-ai', 'btn-chat', 'btn-theme', 'btn-mirror', 'btn-popup'].includes(step.target)) {
             setLeftSidebarOpen(true);
         }
         if (['right-sidebar', 'btn-voice', 'btn-speed', 'btn-font', 'btn-margin'].includes(step.target)) {
             setRightSidebarOpen(true);
         }
     }

     const updatePosition = () => {
          if (!step.target) {
             setStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
             return;
          }
          const el = document.getElementById(step.target);
          if (el) {
              const rect = el.getBoundingClientRect();
              if (['btn-editor', 'btn-ai', 'btn-chat', 'btn-theme', 'btn-mirror', 'btn-popup'].includes(step.target)) {
                  setStyle({ top: Math.max(20, rect.top), left: rect.right + 20 });
              } else if (['right-sidebar', 'btn-voice', 'btn-speed', 'btn-font', 'btn-margin'].includes(step.target)) {
                  setStyle({ top: Math.max(20, rect.top), right: window.innerWidth - rect.left + 20 });
              } else {
                  setStyle({ top: rect.bottom + 20, left: rect.left });
              }
          } else {
              setStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
          }
      };

      // Highlight target element
      let prevEl: HTMLElement | null = null;
      if (step.target) {
         const el = document.getElementById(step.target);
         if (el) {
             el.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50', 'z-50', 'relative', 'rounded-xl');
             prevEl = el;
         }
      }

      // delay to allow sidebar to open and layout
      const timer = setTimeout(updatePosition, 350);
      window.addEventListener('resize', updatePosition);
      return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', updatePosition);
          if (prevEl) {
              prevEl.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50', 'z-50', 'relative', 'rounded-xl');
          }
      };
  }, [isTourActive, tourStep, setLeftSidebarOpen, setRightSidebarOpen]);

  if (!isTourActive) return null;
  const step = TOUR_STEPS[tourStep];

  const handleClose = () => setIsTourActive(false);
  const handleNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setIsTourActive(false);
    }
  };
  const handlePrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex pointer-events-auto">
      <div 
        className="p-6 rounded-xl w-[350px] shadow-2xl absolute transition-all duration-300 border border-white/10" 
        style={{ ...style, backgroundColor: theme.surfaceColor, color: theme.textColor }}
      >
        <button onClick={handleClose} className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition cursor-pointer">
          <X size={20}/>
        </button>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.primaryColor }}>
          {tourStep === 0 ? `Bem-vindo ao ${theme.appName || 'teleprompterIA'}!` : step.title}
        </h3>
        <p className="mb-6 font-medium leading-relaxed opacity-80 text-sm">
          {tourStep === 0 
            ? `Seja bem-vindo(a) ao seu novo ambiente profissional de teleprompter. Esta versão foi redesenhada para maximizar sua área de leitura, com barras de ferramentas laterais independentes e controles precisos. Vamos conhecer os atalhos e as novas funções para uma gravação impecável.` 
            : step.content}
        </p>
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold opacity-50">{tourStep + 1} de {TOUR_STEPS.length}</span>
            <div className="flex gap-2">
                <button 
                  onClick={handlePrev} 
                  disabled={tourStep === 0} 
                  className="px-3 py-1.5 rounded border border-current opacity-70 hover:opacity-100 disabled:opacity-30 font-medium transition text-xs cursor-pointer"
                >
                  Anterior
                </button>
                <button 
                  onClick={handleNext} 
                  className="px-3 py-1.5 rounded font-bold hover:scale-105 shadow-md transition text-xs cursor-pointer" 
                  style={{ backgroundColor: theme.primaryColor, color: theme.surfaceColor }}
                >
                    {tourStep === TOUR_STEPS.length - 1 ? "Concluir" : "Próximo"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
