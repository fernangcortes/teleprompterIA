import React from "react";
import { ThemeConfig } from "../../types";

interface ChatMessageBubbleProps {
  role: 'user' | 'model';
  text: string;
  theme: ThemeConfig;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ role, text, theme }) => (
  <div className={`flex w-full mb-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div 
      className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed`} 
      style={{ 
        backgroundColor: role === 'user' ? theme.primaryColor : theme.surfaceColor, 
        color: role === 'user' ? '#ffffff' : theme.textColor // Force white text for user messages for readability
      }}
    >
      {text}
    </div>
  </div>
);

export default ChatMessageBubble;
