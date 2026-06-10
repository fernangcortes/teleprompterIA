import React from "react";
import { useConfig } from "../../context/ConfigContext";

interface ParagraphTimelineProps {
  onJump: (idx: number) => void;
}

export const ParagraphTimeline: React.FC<ParagraphTimelineProps> = ({ onJump }) => {
  const { text, theme } = useConfig();
  const paragraphs = text.split('\n');
  
  return (
    <div className="absolute right-0 top-20 bottom-32 w-14 z-40 hidden md:flex flex-col gap-1 items-center justify-center opacity-50 hover:opacity-100 transition pr-2">
        {paragraphs.map((para, i) => {
            const hasContent = para.trim().length > 0;
            if (!hasContent) return null;

            const words = para.trim().split(/\s+/);
            const preview = words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');

            return (
                <div
                    key={i}
                    onClick={() => onJump(i)}
                    className="group relative flex-1 flex items-center justify-center w-full cursor-pointer hover:bg-white/5 rounded-l-lg transition-colors"
                >
                    {/* Dot */}
                    <div
                        className="w-2.5 h-2.5 rounded-full transition-all duration-200 group-hover:scale-150"
                        style={{
                            backgroundColor: theme.textColor,
                            opacity: 0.6,
                            boxShadow: `0 0 5px ${theme.primaryColor}88`
                        }}
                    />

                    {/* Large Tooltip */}
                    <div
                        className="absolute right-full mr-2 top-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-4 group-hover:translate-x-0 z-50 border backdrop-blur-md origin-right"
                        style={{
                            width: '40vw',
                            maxWidth: '600px',
                            backgroundColor: theme.surfaceColor, 
                            borderColor: theme.primaryColor,
                            color: theme.textColor
                        }}
                    >
                        <div className="text-xs font-bold mb-2 uppercase tracking-widest opacity-70" style={{ color: theme.secondaryColor }}>
                            Parágrafo {i + 1}
                        </div>
                        <div className="text-2xl font-medium leading-relaxed font-serif">
                            "{preview}"
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[10px] border-t-transparent border-l-[10px] border-b-[10px] border-b-transparent"
                             style={{ borderLeftColor: theme.primaryColor }}
                        />
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default ParagraphTimeline;
