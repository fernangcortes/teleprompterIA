import React, { useState, useEffect, useRef } from "react";
import { Edit3, Sparkles, Upload, Save, X, RefreshCw, AlertCircle, Check, Trash2 } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { gemini } from "../../services/gemini";
import { DEFAULT_TEXT } from "../../constants";

export const TextEditor: React.FC = () => {
  const {
    isEditorOpen,
    setEditorOpen,
    text,
    setText,
    apiKey,
    deepseekApiKey,
    aiModel,
    theme,
    setShowSettings,
    textEditorWidth,
    setTextEditorWidth,
    aiPanelWidth,
    setAiPanelWidth,
    editorFontSize,
    setEditorFontSize,
    leftSidebarOpen,
    leftSidebarWidth,
    rightSidebarOpen,
    rightSidebarWidth
  } = useConfig();

  const hasApiKey = aiModel === 'deepseek-v4-flash' ? !!deepseekApiKey : !!apiKey;

  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [textHistory, setTextHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [aiError, setAiError] = useState<string | null>(null);

  // Selection state
  const [selectedText, setSelectedText] = useState<string>("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [selectionPrompt, setSelectionPrompt] = useState("");

  // AI Suggestion States (Preview & Diff review)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [originalParas, setOriginalParas] = useState<string[]>([]);
  const [suggestedParas, setSuggestedParas] = useState<string[]>([]);
  const [acceptedParas, setAcceptedParas] = useState<boolean[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");

  // Window resize tracking
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Helper to convert plain text with \n to HTML div blocks for paragraphs
  const textToHtml = (txt: string) => {
    if (!txt) return "<div><br></div>";
    return txt
      .split("\n")
      .map(line => {
        if (line === "") return "<div><br></div>";
        return `<div>${line}</div>`;
      })
      .join("");
  };

  // Sync text state to editor div innerHTML when changed from outside (AI, Undo, Import)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      editorRef.current.innerHTML = textToHtml(text);
    }
    isInternalChange.current = false;
  }, [text]);

  // Ctrl + MouseWheel font size zoom on editable div
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setEditorFontSize(s => Math.max(10, Math.min(60, s + (e.deltaY < 0 ? 1 : -1))));
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [setEditorFontSize, isEditorOpen]);

  // Horizontal drag resizing handler for editor
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = textEditorWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(300, Math.min(window.innerWidth * 0.9, startWidth + deltaX));
      setTextEditorWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Horizontal drag resizing handler for AI Panel
  const handleAIPanelMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = aiPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Dragging left (negative deltaX) increases width
      const newWidth = Math.max(260, Math.min(500, startWidth - deltaX));
      setAiPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Initialize history when editor opens
  useEffect(() => {
    if (isEditorOpen && textHistory.length === 0 && text) {
      setTextHistory([text]);
      setHistoryIndex(0);
    }
  }, [isEditorOpen, text, textHistory.length]);

  const handleTextChange = (newText: string) => {
    const currentHistory = textHistory.slice(0, historyIndex + 1);
    const newHistory = [...currentHistory, newText];
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setText(newText);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isInternalChange.current = true;
    handleTextChange(e.currentTarget.innerText);
  };

  // Handle selection changes inside contenteditable
  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const textVal = sel.toString();
      if (textVal.trim() !== "") {
        setSelectedText(textVal);
        setSavedRange(range.cloneRange());
      } else {
        setSelectedText("");
        setSavedRange(null);
      }
    } else {
      setSelectedText("");
      setSavedRange(null);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const fileContent = ev.target?.result as string;
        handleTextChange(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roteiro_teleprompterIA.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Undo / Redo on contenteditable
  const handleUndoRedo = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        // Redo
        if (historyIndex < textHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setText(textHistory[newIndex]);
        }
      } else {
        // Undo
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setText(textHistory[newIndex]);
        }
      }
    }
  };

  // AI Suggestion Apply (Combines original and accepted paragraphs)
  const applyAISuggestion = () => {
    if (!aiSuggestion) return;

    const isAligned = originalParas.length === suggestedParas.length;
    let finalTargetText = "";
    
    if (isAligned) {
      const finalTargetParas = originalParas.map((orig, idx) => {
        const sug = suggestedParas[idx];
        return (sug !== undefined && acceptedParas[idx]) ? sug : orig;
      });
      finalTargetText = finalTargetParas.join("\n");
    } else {
      finalTargetText = aiSuggestion;
    }
    
    if (savedRange && selectedText.trim() !== "") {
      // Restore range
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
      
      // Replace contents
      savedRange.deleteContents();
      savedRange.insertNode(document.createTextNode(finalTargetText));
      
      if (editorRef.current) {
        handleTextChange(editorRef.current.innerText);
      }
      setSelectedText("");
      setSavedRange(null);
    } else {
      handleTextChange(finalTargetText);
      if (editorRef.current) {
        editorRef.current.innerHTML = textToHtml(finalTargetText);
      }
    }
    setAiSuggestion(null);
  };

  // Perform AI action specifically on selected text
  const handleSelectionAIAction = async () => {
    if (!selectionPrompt || !savedRange) return;
    
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    
    try {
      const res = await gemini.generate(selectionPrompt, selectedText, text);
      const parsed = gemini.parseAIResponse(res);
      
      const orig = selectedText.split("\n");
      const sug = parsed.texto.split("\n");
      
      setOriginalParas(orig);
      setSuggestedParas(sug);
      setAcceptedParas(new Array(sug.length).fill(true));
      setAiSummary(parsed.resumo);
      setAiSuggestion(parsed.texto);
      
      setSelectionPrompt("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Erro de comunicação com a API.");
    } finally {
      setAiLoading(false);
    }
  };

  // Quick preset actions (grammar, tone, dynamics)
  const handleQuickAIAction = async (presetPrompt: string) => {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    
    const isSelectionActive = savedRange && selectedText.trim() !== "";
    const targetText = isSelectionActive ? selectedText : text;
       
    try {
      const res = await gemini.generate(presetPrompt, targetText, text);
      const parsed = gemini.parseAIResponse(res);
      
      const orig = targetText.split("\n");
      const sug = parsed.texto.split("\n");
      
      setOriginalParas(orig);
      setSuggestedParas(sug);
      setAcceptedParas(new Array(sug.length).fill(true));
      setAiSummary(parsed.resumo);
      setAiSuggestion(parsed.texto);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Erro de comunicação com a API.");
    } finally {
      setAiLoading(false);
    }
  };

  // Custom prompt action
  const handleCustomAIAction = async () => {
    if (!aiCustomPrompt) return;
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    
    const isSelectionActive = savedRange && selectedText.trim() !== "";
    const targetText = isSelectionActive ? selectedText : text;
        
    try {
      const res = await gemini.generate(aiCustomPrompt, targetText, text);
      const parsed = gemini.parseAIResponse(res);
      
      const orig = targetText.split("\n");
      const sug = parsed.texto.split("\n");
      
      setOriginalParas(orig);
      setSuggestedParas(sug);
      setAcceptedParas(new Array(sug.length).fill(true));
      setAiSummary(parsed.resumo);
      setAiSuggestion(parsed.texto);
      
      setAiCustomPrompt("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Erro de comunicação com a API.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!isEditorOpen) return null;

  // Calculate layout parameters to handle side bar pushes
  const availableSpace = windowWidth 
    - (leftSidebarOpen ? leftSidebarWidth : 0) 
    - (rightSidebarOpen ? rightSidebarWidth : 0);

  const desiredTotalWidth = textEditorWidth + (isAIPanelOpen ? aiPanelWidth : 0);

  const actualTotalWidth = rightSidebarOpen
    ? Math.min(desiredTotalWidth, availableSpace)
    : Math.min(desiredTotalWidth, windowWidth - (leftSidebarOpen ? leftSidebarWidth : 0));

  const isAligned = originalParas.length === suggestedParas.length;

  return (
    <div 
      className="absolute inset-y-0 left-0 border-r z-30 flex shadow-[10px_0_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-left backdrop-blur-2xl bg-opacity-95 max-w-[95vw]" 
      style={{ width: actualTotalWidth, backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}
    >
      <style>{`
        #editor-textarea {
          line-height: 1.65;
          outline: none;
        }
        #editor-textarea div, #editor-textarea p {
          margin-top: 0;
          margin-bottom: 1.5em; /* Regra Geral: Espaço proporcional ao tamanho da fonte */
        }
        #editor-textarea div:first-child, #editor-textarea p:first-child {
          margin-bottom: 0.5em; /* Título para Subtítulo: Espaço mais curto */
        }
      `}</style>

      {/* TEXT EDITOR AREA */}
      <div className="flex-1 flex flex-col p-6 h-full min-w-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
             <h2 className="text-lg font-bold flex items-center gap-2"><Edit3 size={20}/> Editor de Roteiro</h2>
             <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => {
                    if (window.confirm("Deseja restaurar o texto padrão do teleprompter? Isso apagará qualquer alteração não salva.")) {
                      handleTextChange(DEFAULT_TEXT);
                      if (editorRef.current) {
                        editorRef.current.innerHTML = textToHtml(DEFAULT_TEXT);
                      }
                      setAiSuggestion(null);
                      setAiError(null);
                    }
                  }}
                  className="p-2 rounded transition flex items-center gap-2 text-sm border border-slate-700/50 hover:bg-slate-800/50 text-slate-300 cursor-pointer"
                  title="Restaurar Roteiro Inicial Padrão"
                >
                  <RefreshCw size={16} /> Restaurar Padrão
                </button>

                <button 
                  onClick={() => {
                    if (!hasApiKey) {
                      setShowSettings(true);
                    } else {
                      setIsAIPanelOpen(!isAIPanelOpen);
                    }
                  }}
                  className={`p-2 rounded transition flex items-center gap-2 text-sm border cursor-pointer hover:bg-slate-800/50 ${isAIPanelOpen ? 'text-blue-400 border-blue-500/50 bg-blue-500/10' : 'text-slate-300 border-slate-700/50'}`}
                >
                  <Sparkles size={16} /> Assistente IA
                </button>
                
                <label className="p-2 rounded transition flex items-center gap-2 text-sm border border-slate-700/50 hover:bg-slate-800/50 cursor-pointer">
                  <Upload size={16} /> Importar
                  <input 
                    type="file" 
                    accept=".txt" 
                    onChange={handleImport} 
                    className="hidden" 
                  />
                </label>
                
                <button 
                  onClick={handleExport}
                  className="p-2 rounded transition flex items-center gap-2 text-sm border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                >
                  <Save size={16} /> Salvar
                </button>
                <button onClick={() => setEditorOpen(false)} className="ml-2 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"><X size={20} /></button>
             </div>
          </div>
          <div 
              ref={editorRef}
              contentEditable
              id="editor-textarea"
              className="flex-1 border rounded-lg p-4 font-mono focus:outline-none focus:ring-2 focus:ring-opacity-50 overflow-y-auto mb-4 shadow-inner bg-black/20 select-text" 
              style={{ 
                color: theme.textColor, 
                borderColor: `${theme.textColor}33`, 
                outlineColor: theme.primaryColor,
                fontSize: `${editorFontSize}px`,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
              onInput={handleInput}
              onSelect={handleSelectionChange}
              onKeyDown={handleUndoRedo}
              spellCheck={false} 
          />
      </div>
      
      {/* AI ASSISTANT PANEL */}
      {isAIPanelOpen && (
          <div 
            className="relative border-l flex flex-col p-4 animate-in slide-in-from-right h-full min-w-0" 
            style={{ width: aiPanelWidth, borderColor: `${theme.textColor}22`, backgroundColor: 'rgba(0,0,0,0.4)' }}
          >
             {/* Drag Resizing Handle for AI Panel (left edge) */}
             <div 
               className="absolute top-0 left-0 w-[6px] h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500 transition-colors z-50 group"
               onMouseDown={handleAIPanelMouseDown}
             >
               <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-blue-500/50 group-active:bg-blue-500 transition-colors" />
             </div>

             <div className="flex justify-between items-center mb-4 pl-2">
                  <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: theme.primaryColor }}><Sparkles size={16}/> Copiloto IA</h3>
                  <button onClick={() => setIsAIPanelOpen(false)} className="opacity-50 hover:opacity-100 cursor-pointer">
                    <X size={16}/>
                  </button>
             </div>
             
             {!hasApiKey ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                     <AlertCircle size={32} className="text-yellow-500 mb-3" />
                     <p className="text-sm mb-4">A chave de API não está configurada.</p>
                     <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-blue-600 rounded text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer">Configurar Chave</button>
                  </div>
             ) : (
                  <>
                      {/* Active AI Suggestion Preview Box (Locks UI until applied or discarded) */}
                      {aiSuggestion ? (
                          <div className="flex-1 flex flex-col min-h-0 bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 gap-3 animate-in fade-in h-full pl-2">
                             <div className="flex justify-between items-center shrink-0">
                               <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                                 <Sparkles size={12}/> Sugestões de Alteração
                               </span>
                               <button 
                                 onClick={() => setAiSuggestion(null)} 
                                 className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 cursor-pointer"
                                 title="Descartar sugestão"
                               >
                                 <Trash2 size={12}/> Descartar
                               </button>
                             </div>

                             {/* AI Change Summary */}
                             {aiSummary && (
                               <div className="shrink-0 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-snug">
                                 <strong>Resumo da IA:</strong> {aiSummary}
                               </div>
                             )}
                             
                             {/* Paragraph Diff/Toggles List */}
                             {!isAligned ? (
                               <div className="flex-1 flex flex-col gap-3 min-h-0">
                                 <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[11px] text-yellow-300 leading-snug">
                                   ⚠️ A IA reorganizou os parágrafos (alterou o número total de quebras de linha). A alteração deve ser aceita ou rejeitada por completo.
                                 </div>
                                 <div className="flex-1 overflow-y-auto p-2 bg-black/40 border border-white/5 rounded text-xs space-y-3">
                                   <div className="text-red-400/70 line-through bg-red-950/20 p-2 rounded border border-red-500/10 whitespace-pre-wrap">
                                     {originalParas.join("\n")}
                                   </div>
                                   <div className="text-green-400 bg-green-950/20 p-2 rounded border border-green-500/10 whitespace-pre-wrap">
                                     {suggestedParas.join("\n")}
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               <div className="flex-1 overflow-y-auto p-2 bg-black/40 border border-white/5 rounded text-xs space-y-3">
                                 {suggestedParas.map((sugPara, idx) => {
                                   const origPara = originalParas[idx] || "";
                                   const isParaChanged = origPara !== sugPara;
                                   
                                   if (!isParaChanged) {
                                     return (
                                       <div key={idx} className="opacity-40 p-2 rounded bg-white/5 text-[10px]">
                                         Parágrafo {idx + 1}: Sem alterações.
                                       </div>
                                     );
                                   }
                                   
                                   const isAccepted = acceptedParas[idx];
                                   
                                   return (
                                     <div 
                                       key={idx} 
                                       className={`p-2.5 rounded-lg border transition flex flex-col gap-2 ${isAccepted ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20 opacity-55'}`}
                                     >
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                          <span className={isAccepted ? 'text-green-400' : 'text-red-400'}>
                                            Parágrafo {idx + 1} ({isAccepted ? 'Modificado' : 'Rejeitado'})
                                          </span>
                                          <button
                                            onClick={() => {
                                              setAcceptedParas(prev => {
                                                const copy = [...prev];
                                                copy[idx] = !copy[idx];
                                                return copy;
                                              });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[9px] cursor-pointer font-bold ${isAccepted ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                                          >
                                            {isAccepted ? "Rejeitar" : "Aceitar"}
                                          </button>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1.5 font-mono text-[11px] leading-relaxed">
                                          {origPara && (
                                            <div className="text-red-400/70 line-through bg-red-950/20 p-1.5 rounded border border-red-500/10">
                                              {origPara}
                                            </div>
                                          )}
                                          <div className="text-green-400 bg-green-950/20 p-1.5 rounded border border-green-500/10">
                                            {sugPara}
                                          </div>
                                        </div>
                                     </div>
                                   );
                                 })}
                               </div>
                             )}
                             
                             <div className="flex flex-col gap-1.5 shrink-0">
                               <button
                                 onClick={applyAISuggestion}
                                 className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                               >
                                 <Check size={14}/> {savedRange && selectedText ? "Substituir na Seleção" : "Substituir no Editor"}
                               </button>
                               <button
                                 onClick={() => setAiSuggestion(null)}
                                 className="w-full p-2 bg-white/5 hover:bg-white/10 text-white rounded text-xs transition cursor-pointer"
                               >
                                 Cancelar
                               </button>
                             </div>
                          </div>
                      ) : (
                          <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar min-h-0 pl-2">
                              {/* Selection Box: Refine selected segment */}
                              {selectedText && savedRange && (
                                  <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex flex-col gap-2 animate-in fade-in shrink-0">
                                     <div className="flex justify-between items-center">
                                       <span className="text-[11px] font-semibold text-blue-400">Trecho Selecionado</span>
                                       <button 
                                         onClick={() => { setSelectedText(""); setSavedRange(null); }} 
                                         className="text-[10px] opacity-50 hover:opacity-100 cursor-pointer"
                                       >
                                         Limpar
                                       </button>
                                     </div>
                                     <p className="text-[10px] opacity-70 italic line-clamp-2 leading-tight" style={{ color: theme.textColor }}>
                                       "{selectedText}"
                                     </p>
                                     <div className="flex gap-1 mt-1">
                                       <input 
                                         type="text"
                                         placeholder="Instrução para este trecho..."
                                         value={selectionPrompt}
                                         onChange={e => setSelectionPrompt(e.target.value)}
                                         className="flex-1 bg-black/40 border rounded px-2 py-1 text-[11px] focus:outline-none"
                                         style={{ borderColor: `${theme.textColor}33`, color: theme.textColor }}
                                         onKeyDown={e => e.key === 'Enter' && handleSelectionAIAction()}
                                       />
                                       <button 
                                         onClick={handleSelectionAIAction}
                                         disabled={aiLoading || !selectionPrompt}
                                         className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                                       >
                                         Refinar
                                       </button>
                                     </div>
                                  </div>
                              )}

                              <div className="flex flex-col gap-2 shrink-0">
                                 <p className="text-xs opacity-70 mb-1">
                                   {selectedText ? "Ações rápidas no trecho selecionado:" : "Ações rápidas no roteiro todo:"}
                                 </p>
                                 {[
                                     { label: "Corrigir Gramática", prompt: "Corrija a gramática e ortografia do texto, mantendo o tom e reescrevendo por completo, sem resumir, sem cortar nada, mantendo exatamente a mesma extensão original." },
                                     { label: "Sugerir Melhorias", prompt: "Reescreva o texto sugerindo expressões melhores, vocabulário mais rico e frases mais claras, mantendo o tom e a extensão original, sem resumir nada." },
                                     { label: "Remover Vícios", prompt: "Remova vícios de linguagem, repetições excessivas e cacofonias. Torne a leitura fluida, mantendo o restante do texto intacto e no mesmo comprimento." },
                                     { label: "Mais Formal", prompt: "Reescreva o texto de forma mais formal e profissional, mantendo todo o conteúdo e a extensão original sem resumir nada." },
                                     { label: "Mais Dinâmico", prompt: "Reescreva o texto de forma mais energética, dinâmica e engajadora, mantendo todo o conteúdo e a extensão original sem resumir nada." }
                                 ].map(preset => (
                                     <button 
                                        key={preset.label}
                                        onClick={() => handleQuickAIAction(preset.prompt)}
                                        disabled={aiLoading}
                                        className="text-left text-xs p-2 rounded border border-white/10 hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
                                     >
                                        {preset.label}
                                     </button>
                                 ))}
                              </div>
                              
                              <div className="w-full h-px bg-white/10 shrink-0" />
                              
                              <div className="flex flex-col gap-2 flex-1 min-h-[180px] justify-end">
                                 <p className="text-xs opacity-70 mb-1">Pedir alteração específica:</p>
                                 <textarea 
                                     value={aiCustomPrompt}
                                     onChange={(e) => { setAiCustomPrompt(e.target.value); setAiError(null); }}
                                     className="w-full h-24 bg-black/40 border border-white/10 rounded p-2 text-xs focus:outline-none resize-none"
                                     style={{ borderColor: theme.primaryColor, color: theme.textColor }}
                                     placeholder={selectedText ? "Ex: Mude este trecho para tom humorístico..." : "Ex: Adicione uma introdução dramática..."}
                                 />
                                 
                                 {/* Sidebar Error Message in Red */}
                                 {aiError && (
                                   <div className="text-[11px] text-red-400 font-semibold p-2.5 rounded bg-red-950/30 border border-red-500/20 leading-tight my-1 flex items-start gap-1.5 animate-in fade-in shrink-0">
                                     <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                                     <div>{aiError}</div>
                                   </div>
                                 )}

                                 <button 
                                    onClick={handleCustomAIAction}
                                    disabled={aiLoading || !aiCustomPrompt}
                                    className="w-full p-2 rounded text-xs font-bold transition disabled:opacity-50 mt-auto flex items-center justify-center gap-2 cursor-pointer"
                                    style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
                                 >
                                    {aiLoading ? (
                                      <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        <span>Processando...</span>
                                      </>
                                    ) : (
                                      <span>Enviar Comando</span>
                                    )}
                                 </button>
                              </div>
                          </div>
                      )}
                  </>
             )}
          </div>
      )}
      {/* Drag Resizing Handle */}
      <div 
        className="absolute top-0 right-0 w-[6px] h-full cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500 transition-colors z-50 group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-0 right-0 w-[2px] h-full bg-transparent group-hover:bg-blue-500/50 group-active:bg-blue-500 transition-colors" />
      </div>
    </div>
  );
};

export default TextEditor;
