import React, { useCallback, useRef, useEffect } from "react";
import { useConfig } from "../../context/ConfigContext";

export const FloatingShortcuts: React.FC = () => {
  const {
    showShortcutOverlay,
    setShowShortcutOverlay,
    shortcutPos,
    setShortcutPos,
    shortcutSize,
    setShortcutSize,
    theme
  } = useConfig();

  const shortcutsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = shortcutsRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShortcutSize(s => Math.max(8, Math.min(22, s + (e.deltaY < 0 ? 1 : -1))));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [setShortcutSize, showShortcutOverlay]);

  const handleShortcutDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;
    
    const onMove = (ev: MouseEvent) => {
      setShortcutPos({ x: ev.clientX - offX, y: ev.clientY - offY });
    };
    
    const onUp = () => { 
      window.removeEventListener('mousemove', onMove); 
      window.removeEventListener('mouseup', onUp); 
    };
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [setShortcutPos]);

  if (!showShortcutOverlay) return null;

  return (
    <div
      ref={shortcutsRef}
      className="fixed z-[100] select-none cursor-move font-mono leading-relaxed p-4 rounded-xl border backdrop-blur-md bg-black/40 shadow-xl"
      style={{
        top: shortcutPos?.y,
        bottom: shortcutPos ? undefined : 16,
        right: shortcutPos ? undefined : 16,
        left: shortcutPos?.x,
        fontSize: `${shortcutSize}px`,
        color: `${theme.textColor}99`,
        borderColor: `${theme.textColor}22`,
      }}
      onMouseDown={handleShortcutDrag}
    >
      <div className="flex justify-between items-center mb-1">
        <span style={{ color: `${theme.primaryColor}AA`, fontWeight: 700 }}>⌨ Atalhos</span>
        <button 
          onClick={() => setShowShortcutOverlay(false)} 
          className="ml-2 px-1 text-[10px] opacity-40 hover:opacity-100 bg-white/10 hover:bg-white/20 rounded cursor-pointer"
        >
          Fechar
        </button>
      </div>
      Espaço · Play / Pause<br/>
      V · Modo de Voz<br/>
      E · Editor de Texto<br/>
      A · Assistente IA<br/>
      T · Configurações<br/>
      I · Info & Roadmap<br/>
      B · Recolher Barras<br/>
      W · Janela Externa<br/>
      X · Espelhar (H)<br/>
      Y · Espelhar (V)<br/>
      R · Reiniciar Texto<br/>
      H · Tour Guiado<br/>
      <span style={{ opacity: 0.5 }}>───────────</span><br/>
      J/↓ · − Velocidade<br/>
      L/↑ · + Velocidade<br/>
      +/− · Fonte<br/>
      [ / ] · Margem<br/>
      <span style={{ opacity: 0.4, fontSize: '0.85em' }}>
        / · fechar &nbsp;|&nbsp; arrastar · mover<br/>
        scroll · redimensionar
      </span>
    </div>
  );
};

export default FloatingShortcuts;
