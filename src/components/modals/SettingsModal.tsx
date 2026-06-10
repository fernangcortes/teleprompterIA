import React, { useState } from "react";
import { Settings, X, Sparkles, Gauge, Bot } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";
import { PRESETS } from "../../constants";
import { ThemeConfig } from "../../types";

export const SettingsModal: React.FC = () => {
  const { 
    showSettings, 
    setShowSettings, 
    apiKey, 
    deepseekApiKey,
    aiModel,
    initialPushSpeed, 
    theme, 
    setApiKey,
    setDeepseekApiKey,
    setAiModel,
    setInitialPushSpeed,
    setTheme,
    updateConfig 
  } = useConfig();
  
  const [activeTab, setActiveTab] = useState<'geral' | 'tema'>('geral');

  if (!showSettings) return null;
  
  const applyPreset = (key: string) => {
    setTheme(PRESETS[key]);
  };

  const handleColorChange = (key: keyof ThemeConfig, val: string) => {
    setTheme({ ...theme, [key]: val });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setTheme({ ...theme, logoImage: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-3xl border rounded-xl shadow-2xl flex flex-col max-h-[90vh]" 
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
              <Settings /> Configurações
            </h2>
            <button onClick={() => setShowSettings(false)} className="opacity-50 hover:opacity-100 transition cursor-pointer">
              <X size={24} />
            </button>
         </div>
         <div className="flex border-b" style={{ borderColor: `${theme.textColor}33`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => setActiveTab('geral')} 
              className={`flex-1 p-3 text-sm font-semibold transition cursor-pointer ${activeTab === 'geral' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} 
              style={{ 
                borderColor: activeTab === 'geral' ? theme.primaryColor : 'transparent', 
                color: activeTab === 'geral' ? theme.primaryColor : theme.textColor 
              }}
            >
              Geral & IA
            </button>
            <button 
              onClick={() => setActiveTab('tema')} 
              className={`flex-1 p-3 text-sm font-semibold transition cursor-pointer ${activeTab === 'tema' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} 
              style={{ 
                borderColor: activeTab === 'tema' ? theme.primaryColor : 'transparent', 
                color: activeTab === 'tema' ? theme.primaryColor : theme.textColor 
              }}
            >
              Aparência & Identidade
            </button>
         </div>
         <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {activeTab === 'geral' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.primaryColor }}>
                          <Sparkles size={16} /> Chave de API (Google Gemini)
                        </h3>
                        <p className="text-xs mb-3 opacity-70">
                          Necessária para o Assistente IA, Mentor de Palco e funções inteligentes. A chave é salva localmente e de forma segura no seu navegador.{" "}
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: theme.primaryColor }} 
                            className="hover:underline"
                          >
                            Pegue sua chave gratuitamente aqui
                          </a>.
                        </p>
                        <input 
                          type="password" 
                          value={apiKey || ''} 
                          onChange={(e) => setApiKey(e.target.value)} 
                          placeholder="Ex: AIzaSy..." 
                          className="w-full border rounded p-3 text-sm font-mono focus:outline-none" 
                          style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${theme.textColor}33`, color: theme.textColor }} 
                        />
                    </div>
                    
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.primaryColor }}>
                          <Sparkles size={16} /> Chave de API (DeepSeek)
                        </h3>
                        <p className="text-xs mb-3 opacity-70">
                          Necessária caso use o modelo deepseek-v4-flash. A chave é salva localmente. <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primaryColor }} className="hover:underline">Pegue sua chave aqui</a>.
                        </p>
                        <input 
                          type="password" 
                          value={deepseekApiKey || ''} 
                          onChange={(e) => setDeepseekApiKey(e.target.value)} 
                          placeholder="Ex: sk-..." 
                          className="w-full border rounded p-3 text-sm font-mono focus:outline-none" 
                          style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${theme.textColor}33`, color: theme.textColor }} 
                        />
                    </div>

                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.primaryColor }}>
                          <Bot size={16} /> Modelo de IA
                        </h3>
                        <p className="text-xs mb-3 opacity-70">
                          Escolha o modelo de linguagem para geração de roteiros e para o Mentor de Palco.
                        </p>
                        <select
                          value={aiModel || 'gemini-2.5-flash'}
                          onChange={(e) => setAiModel(e.target.value)}
                          className="w-full border rounded p-3 text-sm focus:outline-none"
                          style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${theme.textColor}33`, color: theme.textColor }}
                        >
                          <option value="gemini-2.5-flash" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>gemini-2.5-flash (Padrão)</option>
                          <option value="gemini-flash-latest" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>gemini-flash-latest</option>
                          <option value="deepseek-v4-flash" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>deepseek-v4-flash</option>
                        </select>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: theme.primaryColor }}>
                          <Gauge size={16} /> Empurrão de Velocidade (Início Rápido)
                        </h3>
                        <p className="text-xs mb-3 opacity-70">
                          Quando a rolagem estiver em 0% e você apertar Play (Espaço ou K), esta velocidade será aplicada automaticamente para o texto começar a rolar (padrão: 10%).
                        </p>
                        <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="1" 
                              max="50" 
                              value={initialPushSpeed || 10} 
                              onChange={(e) => setInitialPushSpeed(Number(e.target.value))} 
                              className="flex-1 h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                              style={{ accentColor: theme.primaryColor } as any} 
                            />
                            <span 
                              className="text-sm font-mono px-3 py-1 rounded border" 
                              style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: `${theme.textColor}33` }}
                            >
                              {initialPushSpeed || 10}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'tema' && (
                <div className="space-y-6 animate-in fade-in">
                    <div>
                        <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Presets</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.keys(PRESETS).map(key => (
                                <button 
                                  key={key} 
                                  onClick={() => applyPreset(key)} 
                                  className="p-3 rounded-lg border transition flex flex-col items-center gap-2 hover:opacity-80 cursor-pointer" 
                                  style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}22` }}
                                >
                                    <div className="w-6 h-6 rounded-full border" style={{ background: PRESETS[key].backgroundColor, borderColor: PRESETS[key].primaryColor }}></div>
                                    <span className="text-xs capitalize">{key}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Identidade</h3>
                             <div className="space-y-3">
                                <div>
                                    <label className="text-xs opacity-70 block mb-1">Nome do App</label>
                                    <input 
                                      value={theme.appName} 
                                      onChange={(e) => handleColorChange('appName', e.target.value)} 
                                      className="w-full border rounded p-2 text-sm focus:outline-none" 
                                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${theme.textColor}33`, color: theme.textColor }} 
                                    />
                                </div>
                                 <div>
                                    <label className="text-xs opacity-70 block mb-1">Logo (Upload)</label>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs opacity-70"/>
                                     {theme.logoImage && (
                                       <button 
                                         onClick={() => setTheme({ ...theme, logoImage: null })} 
                                         className="text-xs text-red-400 mt-1 hover:underline cursor-pointer"
                                       >
                                         Remover Logo
                                       </button>
                                     )}
                                </div>
                             </div>
                        </div>
                        <div>
                             <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Cores</h3>
                             <div className="grid grid-cols-2 gap-3">
                                {['backgroundColor', 'textColor', 'primaryColor', 'secondaryColor', 'activeWordColor', 'surfaceColor'].map((key) => (
                                     <div key={key}>
                                        <label className="text-[10px] opacity-70 block mb-1 capitalize">{key.replace('Color', '')}</label>
                                        <div className="flex gap-2 items-center p-1 rounded border" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${theme.textColor}33` }}>
                                            <input 
                                              type="color" 
                                              value={(theme as any)[key]} 
                                              onChange={(e) => handleColorChange(key as any, e.target.value)} 
                                              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" 
                                            />
                                            <span className="text-xs font-mono opacity-50">{(theme as any)[key]}</span>
                                        </div>
                                     </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SettingsModal;
