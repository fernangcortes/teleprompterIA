import React, { useState, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { gemini } from "../../services/gemini";
import ChatMessageBubble from "./ChatMessageBubble";

export const MentorChat: React.FC = () => {
  const { showChat, setShowChat, text: currentText, theme } = useConfig();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [position, setPosition] = useState({ 
    x: window.innerWidth > 400 ? window.innerWidth - 350 : 10, 
    y: window.innerHeight - 450 
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    
    // Prepare history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    try {
      const response = await gemini.chat(userMsg, currentText, history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Erro ao conectar-se com o Mentor de Palco. Verifique sua chave de API." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!showChat) return null;

  return (
    <div 
      className="fixed border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden" 
      style={{ 
        top: position.y, 
        left: position.x, 
        width: 320, 
        height: 384, 
        minWidth: 250, 
        minHeight: 250, 
        maxWidth: '90vw', 
        maxHeight: '90vh', 
        resize: 'both', 
        backgroundColor: theme.backgroundColor, 
        borderColor: `${theme.textColor}33` 
      }}
    >
      <div 
        className="p-3 border-b flex justify-between items-center cursor-move" 
        style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}33`, color: theme.textColor, userSelect: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2">
            <MessageCircle size={20} style={{ color: theme.primaryColor }} />
            <span className="font-bold text-sm">Mentor de Palco</span>
        </div>
        <button onClick={() => setShowChat(false)} className="opacity-50 hover:opacity-100 transition" onPointerDown={e => e.stopPropagation()}>
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor: theme.backgroundColor }}>
         {messages.length === 0 && (
           <p className="text-center text-sm mt-10 opacity-60" style={{ color: theme.textColor }}>
             Olá! Sou seu diretor. Como posso ajudar com sua performance hoje?
           </p>
         )}
         {messages.map((m, i) => (
           <ChatMessageBubble key={i} role={m.role} text={m.text} theme={theme} />
         ))}
         {loading && <div className="text-xs italic opacity-60" style={{ color: theme.textColor }}>Digitando...</div>}
      </div>
      <div className="p-2 border-t flex gap-2" style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}33` }}>
        <input 
            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none bg-black/20"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: theme.textColor, borderColor: `${theme.textColor}33` }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo..."
        />
        <button 
          onClick={handleSend} 
          disabled={loading} 
          className="p-2 rounded hover:brightness-110 transition disabled:opacity-50 cursor-pointer" 
          style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
        >
          <Send size={16} style={{ color: theme.backgroundColor }} />
        </button>
      </div>
    </div>
  );
};

export default MentorChat;
