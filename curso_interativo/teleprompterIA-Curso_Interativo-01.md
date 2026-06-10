Para transformar o tour do **fernangcortes/teleprompteria** em uma trilha de aprendizado imersiva, precisamos dividir a experiência em duas macrofases bem definidas dentro da arquitetura do aplicativo:

1. **Fase de Onboarding e Visão Geral (Tour Conceitual):** Apresenta o manifesto do projeto, o porquê de sua existência (eliminar a fricção entre escrita e fala usando IA), os menus, a filosofia de design e os atalhos globais. Esses passos são informativos (type: 'info') e progridem com o clique do usuário após a leitura.  
2. **Fase de Laboratório Prático (Testes de Estado):** Foca em cada ferramenta isolada. O usuário só avança se interagir com o componente e o validador programático detectar a alteração correspondente no estado da aplicação (type: 'test').

Para suportar essa nova estrutura completa no repositório **fernangcortes/teleprompteria**, vamos redefinir a estrutura de dados das lições para acomodar os dois tipos de passos.

### **Arquitetura de Dados: src/constants/courseLessons.ts**

Atualizaremos a tipagem para diferenciar o comportamento do Mentor e da interface gráfica durante o curso de introdução geral e de testes práticos:

TypeScript  
import { ConfigState } from '../context/ConfigContext';  
import { PlaybackState } from '../context/PlaybackContext';

export interface CourseStep {  
  id: string;  
  type: 'info' | 'test';  
  title: string;  
  instruction: string;  
  targetElementSelector?: string; // Classe/ID CSS para aplicar efeito de destaque (Glow/Highlight)  
  validate?: (config: ConfigState, playback: PlaybackState, currentText: string) \=\> boolean;  
  mentorContext: string;  
}

export const TELEPROMPTER\_COURSE: CourseStep\[\] \= \[  
  // \==========================================  
  // FASE 1: APRESENTAÇÃO E TOUR GERAL (INFO)  
  // \==========================================  
  {  
    id: 'intro\_manifesto',  
    type: 'info',  
    title: 'Bem-vindo ao teleprompterIA\! 🚀',  
    instruction: 'Este projeto nasceu para transformar a forma como criamos e entregamos conteúdo audiovisual. Combinando o clássico teleprompter com inteligência artificial, eliminamos o estresse de decorar textos e o ritmo artificial de leitura. Ao final deste curso, você dominará o controle de ritmo, espelhamento físico e acompanhamento por voz.',  
    mentorContext: 'O curso começou agora. Dê as boas-vindas calorosas ao aluno, valide a importância de dominar o teleprompterIA e se coloque à disposição para dúvidas sobre o ecossistema.'  
  },  
  {  
    id: 'intro\_design\_layout',  
    type: 'info',  
    title: 'A Filosofia do Design',  
    instruction: 'Nossa interface foi projetada para foco absoluto. No centro, fica o Editor de Texto Dinâmico. À esquerda, as ferramentas de gerenciamento de arquivos e histórico. À direita, os controles de parametrização estética e IA. Na parte superior ou flutuante, você encontra o HUD de atalhos rápidos de execução.',  
    targetElementSelector: '.app-layout-grid',  
    mentorContext: 'Explique brevemente que o design foca em baixa carga cognitiva para que o operador ou o locutor não se distraiam durante a gravação.'  
  },  
  {  
    id: 'intro\_shortcuts',  
    type: 'info',  
    title: 'Teclado como Extensão: Atalhos',  
    instruction: 'A operação profissional não usa mouse. Decore os principais comandos: \[Espaço\] Inicia/Pausa a rolagem; \[Setas Cima/Baixo\] Ajustam a velocidade; \[Seta Esquerda/Direita\] Navegam pelos parágrafos do roteiro; \[M\] Alterna o modo Espelhamento (Mirror).',  
    mentorContext: 'O usuário está revisando os atalhos de teclado. Se ele interagir com você, reforce que os atalhos garantem que ele consiga operar o sistema discretamente enquanto grava.'  
  },

  // \==========================================  
  // FASE 2: LABORATÓRIO E TESTES PRÁTICOS (TEST)  
  // \==========================================  
  {  
    id: 'test\_text\_input',  
    type: 'test',  
    title: 'Laboratório 1: Ingestão de Roteiro',  
    instruction: 'Hora de agir\! Digite ou cole um roteiro com pelo menos 15 palavras no editor central para habilitar a análise de linha do tempo.',  
    targetElementSelector: '.text-editor-textarea',  
    validate: (config, playback, text) \=\> text.trim().split(/\\s+/).length \>= 15,  
    mentorContext: 'O aluno precisa inserir texto. Monitore se ele colou o texto e encoraje-o a colocar um roteiro real para experimentar a segmentação.'  
  },  
  {  
    id: 'test\_mirror\_mode',  
    type: 'test',  
    title: 'Laboratório 2: Preparação Física (Espelhamento)',  
    instruction: 'Se você estiver gravando com uma câmera profissional atrás de um vidro semi-espelhado, o texto precisa ser invertido. Ative o "Modo Espelho" (Mirror Mode) nas configurações da direita ou pressione \[M\].',  
    targetElementSelector: '.mirror-mode-toggle',  
    validate: (config) \=\> config.mirrorMode \=== true,  
    mentorContext: 'Etapa de espelhamento de texto. Explique que isso serve para hardware físico de teleprompter, onde o monitor reflete em um vidro invertido.'  
  },  
  {  
    id: 'test\_voice\_tracking',  
    type: 'test',  
    title: 'Laboratório 3: Inteligência de Voz Avançada',  
    instruction: 'Ative a chave de "Voice Tracking". Isso fará com que o mecanismo avance as linhas dinamicamente ao escutar as palavras corretas saindo do seu microfone.',  
    targetElementSelector: '.voice-tracking-card',  
    validate: (config) \=\> config.voiceTrackingEnabled \=== true,  
    mentorContext: 'O aluno está ligando a sincronia por voz. Avise-o que, ao iniciar, o navegador pedirá permissão de microfone.'  
  }  
\];

### **Lógica de Controle do Curso: Adaptação no CourseContext.tsx**

Para lidar com os passos do tipo info (onde o botão "Avançar" fica sempre disponível) e passos do tipo test (onde o botão fica bloqueado até isStepValidated ser verdadeiro):

TypeScript  
const nextStep \= () \=\> {  
  const isCurrentStepInfo \= currentStep.type \=== 'info';  
    
  if ((isCurrentStepInfo || isStepValidated) && currentStepIndex \< TELEPROMPTER\_COURSE.length \- 1) {  
    setCurrentStepIndex(prev \=\> prev \+ 1);  
    setIsStepValidated(false);  
  } else if (currentStepIndex \=== TELEPROMPTER\_COURSE.length \- 1) {  
    // Curso concluído com sucesso\!  
    setIsActive(false);  
  }  
};

Na Interface do Usuário (TourOverlay.tsx), se currentStep.type \=== 'test', você pode renderizar um indicador visual do lado do botão de avanço como um *Badge* escrito: 🔒 Aguardando ação do usuário... que se transforma em ✅ Objetivo Cumprido\! Avançar assim que a validação de estado passar.

### **Pergunta de Verificação da Implementação**

Esta estrutura modular cobrindo desde o manifesto de fundação do **teleprompterIA** até os testes rigorosos de estado atende perfeitamente aos requisitos do seu curso completo? Se essa implementação e modelo arquitetural funcionaram como esperado, me confirme para podermos isolar e organizar as linhas de comando do código na sua biblioteca de componentes\!

### **Resumo Conciso em Tópicos**

* **Divisão de Aprendizado em Duas Fases:** Criação de uma fase teórica/visual (info) para conceitos, design e atalhos, seguida por uma fase prática em laboratório (test).  
* **Estrutura de Dados Polimórfica:** O arquivo de lições mapeia seletores CSS de forma inteligente para destacar visualmente a ferramenta em foco na tela (targetElementSelector).  
* **Validação por Estado Reativo:** Os passos práticos inspecionam propriedades em tempo real (como contagem de palavras do texto e variáveis booleanas como mirrorMode e voiceTrackingEnabled).  
* **Tutor Integrado Contextualizado:** O prompt de sistema do chatbot se adapta indicando se o aluno está lendo um conceito de design ou travado tentando executar um teste de hardware.