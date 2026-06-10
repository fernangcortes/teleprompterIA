import React from "react";
import { Heart, X, Copy } from "lucide-react";
import { useConfig } from "../../context/ConfigContext";

export const DonationModal: React.FC = () => {
  const { showDonation, setShowDonation, theme } = useConfig();

  if (!showDonation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white text-black p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setShowDonation(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer">
              <X size={24}/>
            </button>
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Apoie o Projeto</h2>
            <p className="text-gray-600 mb-6">O teleprompterIA é gratuito e open-source. Sua doação ajuda a manter os servidores de IA e o desenvolvimento ativo.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-bold">Chave PIX</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-300">
                    <code className="text-sm font-mono select-all">00833238132</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText("00833238132")} 
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <Copy size={16}/>
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Fernando G. C.</p>
            </div>
            
            <button 
              onClick={() => setShowDonation(false)} 
              className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 cursor-pointer" 
              style={{ backgroundColor: theme.secondaryColor }}
            >
                Fechar
            </button>
        </div>
    </div>
  );
};

export default DonationModal;
