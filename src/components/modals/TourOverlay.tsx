import React, { useState, useEffect, useRef } from "react";
import { X, Lock, CheckCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { useCourse } from "../../context/CourseContext";
import { TELEPROMPTER_COURSE } from "../../constants/courseLessons";

export const TourOverlay: React.FC = () => {
  const {
    theme,
    setLeftSidebarOpen,
    setRightSidebarOpen,
    leftSidebarOpen,
    rightSidebarOpen,
    isEditorOpen,
    showChat,
    textEditorWidth,
    showSettings
  } = useConfig();

  const {
    isCourseActive,
    currentStepIndex,
    currentStep,
    isStepValidated,
    stepTasksProgress,
    dragPosition,
    setDragPosition,
    exitCourse,
    nextStep,
    prevStep
  } = useCourse();

  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
     if (!isCourseActive) return;
     const step = TELEPROMPTER_COURSE[currentStepIndex];
     if (!step) return;
     
     // Abre sidebars automaticamente caso o elemento em destaque dependa delas
     const target = step.targetElementSelector;
     if (target) {
         if (['#btn-editor', '#btn-chat', '#btn-theme', '#btn-mirror', '#btn-popup'].some(sel => target.includes(sel))) {
             setLeftSidebarOpen(true);
         }
         if (['#btn-voice', '#btn-play', '#btn-speed', '#btn-font', '#btn-margin', '#btn-offset'].some(sel => target.includes(sel))) {
             setRightSidebarOpen(true);
         }
     }

     const updatePosition = () => {
          if (showSettings) {
             setStyle({ top: 20, right: 20, left: 'auto', transform: 'none' });
             return;
          }
          if (!target || target === '.app-layout-grid') {
             setStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
             return;
          }
          const el = document.querySelector(target);
          if (el) {
              const rect = el.getBoundingClientRect();
              // Se for o editor de texto ou botões da esquerda, posiciona à direita do elemento
              if (['#btn-editor', '#btn-chat', '#btn-theme', '#btn-mirror', '#btn-popup', '#editor-textarea'].some(sel => target.includes(sel))) {
                  const additionalOffset = (isEditorOpen && !target.includes('#editor-textarea')) ? textEditorWidth : 0;
                  setStyle({ top: Math.max(20, rect.top - 10), left: rect.right + additionalOffset + 20 });
              } else if (['#btn-voice', '#btn-play', '#btn-speed', '#btn-font', '#btn-margin', '#btn-offset'].some(sel => target.includes(sel))) {
                  setStyle({ top: Math.max(20, rect.top - 10), right: window.innerWidth - rect.left + 20 });
              } else {
                  setStyle({ top: rect.bottom + 20, left: Math.max(20, rect.left) });
              }
          } else {
              setStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
          }
      };

      // Highlight target element
      let prevEl: HTMLElement | null = null;
      if (target) {
         const el = document.querySelector(target);
         if (el) {
             el.classList.add('course-spotlight-active');
             prevEl = el as HTMLElement;
         }
      }

      // delay to allow sidebar to open and layout
      const timer = setTimeout(updatePosition, 350);
      window.addEventListener('resize', updatePosition);
      return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', updatePosition);
          if (prevEl) {
              prevEl.classList.remove('course-spotlight-active');
          }
      };
  }, [isCourseActive, currentStepIndex, setLeftSidebarOpen, setRightSidebarOpen, leftSidebarOpen, rightSidebarOpen, isEditorOpen, showChat, textEditorWidth, showSettings]);

  if (!isCourseActive) return null;
  const step = TELEPROMPTER_COURSE[currentStepIndex] || TELEPROMPTER_COURSE[0];

  const handleClose = () => exitCourse();
  const handleNext = () => nextStep();
  const handlePrev = () => prevStep();

  const handlePointerDown = (e: React.PointerEvent) => {
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest('button') || targetEl.closest('a') || targetEl.closest('input') || targetEl.closest('textarea')) {
      return;
    }
    const cardElement = e.currentTarget as HTMLElement;
    const rect = cardElement.getBoundingClientRect();
    
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    cardElement.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragPosition({
      x: e.clientX - dragStartOffset.current.x,
      y: e.clientY - dragStartOffset.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const isNextDisabled = step.type === 'test' && !isStepValidated;

  const currentStyle: React.CSSProperties = {
    ...style,
    backgroundColor: theme.surfaceColor,
    color: theme.textColor,
    ...(dragPosition ? {
      left: dragPosition.x,
      top: dragPosition.y,
      right: 'auto',
      transform: 'none'
    } : {})
  };

  const totalTasks = step.tasks?.length || 0;
  const completedCount = step.tasks ? stepTasksProgress.filter(Boolean).length : 0;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const getStatusMessage = () => {
    if (totalTasks <= 1) return "Aguardando ação...";
    if (completedCount === 0) return "Aguardando 1ª tarefa...";
    if (completedCount < totalTasks) {
      const nextTaskIdx = step.tasks ? step.tasks.findIndex((_, idx) => !stepTasksProgress[idx]) : -1;
      const nextTaskName = (step.tasks && nextTaskIdx !== -1) ? step.tasks[nextTaskIdx] : "";
      const displayName = nextTaskName && nextTaskName.length > 25 
        ? nextTaskName.substring(0, 22) + "..." 
        : (nextTaskName || "");
      return `${completedCount}ª tarefa concluída! Falta: ${displayName}`;
    }
    return "Todas as tarefas concluídas!";
  };

  const statusMsg = getStatusMessage();

  const advanceButtonStyle: React.CSSProperties = {};
  if (step.type === 'test') {
    if (totalTasks > 1) {
      advanceButtonStyle.background = `linear-gradient(to right, ${theme.primaryColor} ${progressPercent}%, ${theme.textColor}15 ${progressPercent}%)`;
      advanceButtonStyle.color = progressPercent > 0 ? theme.backgroundColor : theme.textColor;
      advanceButtonStyle.border = `1px solid ${theme.primaryColor}44`;
      advanceButtonStyle.opacity = isNextDisabled ? 0.85 : 1;
      advanceButtonStyle.cursor = isNextDisabled ? 'not-allowed' : 'pointer';
    } else {
      advanceButtonStyle.backgroundColor = isStepValidated ? theme.primaryColor : `${theme.primaryColor}22`;
      advanceButtonStyle.color = isStepValidated ? theme.backgroundColor : theme.textColor;
      advanceButtonStyle.border = `1px solid ${theme.primaryColor}44`;
      advanceButtonStyle.opacity = isStepValidated ? 1 : 0.65;
      advanceButtonStyle.cursor = isStepValidated ? 'pointer' : 'not-allowed';
    }
  } else {
    advanceButtonStyle.backgroundColor = theme.primaryColor;
    advanceButtonStyle.color = theme.backgroundColor;
    advanceButtonStyle.cursor = 'pointer';
  }

  return (
    <div className="fixed inset-0 z-[100] flex pointer-events-none select-none">
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`p-6 rounded-xl w-[350px] shadow-2xl absolute border border-white/10 pointer-events-auto select-text cursor-grab active:cursor-grabbing ${
          isDragging ? "" : "transition-all duration-300"
        }`} 
        style={currentStyle}
      >
        <button onClick={handleClose} className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition cursor-pointer">
          <X size={20}/>
        </button>
        <h3 className="text-lg font-bold mb-2 flex flex-col gap-1.5" style={{ color: theme.primaryColor }}>
          <span className="text-xs uppercase tracking-wider opacity-60 font-mono">Passo {currentStepIndex + 1} de {TELEPROMPTER_COURSE.length}</span>
          <span>{step.title}</span>
        </h3>
        
        {step.type === 'test' && (
          <div className="mb-4">
            {isStepValidated ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/20">
                <CheckCircle size={13} />
                <span>Objetivo Concluído!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Lock size={13} />
                <span>{statusMsg}</span>
              </div>
            )}
          </div>
        )}

        <p className="mb-4 font-medium leading-relaxed opacity-85 text-xs">
          {step.instruction}
        </p>

        {step.tasks && (
          <div className="mb-5 bg-black/20 border border-white/5 rounded-lg p-3 space-y-2 select-none">
            <div className="text-[10px] font-bold tracking-wider opacity-50 uppercase mb-1" style={{ color: theme.primaryColor }}>Tarefas da Lição:</div>
            {step.tasks.map((taskText, idx) => {
              const isDone = stepTasksProgress[idx];
              return (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    isDone ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'border-white/20 text-transparent'
                  }`}>
                    <Check size={10} className="stroke-[3]" />
                  </div>
                  <span className={`leading-tight text-[11px] ${isDone ? 'line-through opacity-50' : 'opacity-85'}`}>{taskText}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="text-[10px] font-bold opacity-50 font-mono">
              {step.type === 'test' ? 'LABORATÓRIO' : 'TEORIA'}
            </span>
            <div className="flex gap-2">
                <button 
                  onClick={handlePrev} 
                  disabled={currentStepIndex === 0} 
                  className="p-1.5 rounded border border-current opacity-70 hover:opacity-100 disabled:opacity-30 font-medium transition text-xs cursor-pointer flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={isNextDisabled}
                  className="px-3 py-1.5 rounded font-bold shadow-md transition-all text-xs flex items-center gap-1" 
                  style={advanceButtonStyle}
                >
                    <span>
                      {currentStepIndex === TELEPROMPTER_COURSE.length - 1 
                        ? "Concluir" 
                        : totalTasks > 1 && completedCount < totalTasks
                          ? `Avançar (${completedCount}/${totalTasks})`
                          : "Avançar"
                      }
                    </span>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
