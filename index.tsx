import "./index.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { 
  Play, Pause, RefreshCw, Type, 
  Sparkles, X, FlipHorizontal, MonitorPlay, Edit3, AlertCircle, 
  FileText, Bot, MoveVertical,
  Settings, Monitor, Mic, MicOff, SlidersHorizontal,
  Volume2, Ear, Palette, Download, Save, Upload, Copy, Heart, Info, FileDown,
  CircleHelp, ChevronRight, ChevronLeft, MessageCircle, Send, User, Gauge,
  Rabbit, Turtle
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// --- Types & Constants ---

interface ThemeConfig {
  appName: string;
  backgroundColor: string;
  headerColor: string;     // Independent Header Color
  surfaceColor: string;    // Used for footer/modals
  primaryColor: string;    // Used for active elements, highlights
  secondaryColor: string;  // Used for gradients, accents
  textColor: string;
  activeWordColor: string; // The color of the word being spoken/read
  guideLineColor: string;
  logoImage?: string | null; // Base64 string for custom logo
  donationImage?: string | null; // Base64 string for donation modal image
}

const PRESETS: Record<string, ThemeConfig> = {
  original: {
    appName: "crIAprompter",
    backgroundColor: "#0f172a",
    headerColor: "#0f172a",
    surfaceColor: "#1e293b",
    primaryColor: "#008280",
    secondaryColor: "#d0235b",
    textColor: "#ffffff",
    activeWordColor: "#fff7e6",
    guideLineColor: "#008280",
    logoImage: null,
    donationImage: null
  },
  corporate: {
    appName: "StudioPrompter",
    backgroundColor: "#000000",
    headerColor: "#111111",
    surfaceColor: "#111111",
    primaryColor: "#2563eb", 
    secondaryColor: "#1e40af", 
    textColor: "#f3f4f6",
    activeWordColor: "#60a5fa",
    guideLineColor: "#2563eb",
    logoImage: null,
    donationImage: null
  },
  highContrast: {
    appName: "PRO-READ",
    backgroundColor: "#000000",
    headerColor: "#000000",
    surfaceColor: "#000000",
    primaryColor: "#ffff00", 
    secondaryColor: "#ffffff",
    textColor: "#ffffff",
    activeWordColor: "#ffff00",
    guideLineColor: "#ffff00",
    logoImage: null,
    donationImage: null
  },
  forest: {
    appName: "EcoPrompt",
    backgroundColor: "#052e16",
    headerColor: "#064e3b",
    surfaceColor: "#064e3b",
    primaryColor: "#34d399", 
    secondaryColor: "#10b981",
    textColor: "#ecfdf5",
    activeWordColor: "#6ee7b7",
    guideLineColor: "#34d399",
    logoImage: null,
    donationImage: null
  },
  minimal: {
    appName: "CleanRead",
    backgroundColor: "#18181b", 
    headerColor: "#18181b",
    surfaceColor: "#27272a", 
    primaryColor: "#fafafa", 
    secondaryColor: "#d4d4d8", 
    textColor: "#a1a1aa",
    activeWordColor: "#ffffff",
    guideLineColor: "#52525b",
    logoImage: null,
    donationImage: null
  }
};

const DOCS_CONTENT = {
  readme: `# crIAprompter - Documentação

## Sobre o Projeto
O crIAprompter é uma solução profissional de teleprompter baseada na web. Diferente de teleprompters tradicionais, ele utiliza Inteligência Artificial para reconhecimento de voz em tempo real (Smart Scroll) e geração de roteiros.

## Guia de Atalhos (Teclado)

### Controles Principais
- **Espaço / K:** Play/Pause ou Ativar Microfone (se em modo voz).
- **V:** Alternar entre Modo Manual e Modo de Voz.
- **R:** Reiniciar texto para o topo.

### Ferramentas
- **E:** Abrir/Fechar Editor de Texto.
- **A:** Abrir Assistente de IA.
- **T:** Abrir Configurações de Tema.
- **P:** Abrir Configurações de Projeção.
- **I:** Abrir esta tela de Informações.
- **B:** Ocultar/Exibir Barras de Ferramentas (essencial para pareamento de telas).
- **/ (barra):** Exibir/Ocultar Guia de Atalhos flutuante (arraste para mover, scroll para redimensionar).
- **? / H:** Iniciar Tour Guiado.

### Velocidade (Modo Manual)
- **J:** Diminuir velocidade.
- **L:** Aumentar velocidade.
- **Shift + J/L:** Ajuste rápido (5%).
- **Alt + J/L:** Ajuste fino (1%).

### Saída de Vídeo
- **W:** Abrir janela de projeção (Pop-up).
- **X:** Espelhar Horizontalmente.
- **Y:** Espelhar Verticalmente.

## Principais Funcionalidades

### 🎙️ Modo de Voz (Smart Scroll)
O texto rola automaticamente conforme você fala.
- **Portão de Ruído:** Evita que sons ambientes movam o texto.
- **Tolerância:** Ajusta a sensibilidade para sotaques ou erros de leitura.

### 🎨 Personalização (White Label)
No menu de temas (T), você pode alterar o nome do app, cores e fazer upload da sua Logo para usar em apresentações profissionais.

---
*Desenvolvido por FGC*`,

  roadmap: `# Roadmap de Desenvolvimento

## ✅ Funcionalidades Implementadas
- [x] Motor de Rolagem Suave (Anti-Jitter).
- [x] Reconhecimento de Voz em Tempo Real.
- [x] Tour Guiado Interativo.
- [x] Atalhos de Teclado Completos.
- [x] Integração com IA (Gemini).
- [x] Sistema de Temas & Upload de Logo.
- [x] Projeção em Segunda Janela.

## 🚀 Em Breve (Planejamento)
- [ ] **Aplicativo Mobile (PWA):** Instalação direta no celular.
- [ ] **Cloud Save:** Salvar roteiros na nuvem.
- [ ] **Multi-idioma:** Suporte oficial para EN/ES.
- [ ] **Modo Colaborativo:** Controle remoto via WebSocket.

## 💡 Sugestões?
Entre em contato: escrevaprofernando@gmail.com`
};

// --- Tour Configuration ---
const TOUR_STEPS = [
  { target: null, title: "Bem-vindo ao crIAprompter!", content: "Vamos fazer um tour rápido pelas funcionalidades desta ferramenta profissional. Suas barras de ferramentas agora são laterais e retráteis para maximizar o espaço de leitura. Use o atalho 'B' para recolher ambas simultaneamente." },
  { target: "btn-editor", title: "Editor de Texto (Atalho: E)", content: "Edite seu roteiro rapidamente. O texto é salvo automaticamente no seu navegador. O tamanho do texto e as margens da tela de leitura podem ser configurados na barra da direita." },
  { target: "btn-ai", title: "Assistente IA (Atalho: A)", content: "Crie ou melhore seus textos com o assistente inteligente integrado. Traduza, resuma ou ajuste o tom da sua mensagem em segundos." },
  { target: "btn-chat", title: "Mentor de Palco", content: "Nosso especialista. Converse com ele sobre técnicas de apresentação, dicas de luz, câmera e performance." },
  { target: "btn-theme", title: "Temas e Marca (Atalho: T)", content: "Mude a paleta de cores (Surface, Primary, Texto) ou use as predefinições de dark mode. Insira sua própria logo no canto da tela." },
  { target: "btn-mirror", title: "Espelhamento (Atalho: X e Y)", content: "Ao usar um hardware de teleprompter com espelho reflexivo, inverta a tela no eixo X ou Y para que o texto fique legível." },
  { target: "btn-popup", title: "Janela Pop-up (Atalho: W)", content: "Abre o prompter em uma segunda janela independente e limpa. Ela espelha automaticamente as configurações e a posição do texto." },
  { target: "btn-voice", title: "Modo de Voz (Atalho: V)", content: "O diferencial do crIAprompter: a IA te escuta e rola a tela acompanhando a sua fala." },
  { target: "btn-speed", title: "Velocidade (Atalhos: M/N ou Setas)", content: "No modo manual, ajuste a velocidade da rolagem." },
  { target: "btn-font", title: "Tamanho (Atalhos: +/-)", content: "Ajuste o tamanho do texto da leitura." },
  { target: "btn-margin", title: "Margem (Atalhos: [ e ])", content: "Controle as margens laterais do texto." },
  { target: "right-sidebar", title: "Foco de Leitura", content: "Ajuste a posição da linha guia que te ajuda a não se perder no texto." }
];

interface PrompterState {
  text: string;
  isPlaying: boolean;
  speed: number; // 1 to 100 (Manual Speed)
  initialPushSpeed: number;
  apiKey: string;
  fontSize: number; 
  margin: number; 
  mirrorX: boolean;
  mirrorY: boolean;
  
  // Voice Mode States
  isVoiceMode: boolean; // Se o modo voz está habilitado
  voiceStatus: 'idle' | 'countdown' | 'active'; // Estado do fluxo de voz
  countdownValue: number;
  voiceScrollOffset: number; // Compensação de posição (-20 a +20)
  noiseThreshold: number; // 0 to 100 (Noise Gate)
  voiceTolerance: number; // 0 to 5 (Levenshtein Distance Limit)

  isEditorOpen: boolean;
  activeWordId: string | null; 
  
  // Theme
  theme: ThemeConfig;
}

interface ParsedWord {
  id: string;
  text: string;
  clean: string;
}

interface ParsedParagraph {
  originalIndex: number;
  words: ParsedWord[];
}

// --- Mascot States ---
type MascotEmotion = 'idle' | 'animated' | 'doubt' | 'writing' | 'nervous' | 'vanishing';

const DEFAULT_TEXT = `GUIA AVANÇADO - DOMINANDO O CRIA PROMPTER

Olá e seja muito bem-vindo a uma nova experiência de leitura e apresentação. Se você está lendo este texto agora, significa que você deu o primeiro passo para transformar a maneira como se comunica com o seu público. Este não é apenas um teleprompter comum; é uma ferramenta desenhada para potencializar a sua oratória, garantindo que cada palavra seja entregue com precisão, confiança e naturalidade.

Imagine poder falar para a câmera sem aquela sensação robótica de quem está apenas lendo um texto. Com o crIAprompter, o controle está literalmente em suas mãos ou no ritmo da sua voz. A tecnologia de rolagem suave que implementamos permite que o texto flua como água, adaptando-se à sua velocidade natural de fala, e não o contrário. Você não precisa mais correr atrás das palavras ou esperar que elas apareçam de repente na tela, quebrando o seu raciocínio.

Vamos falar sobre os recursos visuais e o conforto ocular. Perceba como o destaque da palavra atual não é agressivo. Utilizamos um brilho suave, quase imperceptível, que guia o seu olhar sem cansar a vista, mesmo após longas sessões de gravação. Isso é fundamental para manter o foco e a conexão com a lente, que, no final das contas, é a conexão direta com quem está te assistindo do outro lado. Um olhar firme transmite autoridade e credibilidade.

Ajustar a velocidade nunca foi tão preciso e intuitivo. Se você precisa de um ritmo mais lento para explicar um assunto técnico e complexo, ou de um ritmo mais dinâmico para uma chamada de ação entusiasmada, os atalhos de teclado estão aqui para servir você instantaneamente. Lembre-se: as teclas J e L são seus melhores amigos durante a gravação. Com elas, você pode acelerar ou desacelerar o texto em tempo real. Use o Shift para mudanças rápidas ou o Alt para aquele ajuste fino e cirúrgico de velocidade.

Além disso, a projeção em segunda tela foi pensada meticulosamente para profissionais de vídeo. Seja espelhando horizontalmente ou verticalmente, o texto se adapta perfeitamente ao seu hardware, seja um teleprompter de vidro profissional ou um monitor dedicado improvisado. E se você se perder no meio do discurso? Não tem problema algum. O sistema de clique permite que você salte instantaneamente para qualquer parte do texto, retomando o raciocínio sem cortes bruscos na sua performance.

Aproveite este momento para praticar a sua respiração e entonação. Respire fundo, mantenha a postura ereta e deixe que o crIAprompter guie você por esta jornada de comunicação. Fale com clareza, articule bem as sílabas e sinta a diferença que uma ferramenta profissional pode fazer no seu resultado final. Estamos aqui para garantir que a sua mensagem seja não apenas ouvida, mas profundamente entendida e lembrada por todos.`;

// --- Helper Functions ---

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim();
};

/**
 * Levenshtein Distance (Fuzzy Match)
 */
const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, 
          Math.min(
            matrix[i][j - 1] + 1, 
            matrix[i - 1][j] + 1  
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const findBestMatch = (
    spokenSnippet: string[], 
    allWords: ParsedWord[], 
    startSearch: number, 
    endSearch: number,
    toleranceLevel: number
) => {
    let bestScore = 0;
    let bestIndex = -1;

    const safeStart = Math.max(0, startSearch);
    const safeEnd = Math.min(allWords.length, endSearch);
    const isShortSnippet = spokenSnippet.length <= 2;

    for (let i = safeStart; i < safeEnd; i++) {
        let matches = 0;
        let scriptPointer = i;
        
        for (let j = 0; j < spokenSnippet.length; j++) {
            if (scriptPointer >= allWords.length) break;

            const spokenWord = spokenSnippet[j];
            const scriptWord = allWords[scriptPointer].clean;

            // Fuzzy Comparison Logic
            const dist = levenshtein(spokenWord, scriptWord);
            
            // Dynamic Tolerance Calculation
            const limit = scriptWord.length > 3 
                ? toleranceLevel 
                : (toleranceLevel >= 4 ? 1 : 0);

            const isMatch = dist <= limit;

            if (isMatch) {
                matches++;
                scriptPointer++;
            } else {
                // Skip Logic (1 word skip tolerance)
                if (scriptPointer + 1 < allWords.length) {
                    const nextScriptWord = allWords[scriptPointer + 1].clean;
                    const nextDist = levenshtein(spokenWord, nextScriptWord);
                    
                    const nextLimit = nextScriptWord.length > 3 
                        ? toleranceLevel 
                        : (toleranceLevel >= 4 ? 1 : 0);
                    
                    if (nextDist <= nextLimit) {
                         matches += 0.8; 
                         scriptPointer += 2;
                         continue;
                    }
                }
                
                if (isShortSnippet) {
                    matches = 0; 
                    break; 
                }
                scriptPointer++; 
            }
        }
        
        const score = matches / spokenSnippet.length;

        if (score > bestScore) {
            bestScore = score;
            bestIndex = Math.min(scriptPointer - 1, allWords.length - 1);
        }
    }
    return { score: bestScore, index: bestIndex };
};

// --- Services ---

class GeminiService {
  private ai: GoogleGenAI | null = null;
  
  setApiKey(apiKey: string) {
    if (apiKey && apiKey.trim() !== '') {
      try {
         this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      } catch(e) { this.ai = null; }
    } else {
      this.ai = null;
    }
  }

  async generate(prompt: string, currentText: string = ''): Promise<string> {
    if (!this.ai) throw new Error("no_api_key");
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Você é um assistente especialista em criação de roteiros para teleprompter.
        Contexto atual: "${currentText.slice(0, 500)}..."
        Instrução: ${prompt}
        Retorne APENAS o texto do roteiro.`,
      });
      return response.text || "Erro ao gerar texto.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Erro: Falha na comunicação com a API.";
    }
  }

  async chat(message: string, currentText: string, history: any[] = []): Promise<string> {
      if (!this.ai) throw new Error("no_api_key");
      try {
          const chat = this.ai.chats.create({
              model: 'gemini-3-pro-preview',
              config: {
                  systemInstruction: `
                    Você é o "Mentor de Palco", um mascote assistente especialista no software crIAprompter e em produção audiovisual.
                    
                    PERSONALIDADE:
                    Você é um diretor de estúdio experiente, carismático e técnico. Você fala como se estivesse em um set de filmagem.
                    
                    SEUS CONHECIMENTOS:
                    1. O Software (crIAprompter): Conhece todos os atalhos (ex: 'V' para voz, 'E' para editor), sabe sobre projeção espelhada e Smart Scroll.
                    2. Oratória: Dicas sobre entonação, pausas, contato visual e postura.
                    3. Estúdio: Iluminação (Key light, Fill light), microfones, enquadramento.

                    CONTEXTO DO USUÁRIO:
                    O usuário está lendo este texto no teleprompter agora: "${currentText.slice(0, 1000)}..."
                    
                    INSTRUÇÃO ESPECIAL PARA EMOÇÕES:
                    Se o usuário estiver confuso ou cometer erros, você pode demonstrar "nervosismo" ou "dúvida".
                    Se o usuário pedir algo complexo, você está "escrevendo" ou "pensando".
                    Se o usuário agradecer, fique "animado".
                    
                    RESPOSTA:
                    Seja breve, útil e encorajador. Formate a resposta como se fosse um balão de fala de HQ.
                  `,
              },
              history: history
          });
          const result = await chat.sendMessage({ message });
          return result.text || "Desculpe, tive um problema técnico no estúdio.";
      } catch (e) {
          console.error(e);
          return "Erro de comunicação com a direção (API).";
      }
  }
}
const gemini = new GeminiService();

// --- Worker Script para Rolagem Contínua (Anti-Jitter) ---
const WORKER_SCRIPT = `
let intervalId;
self.onmessage = function(e) {
  if (e.data === 'start') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => self.postMessage('tick'), 16);
  } else if (e.data === 'stop') {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }
};
`;

// --- Hooks ---
const usePrompterEngine = (
  state: PrompterState,
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  popupWindowRef: React.MutableRefObject<Window | null>,
  setPlaying: (playing: boolean) => void,
  updateState: (u: Partial<PrompterState>) => void,
  ignoreVoiceUntilRef: React.MutableRefObject<number>,
  transcriptBufferRef: React.MutableRefObject<string[]>,
  lastManualInteractionRef: React.MutableRefObject<number>
) => {
  const workerRef = useRef<Worker | null>(null);
  const currentVelocity = useRef<number>(0);
  const scrollAccumulator = useRef<number>(0); 
  const isAutoScrolling = useRef<boolean>(false);
  const detectWordThrottle = useRef<number | null>(null);
  
  // Ref to track if scrolling is coming from popup to avoid loops
  const isSyncingFromPopup = useRef(false);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Expose global handlers for the popup window to call via window.opener
  useEffect(() => {
    (window as any).handlePopupScroll = (percentage: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        isSyncingFromPopup.current = true;
        const max = container.scrollHeight - container.clientHeight;
        const target = percentage * max;
        
        // Only update if difference is significant to avoid micro-loops
        if (Math.abs(container.scrollTop - target) > 1) {
             container.scrollTop = target;
        }
        
        // Reset flag after a short delay
        setTimeout(() => {
            isSyncingFromPopup.current = false;
        }, 50);
    };

    (window as any).handlePopupKey = (data: any) => {
        const event = new KeyboardEvent('keydown', {
            code: data.code,
            key: data.key,
            shiftKey: data.shiftKey,
            altKey: data.altKey,
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(event);
    };

    return () => {
        delete (window as any).handlePopupScroll;
        delete (window as any).handlePopupKey;
    };
  }, [scrollContainerRef]);

  const syncPopupPercentage = useCallback(() => {
    // If we are currently syncing FROM popup, do not send update back TO popup
    if (isSyncingFromPopup.current) return;

    const container = scrollContainerRef.current;
    if (!container || !popupWindowRef.current || popupWindowRef.current.closed) return;
    
    const popupContainer = popupWindowRef.current.document.getElementById('prompter-container');
    if (!popupContainer) return;

    // Always sync, regardless of play state, to allow manual control sync
    const localScrollable = container.scrollHeight - container.clientHeight;
    const popupScrollable = popupContainer.scrollHeight - popupContainer.clientHeight;
    
    if (localScrollable > 0) {
      const percentage = container.scrollTop / localScrollable;
      
      // Set flag on popup window object so it ignores this scroll event in its own listener
      (popupWindowRef.current as any).isSyncing = true;
      popupContainer.scrollTop = percentage * popupScrollable;
    }
  }, [scrollContainerRef, popupWindowRef]);

  const detectActiveWordFromScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const baseLine = 0.32; 
    const offsetModifier = (stateRef.current.voiceScrollOffset || 0) / 100;
    
    const targetY = rect.top + (rect.height * (baseLine + offsetModifier));
    const targetX = rect.left + (rect.width / 2);

    const element = document.elementFromPoint(targetX, targetY);

    if (element && element.id && element.id.startsWith('w-')) {
        if (stateRef.current.activeWordId !== element.id) {
            updateState({ activeWordId: element.id });
        }
    }
  }, [scrollContainerRef, updateState]);

  useEffect(() => {
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (Date.now() < ignoreVoiceUntilRef.current) {
          currentVelocity.current = 0;
          return;
      }

      const { isPlaying, speed, voiceStatus, activeWordId, isVoiceMode, voiceScrollOffset } = stateRef.current;
      
      // --- OPERATOR SOVEREIGNTY LOGIC ---
      // Check if user has interacted recently (3s hysteresis)
      const timeSinceInteraction = Date.now() - lastManualInteractionRef.current;
      const isManualOverride = timeSinceInteraction < 3000;

      let targetVelocity = 0;

      // Logic:
      // 1. If Manual Override is active (user moved mouse/keys recently), force Manual Mode logic.
      // 2. If Voice Mode is OFF, force Manual Mode logic.
      if (isManualOverride || !isVoiceMode) {
          if (isPlaying) {
              targetVelocity = speed * 0.06;
          } else {
              targetVelocity = 0;
          }
      } else {
          // 3. Otherwise, Voice Mode (Automatic) logic applies
          if (voiceStatus === 'active') {
             if (activeWordId) {
               const el = document.getElementById(activeWordId);
               if (el) {
                  const containerRect = container.getBoundingClientRect();
                  const elRect = el.getBoundingClientRect();
                  const relativeTop = elRect.top - containerRect.top;
                  const offsetPercent = (voiceScrollOffset || 0) / 100;
                  const idealLine = container.clientHeight * (0.32 + offsetPercent);
                  const error = relativeTop - idealLine;
                  
                  if (Math.abs(error) < 20) {
                     targetVelocity = 0;
                  } else {
                      if (error > 250) targetVelocity = 6.0; 
                      else if (error > 150) targetVelocity = 4.0;
                      else if (error > 50) targetVelocity = 2.5; 
                      else if (error > 20) targetVelocity = 1.0; 
                      else if (error > -20) targetVelocity = 0;  
                      else if (error > -100) targetVelocity = -0.8; 
                      else targetVelocity = 0; 
                  }
               } else { targetVelocity = 0; }
             } else { targetVelocity = 0; }
          }
      }

      const smoothingFactor = 0.05; 
      currentVelocity.current += (targetVelocity - currentVelocity.current) * smoothingFactor;

      if (Math.abs(currentVelocity.current) < 0.1) currentVelocity.current = 0;

      if (Math.abs(currentVelocity.current) > 0) {
         if (container.scrollTop + container.clientHeight < container.scrollHeight - 1) {
            isAutoScrolling.current = true;
            scrollAccumulator.current += currentVelocity.current;
            const pixelsToScroll = Math.floor(scrollAccumulator.current);
            if (pixelsToScroll !== 0) {
              container.scrollTop += pixelsToScroll;
              scrollAccumulator.current -= pixelsToScroll;
              syncPopupPercentage();
            }
         } else if (isPlaying && !isVoiceMode && !isManualOverride) {
            // Auto stop at bottom only if strictly in manual mode without override confusions
            setPlaying(false);
         }
      }
    };
    return () => worker.terminate();
  }, [scrollContainerRef, popupWindowRef, setPlaying, syncPopupPercentage]);

  useEffect(() => {
    const { isPlaying, isVoiceMode } = state;
    // Always run worker if isPlaying (manual) OR isVoiceMode (waiting for voice)
    const shouldRun = isPlaying || isVoiceMode;
    
    if (isPlaying) {
        ignoreVoiceUntilRef.current = 0;
    }

    if (shouldRun) workerRef.current?.postMessage('start');
    else {
      scrollAccumulator.current = 0;
      const timeout = setTimeout(() => {
         if (!stateRef.current.isPlaying && !stateRef.current.isVoiceMode) {
             workerRef.current?.postMessage('stop');
         }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state.isPlaying, state.isVoiceMode]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = () => {
         lastManualInteractionRef.current = Date.now();
         ignoreVoiceUntilRef.current = Date.now() + 2000;
         if (stateRef.current.isPlaying) {
            setPlaying(false);
         }
         detectActiveWordFromScroll();
         transcriptBufferRef.current = [];
    };

    const handleScroll = () => {
      // Always sync popup if manual scroll happens
      syncPopupPercentage();
      
      // If we are auto-scrolling (set by worker just before this event), we ignore this as a manual event.
      // We rely on isAutoScrolling.current being true from the worker's tick.
      if (!isAutoScrolling.current) {
        // This is a MANUAL scroll event (mouse wheel, touch, scrollbar drag)
        lastManualInteractionRef.current = Date.now();
        
        // If we were playing, stop.
        if (stateRef.current.isPlaying) {
            setPlaying(false);
            currentVelocity.current = 0; 
        }
        if (detectWordThrottle.current) cancelAnimationFrame(detectWordThrottle.current);
        detectWordThrottle.current = requestAnimationFrame(() => {
            detectActiveWordFromScroll();
        });
      }
      // Reset flag for next frame
      isAutoScrolling.current = false;
    };
    
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchmove', handleWheel, { passive: true });
    container.addEventListener('scroll', handleScroll);
    
    return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchmove', handleWheel);
        container.removeEventListener('scroll', handleScroll);
    };
  }, [setPlaying, scrollContainerRef, popupWindowRef, syncPopupPercentage, detectActiveWordFromScroll]);
};

// --- Native Voice Tracking Hook ---
const useVoiceTracking = (
  parsedText: ParsedParagraph[],
  updateState: (u: Partial<PrompterState>) => void,
  state: PrompterState,
  transcriptBufferRef: React.MutableRefObject<string[]>,
  ignoreVoiceUntilRef: React.MutableRefObject<number>
) => {
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentVolume, setCurrentVolume] = useState(0); 
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const volumeCheckIntervalRef = useRef<any>(null);
  const lastLoudNoiseTime = useRef<number>(0);
  
  const shouldBeOn = useRef(false);
  
  const stateRef = useRef(state);
  const allWordsRef = useRef<ParsedWord[]>([]);

  const allWords = useMemo(() => parsedText.flatMap(p => p.words), [parsedText]);
  
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { allWordsRef.current = allWords; }, [allWords]);

  const initAudioAnalysis = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (volumeCheckIntervalRef.current) clearInterval(volumeCheckIntervalRef.current);
        
        volumeCheckIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const volume = Math.min(100, Math.round((average / 255) * 200)); 
            setCurrentVolume(volume);

            if (volume > stateRef.current.noiseThreshold) {
                lastLoudNoiseTime.current = Date.now();
            }
        }, 50);
    } catch (e) {
        console.error("Audio Context Error", e);
    }
  };

  const startCountdown = useCallback(() => {
    updateState({ isVoiceMode: true, voiceStatus: 'countdown', countdownValue: 3 });
    initAudioAnalysis(); 

    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        updateState({ countdownValue: count });
      } else {
        clearInterval(timer);
        // Start playing automatically when voice mode starts (engine will idle until voice is heard OR manual override)
        updateState({ voiceStatus: 'active', countdownValue: 0, isPlaying: true });
        shouldBeOn.current = true;
        transcriptBufferRef.current = []; 
        startRecognition();
      }
    }, 1000);
  }, [updateState]);

  const stopVoiceMode = useCallback(() => {
    shouldBeOn.current = false;
    recognitionRef.current?.stop();
    
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    if (volumeCheckIntervalRef.current) clearInterval(volumeCheckIntervalRef.current);

    updateState({ isVoiceMode: false, voiceStatus: 'idle', activeWordId: null, isPlaying: false });
    setLiveTranscript("");
    setCurrentVolume(0);
  }, [updateState]);

  const startRecognition = useCallback(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onend = () => {
        if (shouldBeOn.current) {
             console.log("Reiniciando motor de voz...");
             recognition.start(); 
        }
      };

      recognition.onresult = (event: any) => {
         if (Date.now() < ignoreVoiceUntilRef.current) return;
         if (Date.now() - lastLoudNoiseTime.current > 1000) return; 

         const resultIndex = event.resultIndex;
         const results = event.results;
         
         let currentInterim = "";
         if (!results[resultIndex].isFinal) {
             currentInterim = results[resultIndex][0].transcript;
         } else {
             const finalTranscript = results[resultIndex][0].transcript;
             const words = normalizeText(finalTranscript).split(/\s+/);
             transcriptBufferRef.current.push(...words);
             if (transcriptBufferRef.current.length > 50) {
                 transcriptBufferRef.current = transcriptBufferRef.current.slice(-50);
             }
         }

         const interimClean = normalizeText(currentInterim);
         const interimWords = interimClean ? interimClean.split(/\s+/) : [];
         
         const fullStream = [...transcriptBufferRef.current, ...interimWords];
         
         const WINDOW_SIZE = 8; 
         const spokenSnippet = fullStream.slice(-WINDOW_SIZE); 
         
         setLiveTranscript(currentInterim || (fullStream.slice(-5).join(" ")));

         if (spokenSnippet.length < 1) return;

         const currentActiveId = stateRef.current.activeWordId;
         const currentWords = allWordsRef.current;
         const currentIndex = currentActiveId 
            ? currentWords.findIndex(w => w.id === currentActiveId) 
            : 0;
         
         const SEARCH_BACK = 10;
         const SEARCH_FWD = 15;

         const strictStart = Math.max(0, currentIndex - SEARCH_BACK);
         const strictEnd = Math.min(currentWords.length, currentIndex + SEARCH_FWD);
         
         const match = findBestMatch(spokenSnippet, currentWords, strictStart, strictEnd, stateRef.current.voiceTolerance);

         if (match.score >= 0.5 && match.index !== -1) {
             const targetWord = currentWords[match.index];
             if (targetWord && targetWord.id !== currentActiveId) {
                 updateState({ activeWordId: targetWord.id });
             }
         }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      stopVoiceMode();
    }
  }, [updateState, stopVoiceMode]); 

  const toggleVoice = useCallback(() => {
    if (state.isVoiceMode) {
      stopVoiceMode();
    } else {
      startCountdown();
    }
  }, [state.isVoiceMode, stopVoiceMode, startCountdown]);

  return { toggleVoice, liveTranscript, currentVolume };
};

// --- Components ---

const Tooltip = ({ label, side = 'top', children, className = '' }: { label: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right'; children?: React.ReactNode; className?: string }) => {
  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div className={`absolute ${
        side === 'top' ? 'bottom-full mb-2' : 
        side === 'bottom' ? 'top-full mt-2' :
        side === 'left' ? 'right-full mr-2' :
        'left-full ml-2'
      } px-4 py-2 text-xs font-medium bg-black/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:delay-[3000ms] pointer-events-none whitespace-pre-wrap w-max max-w-md z-[100] border border-white/20 shadow-lg text-left leading-relaxed`}>
        {label}
      </div>
    </div>
  );
};

// --- Components Definitions ---

const MascotDisplay = ({ emotion }: { emotion: MascotEmotion }) => {
  // Simple emoji based mascot for now, or SVG
  const emotions: Record<MascotEmotion, string> = {
    idle: "😐",
    animated: "😃",
    doubt: "🤨",
    writing: "✍️",
    nervous: "😰",
    vanishing: "👻"
  };
  return <div className="text-4xl">{emotions[emotion]}</div>;
};

const ChatMessageBubble: React.FC<{ role: 'user' | 'model', text: string, theme: ThemeConfig }> = ({ role, text, theme }) => (
  <div className={`flex w-full mb-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[80%] p-3 rounded-lg`} style={{ backgroundColor: role === 'user' ? theme.primaryColor : theme.surfaceColor, color: role === 'user' ? theme.backgroundColor : theme.textColor }}>
      {text}
    </div>
  </div>
);

const MentorChat = ({ isOpen, onClose, currentText, theme }: { isOpen: boolean; onClose: () => void; currentText: string; theme: ThemeConfig }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [position, setPosition] = useState({ x: window.innerWidth > 400 ? window.innerWidth - 350 : 10, y: window.innerHeight - 450 });
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

    const response = await gemini.chat(userMsg, currentText, history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden" style={{ top: position.y, left: position.x, width: 320, height: 384, minWidth: 250, minHeight: 250, maxWidth: '90vw', maxHeight: '90vh', resize: 'both', backgroundColor: theme.backgroundColor, borderColor: `${theme.textColor}33` }}>
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
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition" onPointerDown={e => e.stopPropagation()}><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor: theme.backgroundColor }}>
         {messages.length === 0 && <p className="text-center text-sm mt-10 opacity-60" style={{ color: theme.textColor }}>Olá! Sou seu diretor. Como posso ajudar com sua performance hoje?</p>}
         {messages.map((m, i) => <ChatMessageBubble key={i} role={m.role} text={m.text} theme={theme} />)}
         {loading && <div className="text-xs italic opacity-60" style={{ color: theme.textColor }}>Digitando...</div>}
      </div>
      <div className="p-2 border-t flex gap-2" style={{ backgroundColor: theme.surfaceColor, borderColor: `${theme.textColor}33` }}>
        <input 
            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
            style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, borderColor: `${theme.textColor}33` }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo..."
        />
        <button onClick={handleSend} disabled={loading} className="p-2 rounded hover:brightness-110 transition disabled:opacity-50" style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}><Send size={16}/></button>
      </div>
    </div>
  );
};

const TourOverlay = ({ active, stepIndex, onClose, onNext, onPrev, theme, setLeftSidebarOpen, setRightSidebarOpen }: { active: boolean, stepIndex: number, onClose: () => void, onNext: () => void, onPrev: () => void, theme: ThemeConfig, setLeftSidebarOpen?: (b: boolean) => void, setRightSidebarOpen?: (b: boolean) => void }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
     if (!active) return;
     const step = TOUR_STEPS[stepIndex];
     
     if (step.target) {
         if (['btn-editor', 'btn-ai', 'btn-chat', 'btn-theme', 'btn-mirror', 'btn-popup'].includes(step.target)) {
             setLeftSidebarOpen?.(true);
         }
         if (['right-sidebar', 'btn-voice', 'btn-speed', 'btn-font', 'btn-margin'].includes(step.target)) {
             setRightSidebarOpen?.(true);
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
  }, [active, stepIndex]);

  if (!active) return null;
  const step = TOUR_STEPS[stepIndex];

  return (
    <div className="fixed inset-0 z-[100] flex pointer-events-auto">
      <div className="p-6 rounded-xl w-[350px] shadow-2xl absolute transition-all duration-300 border border-white/10" style={{ ...style, backgroundColor: theme.surfaceColor, color: theme.textColor }}>
        <button onClick={onClose} className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition"><X size={20}/></button>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.primaryColor }}>
          {stepIndex === 0 ? `Bem-vindo ao ${theme.appName || 'crIAprompter'}!` : step.title}
        </h3>
        <p className="mb-6 font-medium leading-relaxed opacity-80">
          {stepIndex === 0 
            ? `Seja bem-vindo(a) ao seu novo ambiente profissional de teleprompter. Esta versão foi redesenhada para maximizar sua área de leitura, com barras de ferramentas laterais independentes e controles precisos. Vamos conhecer os atalhos e as novas funções para uma gravação impecável.` 
            : step.content}
        </p>
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold opacity-50">{stepIndex + 1} de {TOUR_STEPS.length}</span>
            <div className="flex gap-2">
                <button onClick={onPrev} disabled={stepIndex === 0} className="px-3 py-1.5 rounded border border-current opacity-70 hover:opacity-100 disabled:opacity-30 font-medium transition">Anterior</button>
                <button onClick={onNext} className="px-3 py-1.5 rounded font-bold hover:scale-105 shadow-md transition" style={{ backgroundColor: theme.primaryColor, color: theme.surfaceColor }}>
                    {stepIndex === TOUR_STEPS.length - 1 ? "Concluir" : "Próximo"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const CountdownOverlay = ({ value, color }: { value: number, color: string }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="text-9xl font-bold animate-bounce" style={{ color: color, textShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
      {value}
    </div>
  </div>
);

const ParagraphTimeline = ({ text, onJump, theme }: { text: string, onJump: (i: number) => void, theme: ThemeConfig }) => {
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

const SettingsModal = ({ isOpen, onClose, state, updateState }: { isOpen: boolean, onClose: () => void, state: PrompterState, updateState: (u: Partial<PrompterState>) => void }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'tema'>('geral');
  if (!isOpen) return null;
  
  const applyPreset = (key: string) => {
    updateState({ theme: PRESETS[key] });
  };

  const handleColorChange = (key: keyof ThemeConfig, val: string) => {
    updateState({ theme: { ...state.theme, [key]: val } });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateState({ theme: { ...state.theme, logoImage: reader.result as string } });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl border rounded-xl shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: state.theme.backgroundColor, borderColor: `${state.theme.textColor}33`, color: state.theme.textColor }}>
         <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: `${state.theme.textColor}33`, backgroundColor: state.theme.surfaceColor }}>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: state.theme.primaryColor }}><Settings /> Configurações</h2>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition"><X size={24} /></button>
         </div>
         <div className="flex border-b" style={{ borderColor: `${state.theme.textColor}33`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <button onClick={() => setActiveTab('geral')} className={`flex-1 p-3 text-sm font-semibold transition ${activeTab === 'geral' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'geral' ? state.theme.primaryColor : 'transparent', color: activeTab === 'geral' ? state.theme.primaryColor : state.theme.textColor }}>Geral & IA</button>
            <button onClick={() => setActiveTab('tema')} className={`flex-1 p-3 text-sm font-semibold transition ${activeTab === 'tema' ? 'border-b-2' : 'opacity-60 hover:opacity-100'}`} style={{ borderColor: activeTab === 'tema' ? state.theme.primaryColor : 'transparent', color: activeTab === 'tema' ? state.theme.primaryColor : state.theme.textColor }}>Aparência & Identidade</button>
         </div>
         <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {activeTab === 'geral' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: state.theme.surfaceColor, borderColor: `${state.theme.textColor}22` }}>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: state.theme.primaryColor }}><Sparkles size={16} /> Chave de API (Google Gemini)</h3>
                        <p className="text-xs mb-3 opacity-70">Necessária para o Assistente IA, Mentor de Palco e funções inteligentes. A chave é salva localmente e de forma segura no seu navegador. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: state.theme.primaryColor }} className="hover:underline">Pegue sua chave gratuitamente aqui</a>.</p>
                        <input type="password" value={state.apiKey || ''} onChange={(e) => updateState({ apiKey: e.target.value })} placeholder="Ex: AIzaSy..." className="w-full border rounded p-3 text-sm font-mono focus:outline-none" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${state.theme.textColor}33`, color: state.theme.textColor }} />
                    </div>
                    <div className="p-4 rounded-lg border" style={{ backgroundColor: state.theme.surfaceColor, borderColor: `${state.theme.textColor}22` }}>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: state.theme.primaryColor }}><Gauge size={16} /> Empurrão de Velocidade (Início Rápido)</h3>
                        <p className="text-xs mb-3 opacity-70">Quando a rolagem estiver em 0% e você apertar Play (Espaço ou K), esta velocidade será aplicada automaticamente para o texto começar a rolar (padrão: 10%).</p>
                        <div className="flex items-center gap-4">
                            <input type="range" min="1" max="50" value={state.initialPushSpeed || 10} onChange={(e) => updateState({ initialPushSpeed: Number(e.target.value) })} className="flex-1 h-2 rounded-full appearance-none bg-white/10 cursor-pointer" style={{ accentColor: state.theme.primaryColor } as any} />
                            <span className="text-sm font-mono px-3 py-1 rounded border" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: `${state.theme.textColor}33` }}>{state.initialPushSpeed || 10}%</span>
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
                                <button key={key} onClick={() => applyPreset(key)} className="p-3 rounded-lg border transition flex flex-col items-center gap-2 hover:opacity-80" style={{ backgroundColor: state.theme.surfaceColor, borderColor: `${state.theme.textColor}22` }}>
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
                                    <input value={state.theme.appName} onChange={(e) => handleColorChange('appName', e.target.value)} className="w-full border rounded p-2 text-sm focus:outline-none" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${state.theme.textColor}33`, color: state.theme.textColor }} />
                                </div>
                                 <div>
                                    <label className="text-xs opacity-70 block mb-1">Logo (Upload)</label>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs opacity-70"/>
                                     {state.theme.logoImage && <button onClick={() => updateState({ theme: { ...state.theme, logoImage: null } })} className="text-xs text-red-400 mt-1 hover:underline">Remover Logo</button>}
                                </div>
                             </div>
                        </div>
                        <div>
                             <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Cores</h3>
                             <div className="grid grid-cols-2 gap-3">
                                {['backgroundColor', 'textColor', 'primaryColor', 'secondaryColor', 'activeWordColor', 'surfaceColor'].map((key) => (
                                     <div key={key}>
                                        <label className="text-[10px] opacity-70 block mb-1 capitalize">{key.replace('Color', '')}</label>
                                        <div className="flex gap-2 items-center p-1 rounded border" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${state.theme.textColor}33` }}>
                                            <input type="color" value={(state.theme as any)[key]} onChange={(e) => handleColorChange(key as any, e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" />
                                            <span className="text-xs font-mono opacity-50">{(state.theme as any)[key]}</span>
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

const DocsModal = ({ isOpen, onClose, theme }: { isOpen: boolean, onClose: () => void, theme: ThemeConfig }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl border rounded-xl shadow-2xl flex flex-col max-h-[80vh]" style={{ backgroundColor: theme.backgroundColor, borderColor: `${theme.textColor}33`, color: theme.textColor }}>
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: `${theme.textColor}33`, backgroundColor: theme.surfaceColor }}>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.primaryColor }}><Info /> Documentação & Roadmap</h2>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition"><X size={24} /></button>
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

const DonationModal = ({ isOpen, onClose, theme }: { isOpen: boolean, onClose: () => void, theme: ThemeConfig }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white text-black p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={24}/></button>
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Apoie o Projeto</h2>
            <p className="text-gray-600 mb-6">O crIAprompter é gratuito e open-source. Sua doação ajuda a manter os servidores de IA e o desenvolvimento ativo.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-bold">Chave PIX</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-300">
                    <code className="text-sm font-mono select-all">00833238132</code>
                    <button onClick={() => navigator.clipboard.writeText("00833238132")} className="text-blue-600 hover:text-blue-800"><Copy size={16}/></button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Fernando G. C.</p>
            </div>
            
            <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90" style={{ backgroundColor: theme.secondaryColor }}>
                Fechar
            </button>
        </div>
    </div>
  );
};


// --- End of Components Definitions ---

// --- Main Application ---

const App = () => {
  const [state, setState] = useState<PrompterState>(() => {
    const saved = localStorage.getItem("cria_prompter_state_v8");
    const defaultState = { 
      text: DEFAULT_TEXT, isPlaying: false, speed: 30, 
      initialPushSpeed: 10, apiKey: "", 
      fontSize: 64, margin: 0, mirrorX: true, mirrorY: false, 
      isVoiceActive: false, 
      voiceStatus: 'idle',
      countdownValue: 0,
      voiceScrollOffset: 0,
      noiseThreshold: 10,
      voiceTolerance: 2,
      isEditorOpen: false, activeWordId: null,
      theme: PRESETS.original
    };
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  });

    const [showSettings, setShowSettings] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [textHistory, setTextHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [floatingAIText, setFloatingAIText] = useState('');
  const [selectedRange, setSelectedRange] = useState<{start: number, end: number} | null>(null);

  useEffect(() => {
     if (textHistory.length === 0 && state.text) {
        setTextHistory([state.text]);
        setHistoryIndex(0);
     }
  }, [state.text, textHistory.length]);

  const handleTextChange = (newText: string) => {
     const currentHistory = textHistory.slice(0, historyIndex + 1);
     const newHistory = [...currentHistory, newText];
     setTextHistory(newHistory);
     setHistoryIndex(newHistory.length - 1);
     updateState({ text: newText });
  };
  const [showDonation, setShowDonation] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    if (state.apiKey) {
      gemini.setApiKey(state.apiKey);
    }
  }, [state.apiKey]);

  // Sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Shortcut Overlay
  const [showShortcutOverlay, setShowShortcutOverlay] = useState(false);
  const [shortcutPos, setShortcutPos] = useState<{x: number, y: number} | null>(null);
  const [shortcutSize, setShortcutSize] = useState(11);
  const handleShortcutDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;
    const onMove = (ev: MouseEvent) => setShortcutPos({ x: ev.clientX - offX, y: ev.clientY - offY });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // Interaction State for Sovereignty
  const lastManualInteractionRef = useRef<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const popupWindowRef = useRef<Window | null>(null);
  const ignoreVoiceUntilRef = useRef<number>(0);
  const transcriptBufferRef = useRef<string[]>([]);

  useEffect(() => { document.title = state.theme.appName; }, [state.theme.appName]);

  useEffect(() => {
    const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    }
  }, [deferredPrompt]);

  const parsedText: ParsedParagraph[] = useMemo(() => {
    let wordCount = 0;
    return state.text.split('\n').map((line, idx) => {
      const words: ParsedWord[] = line.split(' ').map((w) => ({
        id: `w-${wordCount++}`,
        text: w,
        clean: normalizeText(w)
      }));
      return { originalIndex: idx, words };
    });
  }, [state.text]);

  useEffect(() => { localStorage.setItem("cria_prompter_state_v8", JSON.stringify(state)); }, [state]);
  
  const updateState = useCallback((updates: Partial<PrompterState>) => setState(prev => ({ ...prev, ...updates })), []);
  
  const registerInteraction = useCallback(() => {
      lastManualInteractionRef.current = Date.now();
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
      // If we are starting playback, register an interaction to ensure immediate response
      if (playing) registerInteraction();
      updateState({ isPlaying: playing });
  }, [updateState, registerInteraction]);

  const getHtmlForPopup = useCallback(() => {
     const styles = `
       body { background: radial-gradient(circle at top, ${state.theme.surfaceColor} 0%, ${state.theme.backgroundColor} 100%); color: ${state.theme.textColor}; }
       .word-span.active { color: ${state.theme.activeWordColor}; text-shadow: 0 0 15px ${state.theme.primaryColor}CC; }
       #guide-line { background-color: ${state.theme.guideLineColor}; color: ${state.theme.guideLineColor}; box-shadow: 0 0 10px ${state.theme.guideLineColor}; }
     `;
     const contentHtml = parsedText.map(p => {
        const content = p.words.map(w => 
          `<span id="${w.id}" class="word-span ${state.activeWordId === w.id ? 'active' : ''}">${w.text}</span> `
        ).join('');
        return `<p style="margin-bottom: 1em; line-height: 1.25; ${p.words.length === 1 && p.words[0].text === '' ? 'height: 1em' : ''}">${content}</p>`;
     }).join('');
     return { styles, content: contentHtml };
  }, [parsedText, state.activeWordId, state.theme]);

  const scrollToWord = useCallback((wordId: string) => {
    transcriptBufferRef.current = [];
    ignoreVoiceUntilRef.current = Date.now() + 500;
    updateState({ activeWordId: wordId });
    registerInteraction(); 

    const localEl = document.getElementById(wordId);
    if (localEl && scrollContainerRef.current) {
      const containerHeight = scrollContainerRef.current.clientHeight;
      const targetTop = localEl.offsetTop - (containerHeight * 0.35);
      scrollContainerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    if (popupWindowRef.current && !popupWindowRef.current.closed) {
       const popupDoc = popupWindowRef.current.document;
       const popupEl = popupDoc.getElementById(wordId);
       const popupContainer = popupDoc.getElementById('prompter-container');
       if (popupEl && popupContainer) {
         const containerHeight = popupContainer.clientHeight;
         const offsetRatio = 0.32 + (state.voiceScrollOffset / 100);
         const targetTop = popupEl.offsetTop - (containerHeight * offsetRatio);
         popupContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
       }
    }
  }, [state.voiceScrollOffset, updateState, registerInteraction]);

  const togglePopup = () => {
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.close();
      popupWindowRef.current = null;
    } else {
      const win = window.open('', 'PrompterWindow', 'width=1000,height=800,menubar=no,toolbar=no,location=no');
      if (!win) { alert("Pop-up bloqueado!"); return; }
      popupWindowRef.current = win;
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${state.theme.appName} - Projeção</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style id="dynamic-styles"></style>
            <style>
              body { overflow: hidden; margin: 0; font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
              ::-webkit-scrollbar { width: 0px; }
              #prompter-container { height: 100vh; overflow-y: scroll; scroll-behavior: auto; }
              #content-wrapper { width: 100%; max-width: 100%; margin: 0 auto; text-align: left; text-transform: uppercase; }
              .word-span { transition: color 0.2s, text-shadow 0.2s; cursor: pointer; }
              .word-span:hover { filter: brightness(1.5); }
            </style>
            <script>
                // Flag to prevent scroll loops
                window.isSyncing = false;
                
                // Inject bidirectional sync logic
                window.onload = () => {
                    const container = document.getElementById('prompter-container');
                    
                    // Listen for scroll events in popup to sync back to Main
                    container.addEventListener('scroll', () => {
                        if (window.isSyncing) {
                            window.isSyncing = false;
                            return;
                        }
                        
                        const max = container.scrollHeight - container.clientHeight;
                        const percentage = max > 0 ? container.scrollTop / max : 0;
                        
                        if (window.opener && window.opener.handlePopupScroll) {
                            window.opener.handlePopupScroll(percentage);
                        }
                    });

                    // Forward keyboard events to Main window
                    window.addEventListener('keydown', (e) => {
                        if (window.opener && window.opener.handlePopupKey) {
                            window.opener.handlePopupKey({
                                code: e.code,
                                key: e.key,
                                shiftKey: e.shiftKey,
                                altKey: e.altKey
                            });
                            // Prevent default for common playback/scroll keys
                            if (['Space', 'KeyK', 'KeyR', 'KeyV', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                                e.preventDefault();
                            }
                        }
                    });
                };
            </script>
          </head>
          <body>
            <div style="position: fixed; top: 0; bottom: 0; left: 0; right: 0; pointer-events: none; z-index: 20; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0.3; margin-top: 4rem; margin-bottom: 6rem;">
               <div id="guide-line" style="position: absolute; width: 100%; height: 2px; transition: all 0.3s;"></div>
            </div>
            
            <div style="position: fixed; top: 0; left: 0; right: 0; height: 8rem; z-index: 10; pointer-events: none; background: linear-gradient(to bottom, ${state.theme.backgroundColor} 0%, transparent 100%);"></div>
            <div style="position: fixed; bottom: 0; left: 0; right: 0; height: 8rem; z-index: 10; pointer-events: none; background: linear-gradient(to top, ${state.theme.backgroundColor} 0%, transparent 100%);"></div>

            <div id="prompter-container" style="position: relative; z-index: 10;"><div id="content-wrapper"></div></div>
          </body>
        </html>
      `);
      win.document.close();
      const sync = () => {
        if (!win || win.closed) return;
        const wrapper = win.document.getElementById('content-wrapper');
        const guide = win.document.getElementById('guide-line');
        const styleEl = win.document.getElementById('dynamic-styles');
        if (wrapper && guide && styleEl) {
          const { styles, content } = getHtmlForPopup();
          styleEl.innerHTML = styles;
          wrapper.innerHTML = content; 
          wrapper.style.fontSize = `${state.fontSize}px`;
          wrapper.style.paddingLeft = `calc(${state.margin}% + 1rem)`;
          wrapper.style.paddingRight = `calc(${state.margin}% + 1rem)`;
          wrapper.style.paddingTop = `50vh`;
          wrapper.style.paddingBottom = `50vh`;
          wrapper.style.transform = `scaleX(${state.mirrorX ? -1 : 1}) scaleY(${state.mirrorY ? -1 : 1})`;
          wrapper.style.transformOrigin = 'center center';
          guide.style.top = `${(0.32 + (state.voiceScrollOffset / 100)) * 100}%`;
        }
      };
      sync(); setTimeout(sync, 100);
    }
  };

  useEffect(() => {
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      const wrapper = popupWindowRef.current.document.getElementById('content-wrapper');
      const guide = popupWindowRef.current.document.getElementById('guide-line');
      const styleEl = popupWindowRef.current.document.getElementById('dynamic-styles');
      if (wrapper && guide && styleEl) {
        const { styles, content } = getHtmlForPopup();
        styleEl.innerHTML = styles;
        wrapper.innerHTML = content; 
        wrapper.style.fontSize = `${state.fontSize}px`;
        wrapper.style.paddingLeft = `calc(${state.margin}% + 1rem)`;
        wrapper.style.paddingRight = `calc(${state.margin}% + 1rem)`;
        wrapper.style.paddingTop = `50vh`;
        wrapper.style.paddingBottom = `50vh`;
        wrapper.style.transform = `scaleX(${state.mirrorX ? -1 : 1}) scaleY(${state.mirrorY ? -1 : 1})`;
        guide.style.top = `${(0.32 + (state.voiceScrollOffset / 100)) * 100}%`;
      }
    }
  }, [state.text, state.fontSize, state.margin, state.voiceScrollOffset, state.mirrorX, state.mirrorY, state.activeWordId, state.theme, getHtmlForPopup]);

  usePrompterEngine(state, scrollContainerRef, popupWindowRef, setPlaying, updateState, ignoreVoiceUntilRef, transcriptBufferRef, lastManualInteractionRef);
  const { toggleVoice, liveTranscript, currentVolume } = useVoiceTracking(parsedText, updateState, state, transcriptBufferRef, ignoreVoiceUntilRef);

  const handleRestart = useCallback(() => { 
      updateState({ isPlaying: false, activeWordId: null, isVoiceMode: false, voiceStatus: 'idle' }); 
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [updateState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;
      
      if (e.code === "Space" || e.code === "KeyK") { 
          e.preventDefault();
          if (activeTag === 'button') {
              (document.activeElement as HTMLElement)?.blur();
          }
          if (!state.isPlaying && state.speed === 0) {
              updateState({ isPlaying: true, speed: 20 });
              setPlaying(true);
          } else {
              setPlaying(!state.isPlaying);
          }
      }
      if (e.code === "KeyE") { e.preventDefault(); updateState({ isEditorOpen: !state.isEditorOpen }); }
      if (e.code === "KeyA") { e.preventDefault(); setIsAIPanelOpen(p => !p); }
      if (e.code === "KeyT") { e.preventDefault(); setShowSettings(true); }
      if (e.code === "KeyI") { e.preventDefault(); setShowDocs(true); }
      if (e.code === "KeyH" || (e.shiftKey && e.code === "Slash")) { e.preventDefault(); setIsTourActive(true); setTourStep(0); }
      if (e.code === "KeyR") { e.preventDefault(); handleRestart(); }
      if (e.code === "KeyW") { e.preventDefault(); togglePopup(); }
      if (e.code === "KeyX") { e.preventDefault(); updateState({ mirrorX: !state.mirrorX }); }
      if (e.code === "KeyY") { e.preventDefault(); updateState({ mirrorY: !state.mirrorY }); }
      if (e.code === "KeyV") { e.preventDefault(); toggleVoice(); }
      if (e.code === "KeyB") { 
          e.preventDefault(); 
          const newState = !(leftSidebarOpen && rightSidebarOpen);
          setLeftSidebarOpen(newState);
          setRightSidebarOpen(newState);
      }
      if (e.key === "/") { e.preventDefault(); setShowShortcutOverlay(p => !p); }

      if (e.code === "KeyM" || e.code === "KeyL" || e.code === "ArrowUp") {
          registerInteraction();
          let amount = 2; 
          if (e.shiftKey) amount = 5; 
          if (e.altKey) amount = 1; 
          updateState({ speed: Math.min(state.speed + amount, 100) });
      }
      if (e.code === "KeyN" || e.code === "KeyJ" || e.code === "ArrowDown") {
          registerInteraction();
          let amount = 2; 
          if (e.shiftKey) amount = 5; 
          if (e.altKey) amount = 1; 
          updateState({ speed: Math.max(state.speed - amount, 0) });
      }
      
      if (e.code === "Equal" || e.code === "NumpadAdd") {
          e.preventDefault();
          updateState({ fontSize: Math.min(state.fontSize + 4, 200) });
      }
      if (e.code === "Minus" || e.code === "NumpadSubtract") {
          e.preventDefault();
          updateState({ fontSize: Math.max(state.fontSize - 4, 16) });
      }
      if (e.key === "]" || e.code === "BracketRight") {
          e.preventDefault();
          updateState({ margin: Math.min(state.margin + 2, 40) });
      }
      if (e.key === "[" || e.code === "BracketLeft") {
          e.preventDefault();
          updateState({ margin: Math.max(state.margin - 2, 0) });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, showSettings, isAIPanelOpen, toggleVoice, updateState, togglePopup, handleRestart, registerInteraction, setPlaying, leftSidebarOpen, rightSidebarOpen, showShortcutOverlay]);

  const jumpToParagraph = (idx: number) => {
     const firstWordId = parsedText.find(p => p.originalIndex === idx)?.words[0]?.id;
     if (firstWordId) scrollToWord(firstWordId);
  };

  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden font-sans selection:bg-opacity-50" style={{ 
        background: `radial-gradient(circle at top, ${state.theme.surfaceColor} 0%, ${state.theme.backgroundColor} 100%)`, 
        color: state.theme.textColor 
    }}>
      
      <style>{`
        ::selection { background-color: ${state.theme.primaryColor}; color: ${state.theme.backgroundColor}; }
        .prompter-text span.active-word { color: ${state.theme.activeWordColor}; text-shadow: 0 0 15px ${state.theme.primaryColor}CC; }
        ::-webkit-scrollbar-thumb { background: ${state.theme.surfaceColor}; }
        ::-webkit-scrollbar-thumb:hover { background: ${state.theme.primaryColor}; }
      `}</style>

            {/* LEFT SIDEBAR */}
      {!leftSidebarOpen && (
        <button 
          onClick={() => setLeftSidebarOpen(true)} 
          className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-24 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-r-2xl flex items-center justify-center text-white/50 hover:text-white transition-all z-40 border-y border-r border-white/10 shadow-lg"
        >
          <ChevronRight size={24} />
        </button>
      )}
      <div className={`relative flex transition-all duration-300 z-50 ${leftSidebarOpen ? 'w-64' : 'w-0'}`}>
        <aside className={`absolute inset-y-0 left-0 w-64 flex flex-col py-6 px-4 gap-6 border-r shadow-2xl backdrop-blur-md bg-opacity-95 transition-transform duration-300 ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: state.theme.headerColor, borderColor: `${state.theme.textColor}22` }}>
           
           <div className="flex items-center justify-between w-full mb-2">
               <div className="flex items-center gap-3 select-none hover:scale-[1.02] transition-transform cursor-pointer">
                  {state.theme.logoImage ? (
                    <img src={state.theme.logoImage} alt="App Logo" className="w-8 h-auto rounded-lg object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-white text-xs shadow-lg" style={{ background: `linear-gradient(135deg, ${state.theme.primaryColor}, ${state.theme.secondaryColor})` }}>
                      {state.theme.appName.slice(0, 2).toLowerCase()}
                    </div>
                  )}
                  <span className="font-bold text-sm tracking-wide opacity-90 truncate">{state.theme.appName}</span>
               </div>
               <button onClick={() => setLeftSidebarOpen(false)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition">
                  <ChevronLeft size={20} />
               </button>
           </div>

           <div className="flex flex-col gap-3 flex-1 w-full">
              <Tooltip label="Abre o editor de texto para gerenciar seu roteiro. (Atalho: E)" side="right" className="w-full">
                <button id="btn-editor" onClick={() => updateState({ isEditorOpen: !state.isEditorOpen })} className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] ${state.isEditorOpen ? 'shadow-inner' : 'hover:bg-white/10'}`} style={{ backgroundColor: state.isEditorOpen ? state.theme.textColor : 'transparent', color: state.isEditorOpen ? state.theme.backgroundColor : state.theme.textColor }}>
                    <FileText size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Editor de Texto</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(E)</span>
                </button>
              </Tooltip>
              
              <Tooltip label="Fale com nosso mentor IA para dicas de apresentação e uso do estúdio." side="right" className="w-full">
                <button id="btn-chat" onClick={() => { if (!state.apiKey) { setShowSettings(true); } else { setShowChat(!showChat); } }} className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] relative`} style={{ backgroundColor: showChat ? state.theme.textColor : 'transparent', color: showChat ? state.theme.backgroundColor : state.theme.textColor }}>
                    <MessageCircle size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Mentor de Palco</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(?)</span>
                </button>
              </Tooltip>

                            <Tooltip label="Configurações (Geral, IA, Temas e Identidade) (Atalho: T)" side="right" className="w-full">
                <button id="btn-theme" onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: showSettings ? state.theme.textColor : 'transparent', color: showSettings ? state.theme.backgroundColor : state.theme.textColor }}>
                    <Settings size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Configurações</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(T)</span>
                </button>
              </Tooltip>

              <div className="w-full h-px my-2" style={{ backgroundColor: `${state.theme.textColor}22` }}></div>

              <Tooltip label="Inverte o texto horizontalmente para leitura em espelho reflexivo." side="right" className="w-full">
                <button id="btn-mirror" onClick={() => updateState({ mirrorX: !state.mirrorX })} className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition hover:bg-white/5 ${state.mirrorX ? '' : 'opacity-60'}`} style={{ color: state.mirrorX ? state.theme.primaryColor : state.theme.textColor }}>
                    <FlipHorizontal size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Espelhar (X)</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(X)</span>
                </button>
              </Tooltip>
              <Tooltip label="Inverte o texto verticalmente." side="right" className="w-full">
                <button id="btn-flip-y" onClick={() => updateState({ mirrorY: !state.mirrorY })} className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition hover:bg-white/5 ${state.mirrorY ? '' : 'opacity-60'}`} style={{ color: state.mirrorY ? state.theme.primaryColor : state.theme.textColor }}>
                    <MoveVertical size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Espelhar (Y)</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(Y)</span>
                </button>
              </Tooltip>
              <Tooltip label="Abre a janela de projeção secundária. (Atalho: W)" side="right" className="w-full">
                <button id="btn-popup" onClick={togglePopup} className={`w-full flex items-center justify-start gap-4 p-3.5 rounded-xl transition hover:scale-[1.02]`} style={{ backgroundColor: popupWindowRef.current ? state.theme.textColor : 'transparent', color: popupWindowRef.current ? state.theme.backgroundColor : state.theme.textColor, border: `1px solid ${state.theme.textColor}33` }}>
                    <MonitorPlay size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Janela Externa</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(W)</span>
                </button>
              </Tooltip>
              <Tooltip label="Retorna o texto para a posição inicial." side="right" className="w-full">
                <button id="btn-restart" onClick={handleRestart} className="w-full flex items-center justify-start gap-4 p-3.5 hover:bg-white/5 rounded-xl opacity-70 hover:opacity-100 transition">
                    <RefreshCw size={20} />
                    <span className="font-medium text-sm whitespace-nowrap">Reiniciar Texto</span>
                    <span className="ml-auto text-xs opacity-50 font-mono">(R)</span>
                </button>
              </Tooltip>
           </div>

           <div className="flex flex-col gap-3 mt-auto w-full">
             <Tooltip label="Revise o tour guiado por todas as funções principais." side="right" className="w-full">
               <button id="btn-tour" onClick={() => { setIsTourActive(true); setTourStep(0); }} className="w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10" style={{ color: state.theme.primaryColor }}>
                   <CircleHelp size={18} />
                   <span className="font-medium text-sm whitespace-nowrap">Tour Guiado</span>
                   <span className="ml-auto text-xs opacity-50 font-mono">(H)</span>
               </button>
             </Tooltip>
             <Tooltip label="Veja informações sobre o desenvolvedor e roadmap do projeto." side="right" className="w-full">
               <button id="btn-docs" onClick={() => setShowDocs(true)} className="w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10" style={{ color: state.theme.textColor }}>
                   <Info size={18} />
                   <span className="font-medium text-sm whitespace-nowrap">Info & Roadmap</span>
                   <span className="ml-auto text-xs opacity-50 font-mono">(I)</span>
               </button>
             </Tooltip>
           </div>

           <div className="flex flex-col w-full">
              <Tooltip label="Exibe um guia flutuante de atalhos. Arraste para mover, scroll para redimensionar. (Atalho: /)" side="right" className="w-full">
                <button id="btn-shortcuts" onClick={() => setShowShortcutOverlay(p => !p)} className={`w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10`} style={{ color: showShortcutOverlay ? state.theme.primaryColor : state.theme.textColor }}>
                   <span className="text-lg leading-none">⌨</span>
                   <span className="font-medium text-sm whitespace-nowrap">Guia de Atalhos</span>
                   <span className="ml-auto text-xs opacity-50 font-mono">(/)</span>
                </button>
              </Tooltip>
           </div>
        </aside>
      </div>

      {/* CENTER CONTENT */}
      <div className="flex-1 relative flex overflow-hidden">
        {state.countdownValue > 0 && <CountdownOverlay value={state.countdownValue} color={state.theme.primaryColor} />}
        
                {state.isEditorOpen && (
          <div className="absolute inset-y-0 left-0 w-full md:w-[70vw] border-r z-30 flex shadow-[10px_0_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-left backdrop-blur-2xl bg-opacity-95" style={{ backgroundColor: state.theme.surfaceColor, borderColor: `${state.theme.textColor}22` }}>
            {/* TEXT EDITOR AREA */}
            <div className="flex-1 flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-lg font-bold flex items-center gap-2"><Edit3 size={20}/> Editor de Roteiro</h2>
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => {
                         if (!state.apiKey) {
                           setShowSettings(true);
                         } else {
                           setIsAIPanelOpen(!isAIPanelOpen);
                         }
                       }}
                       className={`p-2 rounded transition flex items-center gap-2 text-sm border hover:bg-slate-800/50 ${isAIPanelOpen ? 'text-blue-400 border-blue-500/50 bg-blue-500/10' : 'text-slate-300 border-slate-700/50'}`}
                     >
                       <Sparkles size={16} /> Assistente IA
                     </button>
                     <button 
                       onClick={() => {
                         const input = document.createElement('input');
                         input.type = 'file';
                         input.accept = '.txt';
                         input.onchange = (e: any) => {
                           const file = e.target.files[0];
                           if (file) {
                             const reader = new FileReader();
                             reader.onload = (ev) => updateState({ text: ev.target?.result as string });
                             reader.readAsText(file);
                           }
                         };
                         input.click();
                       }}
                       className="p-2 rounded transition flex items-center gap-2 text-sm border border-slate-700/50 hover:bg-slate-800/50"
                     >
                       <Upload size={16} /> Importar
                     </button>
                     <button 
                       onClick={() => {
                         const blob = new Blob([state.text], { type: 'text/plain' });
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement('a');
                         a.href = url;
                         a.download = 'roteiro_criaprompter.txt';
                         a.click();
                         URL.revokeObjectURL(url);
                       }}
                       className="p-2 rounded transition flex items-center gap-2 text-sm border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                     >
                       <Save size={16} /> Salvar
                     </button>
                     <button onClick={() => updateState({ isEditorOpen: false })} className="ml-2 p-2 hover:bg-slate-800/50 rounded-lg"><X size={20} /></button>
                   </div>
                </div>
                <textarea 
                    id="editor-textarea"
                    className="flex-1 border rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none mb-4 shadow-inner transition-colors duration-300" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: state.theme.textColor, borderColor: `${state.theme.textColor}33`, '--tw-ring-color': state.theme.primaryColor } as React.CSSProperties}
                    value={state.text} 
                    onChange={(e) => handleTextChange(e.target.value)} 
                    onSelect={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        if (target.selectionStart !== target.selectionEnd) {
                            setSelectedRange({ start: target.selectionStart, end: target.selectionEnd });
                        } else {
                            setSelectedRange(null);
                        }
                    }}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                            e.preventDefault();
                            if (e.shiftKey) {
                                if (historyIndex < textHistory.length - 1) {
                                    const newIndex = historyIndex + 1;
                                    setHistoryIndex(newIndex);
                                    updateState({ text: textHistory[newIndex] });
                                }
                            } else {
                                if (historyIndex > 0) {
                                   const newIndex = historyIndex - 1;
                                   setHistoryIndex(newIndex);
                                   updateState({ text: textHistory[newIndex] });
                                }
                            }
                        }
                    }}
                    spellCheck={false} 
                />
                
                {selectedRange && selectedRange.start !== selectedRange.end && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 p-2 rounded-xl shadow-2xl flex items-center gap-2 border animate-in fade-in slide-in-from-top-4" style={{ backgroundColor: state.theme.backgroundColor, borderColor: state.theme.primaryColor }}>
                       <Sparkles size={16} color={state.theme.primaryColor} className="ml-2"/>
                       <input 
                           autoFocus
                           type="text" 
                           placeholder="O que fazer com este trecho?" 
                           value={floatingAIText} 
                           onChange={e => setFloatingAIText(e.target.value)}
                           className="text-sm p-2 bg-transparent focus:outline-none w-80"
                           style={{ color: state.theme.textColor }}
                           onKeyDown={async (e) => {
                               if (e.key === 'Enter' && floatingAIText && !aiLoading) {
                                   const start = selectedRange.start;
                                   const end = selectedRange.end;
                                   const targetText = state.text.substring(start, end);
                                   
                                   setAiLoading(true);
                                   const prompt = `Altere o seguinte texto de acordo com esta instrução: "${floatingAIText}". Retorne APENAS o texto modificado e nada mais.`;
                                   const res = await gemini.generate(prompt, targetText);
                                   
                                   const newText = state.text.substring(0, start) + res + state.text.substring(end);
                                   handleTextChange(newText);
                                   
                                   setAiLoading(false);
                                   setSelectedRange(null);
                                   setFloatingAIText('');
                               } else if (e.key === 'Escape') {
                                   setSelectedRange(null);
                                   setFloatingAIText('');
                               }
                           }}
                       />
                       {aiLoading && <RefreshCw size={16} className="animate-spin opacity-50 mr-2"/>}
                       <button onClick={() => { setSelectedRange(null); setFloatingAIText(''); }} className="p-2 opacity-50 hover:opacity-100"><X size={16}/></button>
                    </div>
                )}
            </div>
            
            {/* AI ASSISTANT PANEL */}
            {isAIPanelOpen && (
                <div className="w-80 border-l flex flex-col p-4 animate-in slide-in-from-right" style={{ borderColor: `${state.theme.textColor}22`, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: state.theme.primaryColor }}><Sparkles size={16}/> Copiloto IA</h3>
                       <button onClick={() => setIsAIPanelOpen(false)} className="opacity-50 hover:opacity-100"><X size={16}/></button>
                   </div>
                   
                   {!state.apiKey ? (
                       <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <AlertCircle size={32} className="text-yellow-500 mb-3" />
                          <p className="text-sm mb-4">A chave de API não está configurada.</p>
                          <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-blue-600 rounded text-white text-xs font-bold hover:bg-blue-700 transition">Configurar Chave</button>
                       </div>
                   ) : (
                       <>
                           <div className="flex flex-col gap-2 mb-4">
                              <p className="text-xs opacity-70 mb-2">Ações rápidas no texto selecionado (ou texto todo se nada for selecionado):</p>
                              {[
                                  { label: "Corrigir Gramática", prompt: "Corrija a gramática e ortografia do texto, mantendo o tom." },
                                  { label: "Remover Vícios de Linguagem", prompt: "Remova vícios de linguagem, repetições excessivas e cacofonias. Torne a leitura fluida." },
                                  { label: "Mais Formal", prompt: "Reescreva o texto de forma mais formal e profissional." },
                                  { label: "Mais Dinâmico", prompt: "Reescreva o texto de forma mais energética, dinâmica e engajadora." }
                              ].map(preset => (
                                  <button 
                                     key={preset.label}
                                     onClick={async () => {
                                         const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
                                         if (!textarea) return;
                                         const start = textarea.selectionStart;
                                         const end = textarea.selectionEnd;
                                         const hasSelection = start !== end;
                                         const targetText = hasSelection ? state.text.substring(start, end) : state.text;
                                         
                                         setAiLoading(true);
                                         
                                         const prompt = hasSelection 
                                            ? `${preset.prompt} Retorne APENAS o texto modificado.`
                                            : `${preset.prompt} Retorne APENAS o texto novo gerado.`;
                                            
                                         const res = await gemini.generate(prompt, targetText);
                                         
                                         const newText = state.text.substring(0, start) + res + state.text.substring(end);
                                         handleTextChange(newText);
                                         
                                         setAiLoading(false);
                                     }}
                                     disabled={aiLoading || !state.apiKey}
                                     className="text-left text-xs p-2 rounded border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
                                  >
                                     {preset.label}
                                  </button>
                              ))}
                           </div>
                           
                           <div className="w-full h-px bg-white/10 my-2" />
                           
                           <div className="flex flex-col gap-2 flex-1">
                              <p className="text-xs opacity-70 mb-1">Pedir alteração específica:</p>
                              <textarea 
                                  value={aiCustomPrompt}
                                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                                  className="w-full h-24 bg-black/40 border border-white/10 rounded p-2 text-xs focus:outline-none resize-none"
                                  style={{ borderColor: state.theme.primaryColor, color: state.theme.textColor }}
                                  placeholder="Ex: Adicione uma piada sobre programação aqui..."
                              />
                              <button 
                                 onClick={async () => {
                                     if (!aiCustomPrompt) return;
                                     const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
                                     if (!textarea) return;
                                     const start = textarea.selectionStart;
                                     const end = textarea.selectionEnd;
                                     const hasSelection = start !== end;
                                     const targetText = hasSelection ? state.text.substring(start, end) : state.text;
                                     
                                     setAiLoading(true);
                                     
                                     const prompt = hasSelection 
                                        ? `Altere o texto de acordo com esta instrução: ${aiCustomPrompt}. Retorne APENAS o texto modificado.`
                                        : `Gere um texto de acordo com esta instrução: ${aiCustomPrompt}. Leve em consideração o seguinte texto como contexto, mas RETORNE APENAS O TEXTO NOVO GERADO, não repita o contexto.`;
                                        
                                     const res = await gemini.generate(prompt, targetText);
                                     
                                     const newText = state.text.substring(0, start) + res + state.text.substring(end);
                                     handleTextChange(newText);
                                     
                                     setAiLoading(false);
                                     setAiCustomPrompt("");
                                 }}
                                 disabled={aiLoading || !aiCustomPrompt || !state.apiKey}
                                 className="w-full p-2 rounded text-xs font-bold transition disabled:opacity-50 mt-auto"
                                 style={{ backgroundColor: state.theme.primaryColor, color: state.theme.backgroundColor }}
                              >
                                 {aiLoading ? "Processando..." : "Aplicar Mudança"}
                              </button>
                           </div>
                       </>
                   )}
                </div>
            )}
          </div>
        )}

        <div ref={scrollContainerRef} className="flex-1 relative overflow-y-auto overflow-x-hidden flex justify-center no-scrollbar" style={{ backgroundColor: 'transparent' }}>
          {/* Local Guidelines (Dynamically Positioned with Offset) */}
          <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-center items-center opacity-30 mt-16 mb-24">
             <div 
               className="absolute w-full h-[2px] transition-all duration-300 shadow-[0_0_10px_currentColor]" 
               style={{ top: `${(0.32 + (state.voiceScrollOffset / 100)) * 100}%`, backgroundColor: state.theme.guideLineColor, color: state.theme.guideLineColor }}
             />
          </div>
          
          <div className="absolute top-0 left-0 right-0 h-32 z-10 pointer-events-none sticky" style={{ background: `linear-gradient(to bottom, ${state.theme.backgroundColor} 0%, transparent 100%)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none sticky" style={{ background: `linear-gradient(to top, ${state.theme.backgroundColor} 0%, transparent 100%)` }} />
          
          <div className="relative z-10 w-full min-h-screen">
            <div className="prompter-text w-full px-4 text-left uppercase py-[50vh]" style={{ fontSize: `${state.fontSize}px`, paddingLeft: `calc(${state.margin}% + 1rem)`, paddingRight: `calc(${state.margin}% + 1rem)` }}>
              {parsedText.map((paragraph, i) => (
                <p key={i} id={`para-${paragraph.originalIndex}`} className={`mb-[1em] leading-tight ${paragraph.words.length === 0 ? 'h-[1em]' : ''}`}>
                  {paragraph.words.map((word) => (
                     <React.Fragment key={word.id}>
                       <span 
                         id={word.id}
                         onClick={() => scrollToWord(word.id)}
                         className={`cursor-pointer transition-all duration-200 hover:brightness-150 ${state.activeWordId === word.id ? 'active-word' : ''}`}
                       >
                         {word.text}
                       </span>
                       {' '}
                     </React.Fragment>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>
        <ParagraphTimeline text={state.text} onJump={jumpToParagraph} theme={state.theme} />
      </div>

            {/* RIGHT SIDEBAR */}
      {!rightSidebarOpen && (
        <button 
          onClick={() => setRightSidebarOpen(true)} 
          className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-24 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-l-2xl flex items-center justify-center text-white/50 hover:text-white transition-all z-40 border-y border-l border-white/10 shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div className={`relative flex transition-all duration-300 z-50 ${rightSidebarOpen ? 'w-64' : 'w-0'}`}>
        <aside className={`absolute inset-y-0 right-0 w-64 flex flex-col py-6 px-4 gap-6 border-l shadow-2xl backdrop-blur-md bg-opacity-95 transition-transform duration-300 ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: state.theme.surfaceColor, borderColor: `${state.theme.textColor}22` }}>
            
            <div className="flex items-center justify-between w-full mb-2">
               <button onClick={() => setRightSidebarOpen(false)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition">
                  <ChevronRight size={20} />
               </button>
               <span className="font-bold text-xs uppercase tracking-wider opacity-50 pr-2">Controles</span>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <Tooltip label="Acompanha a sua fala automaticamente usando Inteligência Artificial. (Atalho: V)" side="left" className="w-full">
                  <button 
                      id="btn-voice"
                      onClick={toggleVoice} 
                      className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 relative border-2 ${state.isVoiceMode ? 'border-red-500 text-white bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5'}`}
                  >
                      {state.isVoiceMode && <span className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-20" />}
                      {state.isVoiceMode ? <Mic size={20} className="relative z-10" /> : <MicOff size={20} />}
                      <span className="font-bold whitespace-nowrap relative z-10">Modo de Voz</span>
                      <span className="ml-auto text-xs opacity-50 font-mono relative z-10">(V)</span>
                  </button>
                </Tooltip>

                <Tooltip label="Inicia a rolagem no modo manual, ou pausa a escuta no modo voz. (Atalho: Espaço)" side="left" className="w-full">
                  <button 
                      id="btn-play"
                      onClick={() => {
                          if (!state.isPlaying && state.speed === 0) {
                              updateState({ isPlaying: true, speed: 20 });
                              setPlaying(true);
                          } else {
                              setPlaying(!state.isPlaying);
                          }
                      }} 
                      className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02] active:scale-95 duration-300 relative group border`}
                      style={{ 
                          background: state.isPlaying ? `linear-gradient(135deg, ${state.theme.primaryColor}, ${state.theme.secondaryColor})` : 'rgba(255,255,255,0.05)', 
                          borderColor: state.isPlaying ? 'transparent' : 'rgba(255,255,255,0.2)',
                          color: '#fff' 
                      }}
                  >
                      {state.isPlaying && <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-50" style={{ backgroundColor: state.theme.primaryColor }}></div>}
                      {state.isPlaying ? <Pause size={24} fill="#fff" className="text-white relative z-10" /> : <Play size={24} fill="#fff" className="text-white ml-1 relative z-10" />}
                      <span className="font-bold whitespace-nowrap relative z-10" style={{ color: state.isPlaying ? state.theme.backgroundColor : '#fff' }}>{state.isPlaying ? 'Pausar' : 'Iniciar'}</span>
                      <span className="ml-auto text-xs font-mono relative z-10" style={{ color: state.isPlaying ? `${state.theme.backgroundColor}99` : 'rgba(255,255,255,0.6)' }}>(Espaço)</span>
                  </button>
                </Tooltip>
              <Tooltip label="Exibe um guia flutuante de atalhos. Arraste para mover, scroll para redimensionar. (Atalho: /)" side="right" className="w-full">
                <button id="btn-shortcuts" onClick={() => setShowShortcutOverlay(p => !p)} className={`w-full flex items-center justify-start gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] opacity-80 hover:opacity-100 hover:bg-white/10`} style={{ color: showShortcutOverlay ? state.theme.primaryColor : state.theme.textColor }}>
                   <span className="text-lg leading-none">⌨</span>
                   <span className="font-medium text-sm whitespace-nowrap">Guia de Atalhos</span>
                   <span className="ml-auto text-xs opacity-50 font-mono">(/)</span>
                </button>
              </Tooltip>
            </div>

            <div className="w-full h-px bg-white/10 my-1" />

            <div className="flex flex-col gap-8 w-full pb-6">
                 {/* Speed */}
                 <Tooltip label="Velocidade da rolagem automática." side="left" className="w-full">
                   <div className="flex flex-col gap-3 w-full group">
                       <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                           <div className="flex items-center gap-2">
                               <Rabbit size={18}/>
                               <span className="text-sm font-medium whitespace-nowrap">Velocidade <span className="ml-1 text-[10px] font-mono opacity-50">(J/L, M/N ou ↑↓)</span></span>
                           </div>
                           <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{state.speed}%</span>
                       </div>
                       <input id="btn-speed" type="range" min="0" max="100" value={state.speed} onChange={(e) => updateState({ speed: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" style={{ accentColor: state.theme.secondaryColor } as any} />
                   </div>
                 </Tooltip>

                 {/* Font Size */}
                 <Tooltip label="Tamanho da fonte para o texto do roteiro." side="left" className="w-full">
                   <div className="flex flex-col gap-3 w-full group">
                       <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                           <div className="flex items-center gap-2">
                               <Type size={18}/>
                               <span className="text-sm font-medium whitespace-nowrap">Tamanho <span className="ml-1 text-[10px] font-mono opacity-50">(+/-)</span></span>
                           </div>
                           <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{state.fontSize}px</span>
                       </div>
                       <input id="btn-font" type="range" min="20" max="120" value={state.fontSize} onChange={(e) => updateState({ fontSize: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" style={{ accentColor: state.theme.primaryColor } as any} />
                   </div>
                 </Tooltip>
                 
                 {/* Margin */}
                 <Tooltip label="Define as margens laterais do texto para melhorar a leitura." side="left" className="w-full">
                   <div className="flex flex-col gap-3 w-full group">
                       <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                           <div className="flex items-center gap-2">
                               <Monitor size={18}/>
                               <span className="text-sm font-medium whitespace-nowrap">Margem <span className="ml-1 text-[10px] font-mono opacity-50">([ / ])</span></span>
                           </div>
                           <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{state.margin}%</span>
                       </div>
                       <input id="btn-margin" type="range" min="0" max="40" value={state.margin} onChange={(e) => updateState({ margin: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" style={{ accentColor: state.theme.primaryColor } as any} />
                   </div>
                 </Tooltip>

                 {state.isVoiceMode && (
                     <>
                        {/* Noise Gate */}
                        <Tooltip label="O quão forte você precisa falar para a IA te escutar. Útil em locais ruidosos." side="left" className="w-full">
                          <div className="flex flex-col gap-3 w-full group">
                              <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                                  <div className="flex items-center gap-2">
                                      <Volume2 size={18}/>
                                      <span className="text-sm font-medium whitespace-nowrap">Ruído (Gate)</span>
                                  </div>
                                  <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{state.noiseThreshold}</span>
                              </div>
                              <div className="relative w-full h-3 rounded-full overflow-hidden bg-black/30 border border-white/10">
                                  <div className="absolute top-0 left-0 h-full transition-all duration-75" style={{ width: `${Math.min(currentVolume * 2, 100)}%`, backgroundColor: state.theme.textColor, opacity: 0.5 }} />
                                  <input id="btn-noise" type="range" min="0" max="50" step="1" value={state.noiseThreshold} onChange={(e) => updateState({ noiseThreshold: Number(e.target.value) })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                                  <div className="absolute h-full w-[2px] bg-red-500 z-0 shadow-[0_0_5px_red]" style={{ left: `${state.noiseThreshold * 2}%` }} />
                              </div>
                          </div>
                        </Tooltip>

                        {/* Offset */}
                        <Tooltip label="Onde o texto de foco da leitura para quando você fala. Ajuda a olhar melhor para a câmera." side="left" className="w-full">
                          <div className="flex flex-col gap-3 w-full group">
                              <div className="flex justify-between items-center opacity-70 group-hover:opacity-100 transition">
                                  <div className="flex items-center gap-2">
                                      <Gauge size={18}/>
                                      <span className="text-sm font-medium whitespace-nowrap">Delay Lógico</span>
                                  </div>
                                  <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded-md">{state.voiceScrollOffset > 0 ? '+' : ''}{state.voiceScrollOffset}%</span>
                              </div>
                              <input id="btn-offset" type="range" min="-50" max="50" step="1" value={state.voiceScrollOffset} onChange={(e) => updateState({ voiceScrollOffset: Number(e.target.value) })} className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer" style={{ accentColor: state.theme.primaryColor } as any} />
                          </div>
                        </Tooltip>
                     </>
                 )}
            </div>

            {state.isVoiceMode && liveTranscript && (
               <div className="absolute top-4 right-full mr-4 pointer-events-none z-50 w-56">
                 <div className="backdrop-blur-md px-4 py-2 rounded-xl text-sm font-mono border shadow-lg bg-opacity-90 animate-in fade-in slide-in-from-right-2 text-right break-words" style={{ backgroundColor: state.theme.backgroundColor, color: state.theme.textColor, borderColor: `${state.theme.textColor}22` }}>
                    {liveTranscript.slice(-30)}
                 </div>
               </div>
            )}
        </aside>
      </div>

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} state={state} updateState={updateState} />
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} theme={state.theme} />
      <DocsModal isOpen={showDocs} onClose={() => setShowDocs(false)} theme={state.theme} />
      <MentorChat isOpen={showChat} onClose={() => setShowChat(false)} currentText={state.text} theme={state.theme} />

      {/* SHORTCUT OVERLAY */}
      {showShortcutOverlay && (
        <div
          className="fixed z-[100] select-none cursor-move font-mono leading-relaxed"
          style={{
            top: shortcutPos?.y ?? 20,
            right: shortcutPos ? undefined : 20,
            left: shortcutPos?.x,
            fontSize: `${shortcutSize}px`,
            color: `${state.theme.textColor}99`,
          }}
          onMouseDown={handleShortcutDrag}
          onWheel={(e) => { e.stopPropagation(); setShortcutSize(s => Math.max(8, Math.min(22, s + (e.deltaY < 0 ? 1 : -1)))); }}
        >
          <span style={{color: `${state.theme.primaryColor}AA`, fontWeight: 700}}>⌨ Atalhos</span><br/>
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
          <span style={{opacity: 0.5}}>───────────</span><br/>
          J/↓ · − Velocidade<br/>
          L/↑ · + Velocidade<br/>
          +/− · Fonte<br/>
          [ / ] · Margem<br/>
          <span style={{opacity: 0.4, fontSize: '0.85em'}}>
            / · fechar &nbsp;|&nbsp; arrastar · mover<br/>
            scroll · resize
          </span>
        </div>
      )}

      {/* GUIDED TOUR OVERLAY */}
      <TourOverlay 
         active={isTourActive}
         stepIndex={tourStep}
         onClose={() => setIsTourActive(false)}
         onNext={() => { if(tourStep < TOUR_STEPS.length - 1) setTourStep(s => s + 1); else setIsTourActive(false); }}
         onPrev={() => { if(tourStep > 0) setTourStep(s => s - 1); }}
         theme={state.theme}
         setLeftSidebarOpen={setLeftSidebarOpen}
         setRightSidebarOpen={setRightSidebarOpen}
      />
    </div>
  );
};
const root = createRoot(document.getElementById("root")!);
root.render(<App />);