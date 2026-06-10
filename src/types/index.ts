export interface ThemeConfig {
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

export interface PrompterState {
  text: string;
  isPlaying: boolean;
  speed: number; // 1 to 100 (Manual Speed)
  initialPushSpeed: number;
  apiKey: string;
  deepseekApiKey: string;
  aiModel: string;
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

export interface ParsedWord {
  id: string;
  text: string;
  clean: string;
}

export interface ParsedParagraph {
  originalIndex: number;
  words: ParsedWord[];
}

export type MascotEmotion = 'idle' | 'animated' | 'doubt' | 'writing' | 'nervous' | 'vanishing';
