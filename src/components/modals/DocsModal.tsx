import React from "react";
import { Info, X } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { DOCS_CONTENT } from "../../constants";

export const DocsModal: React.FC = () => {
  const { showDocs, setShowDocs, theme } = useConfig();

  if (!showDocs) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-3xl border rounded-xl shadow-2xl flex flex-col max-h-[80vh]" 
        style={{ 
          backgroundColor: theme.backgroundColor, 
          borderColor: `${theme.textColor}33`, 
          color: theme.textColor 
        }}
      >
        <div 
          className="p-4 border-b flex justify-between items-center" 
          style={{ borderColor: `${theme.textColor}33`, backgroundColor: theme.surfaceColor }}
        >
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.primaryColor }}>
              <Info /> Documentação & Roadmap
            </h2>
            <button onClick={() => setShowDocs(false)} className="opacity-50 hover:opacity-100 transition cursor-pointer">
              <X size={24} />
            </button>
        </div>
        <div className="p-6 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed">
            <div className="prose prose-invert max-w-none">
                {DOCS_CONTENT.readme}
                <div className="my-8 border-t" style={{ borderColor: `${theme.textColor}22` }} />
                {DOCS_CONTENT.roadmap}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
