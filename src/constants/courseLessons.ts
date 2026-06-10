import { ThemeConfig } from "../types";

export interface CourseStep {
  id: string;
  type: 'info' | 'test';
  title: string;
  instruction: string;
  targetElementSelector?: string; // Seletor CSS para aplicar o Spotlight
  mentorContext: string;
  tasks?: string[];
  validateTasks?: (
    config: {
      text: string;
      fontSize: number;
      margin: number;
      speed: number;
      mirrorX: boolean;
      mirrorY: boolean;
      theme: ThemeConfig;
      voiceScrollOffset: number;
      showSettings: boolean;
      leftSidebarOpen: boolean;
      rightSidebarOpen: boolean;
      showShortcutOverlay: boolean;
      isEditorOpen: boolean;
      initialPushSpeed: number;
      noiseThreshold: number;
    },
    playback: {
      isPlaying: boolean;
      isVoiceMode: boolean;
    },
    isProjectionActive?: boolean,
    hotkeysTested?: Record<string, boolean>,
    selectionText?: string,
    dragged?: boolean,
    enterSettings?: {
      initialPushSpeed: number;
      appName: string;
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
    } | null
  ) => boolean[];
  validate?: (
    config: {
      text: string;
      fontSize: number;
      margin: number;
      speed: number;
      mirrorX: boolean;
      mirrorY: boolean;
      theme: ThemeConfig;
      voiceScrollOffset: number;
      showSettings: boolean;
      leftSidebarOpen: boolean;
      rightSidebarOpen: boolean;
      showShortcutOverlay: boolean;
      isEditorOpen: boolean;
      initialPushSpeed: number;
      noiseThreshold: number;
    },
    playback: {
      isPlaying: boolean;
      isVoiceMode: boolean;
    },
    isProjectionActive?: boolean,
    hotkeysTested?: Record<string, boolean>
  ) => boolean;
}

export const TELEPROMPTER_COURSE: CourseStep[] = [
  // Phase 1: Onboarding / Info
  {
    id: 'intro_manifesto',
    type: 'info',
    title: 'Bem-vindo ao teleprompterIA! 🚀',
    instruction: 'Este projeto foi criado para revolucionar a criação audiovisual, eliminando a barreira entre a escrita e a fala natural. Combinando o teleprompter clássico com IA, ajudamos você a falar com naturalidade sem ter que decorar textos. Vamos iniciar um curso prático e completo para você dominar todas as funções da ferramenta!',
    mentorContext: 'O curso começou agora. Dê boas-vindas calorosas ao aluno de teleprompterIA, valide a importância de uma performance natural e se coloque à disposição para explicar as ferramentas.'
  },
  {
    id: 'intro_design_layout',
    type: 'info',
    title: 'A Filosofia do Design',
    instruction: 'Nossa interface foi projetada para foco cognitivo total: no centro temos a tela de leitura; na esquerda (LeftSidebar), controle de arquivos, temas e mentor; na direita (RightSidebar), os controles estéticos e motor de rolagem.',
    targetElementSelector: '.app-layout-grid',
    mentorContext: 'Explique a filosofia do layout do teleprompterIA: foco total e redução de distrações visuais durante a gravação.'
  },
  // Phase 2: Labs / Tests
  {
    id: 'test_text_input',
    type: 'test',
    title: 'Laboratório 1: Ingestão de Roteiro',
    instruction: 'Abra o Editor de Roteiro clicando no botão "Editor de Texto" (ou atalho [E]) na barra esquerda. Digite ou cole um roteiro com pelo menos 15 palavras no editor central. Se preferir não escrever agora, abra o Mentor de Palco no menu esquerdo e clique em "Gerar Roteiro de Teste" para injetarmos um roteiro de exemplo cheio de erros automaticamente!',
    targetElementSelector: '#btn-editor',
    validate: (config, playback) => config.isEditorOpen && config.text.trim().split(/\s+/).filter(Boolean).length >= 15,
    mentorContext: 'O aluno deve abrir o editor e colocar um roteiro. Se ele preferir, lembre-o de que pode clicar no botão "Gerar Roteiro de Teste" aqui no Mentor de Palco.'
  },
  {
    id: 'test_text_selection_ai',
    type: 'test',
    title: 'Laboratório 2: Edição Parcial com Copiloto IA',
    instruction: 'Você não precisa reescrever todo o texto com a IA; você pode ajustar apenas um trecho! Com o Editor aberto, selecione com o mouse um trecho do seu roteiro no editor. Depois, clique em "Assistente IA" no menu do Editor para abrir o painel do Copiloto. Note que o balão do curso pode cobrir a visão: clique e arraste este balão com o mouse para fora da área do painel. Por fim, use o Assistente IA para corrigir a gramática e clique em "Substituir na Seleção".',
    targetElementSelector: '#editor-textarea',
    tasks: [
      "Selecionar um trecho do roteiro no editor de texto",
      "Arrastar este balão do curso com o mouse para liberar a visão do painel",
      "Usar o Copiloto IA para alterar o trecho selecionado ou corrigir gramática"
    ],
    validateTasks: (config, playback, isProjectionActive, hotkeysTested, selectionText, dragged) => {
      const hasSelection = !!(selectionText && selectionText.trim().length > 0);
      const hasDragged = !!dragged;
      const text = config.text.toLowerCase();
      const hasAlteredText = text.length > 30 && 
        text !== ROTEIRO_COM_ERROS.toLowerCase() && (
          !text.includes("rezpiraçaõ") || 
          !text.includes("hojé") || 
          !text.includes("vcs")
        );
      return [hasSelection, hasDragged, hasAlteredText];
    },
    mentorContext: 'O aluno está aprendendo a selecionar e alterar trechos específicos do roteiro com a IA para economizar tempo. Explique que isso permite refinar a entonação ou corrigir partes de forma ágil.'
  },
  {
    id: 'test_settings_custom',
    type: 'test',
    title: 'Laboratório 3: Customização Geral e de Marca',
    instruction: 'O menu de Configurações centraliza chaves de API, a escolha de modelos de IA, a velocidade de empurrão inicial da rolagem, e toda a identidade visual e nome do app. Abra o painel de configurações clicando em "Configurações" (T) na barra lateral esquerda e cumpra as 3 tarefas de customização abaixo.',
    targetElementSelector: '#btn-theme',
    tasks: [
      "Alterar o 'Empurrão de Velocidade' para qualquer valor diferente de 10% (na aba Geral)",
      "Mudar o Nome do App na Identidade para qualquer valor diferente de 'teleprompterIA' (na aba Aparência)",
      "Escolher um preset de tema ou alterar uma cor customizada (na aba Aparência)"
    ],
    validateTasks: (config, playback, isProjectionActive, hotkeysTested, selectionText, dragged, enterSettings) => {
      const initialSpeed = enterSettings ? enterSettings.initialPushSpeed : 10;
      const initialName = enterSettings ? enterSettings.appName : "teleprompterIA";
      const initialPrimary = enterSettings ? enterSettings.primaryColor : "#3b82f6";
      const initialBackground = enterSettings ? enterSettings.backgroundColor : "#000000";
      const initialText = enterSettings ? enterSettings.textColor : "#ffffff";

      const isSpeedChanged = config.initialPushSpeed !== initialSpeed;
      const isNameChanged = config.theme.appName && config.theme.appName.toLowerCase() !== initialName.toLowerCase() && config.theme.appName.trim().length > 0;
      const isColorsChanged = config.theme.primaryColor !== initialPrimary || 
        config.theme.backgroundColor !== initialBackground || 
        config.theme.textColor !== initialText;
      return [isSpeedChanged, !!isNameChanged, isColorsChanged];
    },
    mentorContext: 'O aluno está aprendendo a configurar chaves de API, escolher modelos de IA, definir o empurrão de velocidade de rolagem e personalizar a identidade visual do app. Explique que o Empurrão garante a partida rápida e que customizar as cores melhora o conforto visual.'
  },
  {
    id: 'test_projection_mirror',
    type: 'test',
    title: 'Laboratório 4: Projeção e Espelhamento',
    instruction: 'Para gravar de forma profissional, você pode abrir o prompter em uma segunda janela limpa. Clique em "Janela Externa" (atalho [W]) na barra esquerda para abrir o pop-up de projeção. Ela abrirá espelhada por padrão; como estamos testando em uma tela comum, clique em "Espelhar (X)" ou pressione [X] para desespelhar e permitir a leitura direta.',
    targetElementSelector: '#btn-popup',
    tasks: [
      "Abrir a Janela de Projeção Externa (atalho [W] ou botão)",
      "Desativar o espelhamento horizontal (X) para leitura em tela comum"
    ],
    validateTasks: (config, playback, isProjectionActive) => {
      return [!!isProjectionActive, config.mirrorX === false];
    },
    mentorContext: 'O aluno está configurando a projeção profissional secundária e desativando o espelhamento para leitura direta.'
  },
  {
    id: 'test_manual_speed_font_margin',
    type: 'test',
    title: 'Laboratório 5: Ajustes Estéticos (Velocidade, Fonte e Margem)',
    instruction: 'No menu da direita, controle os aspectos visuais e de rolagem. Ajuste a Velocidade de rolagem (diferente de 30%), altere o Tamanho da Fonte (diferente de 64px) e ajuste a Margem de leitura (maior que 0%) para concentrar o olhar no centro da câmera.',
    targetElementSelector: '#btn-speed',
    tasks: [
      "Ajustar a velocidade da rolagem manual para um valor diferente de 30%",
      "Mudar o tamanho da fonte para um valor diferente de 64px",
      "Definir a margem de leitura lateral para um valor maior que 0%"
    ],
    validateTasks: (config, playback) => {
      return [config.speed !== 30, config.fontSize !== 64, config.margin > 0];
    },
    mentorContext: 'Explique que margens mais próximas do centro evitam o movimento visível dos olhos na gravação, e que velocidade e fonte corretas evitam engasgos na fala.'
  },
  {
    id: 'test_voice_mode_controls',
    type: 'test',
    title: 'Laboratório 6: Modo de Voz e Ajustes de Foco',
    instruction: 'Ative o Modo de Voz (Smart Scroll) clicando no botão na barra direita ou usando o atalho [V]. Com o modo ativo, personalize os ajustes de calibração:\n\n• O Filtro de Ruído (Gate) define o nível de volume mínimo para ignorar barulhos do ambiente (como ventilador, cliques ou eco) e captar apenas sua voz de leitura.\n• O Delay Lógico (Linha Guia) ajusta a altura vertical ideal na tela onde o texto falado deve se posicionar, mantendo sua leitura sempre alinhada com a linha dos olhos direcionada à câmera.\n\nUse os sliders para alterar o Filtro de Ruído (diferente de 10) e o Delay Lógico (diferente de 0%). Se quiser entender melhor como calibrar esses ajustes no seu estúdio, basta perguntar aqui mesmo para o Mentor!',
    targetElementSelector: '#btn-voice',
    tasks: [
      "Ativar o Modo de Voz (Smart Scroll) com o atalho [V] ou botão",
      "Ajustar o controle de Ruído (Gate) para filtrar barulhos ambiente",
      "Mudar a posição do Delay Lógico (Linha Guia) para ajustar o foco"
    ],
    validateTasks: (config, playback) => {
      return [playback.isVoiceMode === true, config.noiseThreshold !== 10, config.voiceScrollOffset !== 0];
    },
    mentorContext: 'Destaque que a rolagem por voz acompanha a leitura em tempo real e os ajustes de ruído e linha guia ajudam a calibrar o sistema para qualquer estúdio.'
  },
  {
    id: 'test_hide_sidebars',
    type: 'test',
    title: 'Laboratório 7: Ocultar Menus (Modo Foco)',
    instruction: 'Para gravar sem distrações visuais na tela, oculte as barras laterais pressionando a tecla [B] no seu teclado.',
    targetElementSelector: '.app-layout-grid',
    validate: (config, playback) => !config.leftSidebarOpen && !config.rightSidebarOpen,
    mentorContext: 'O aluno ocultou os menus laterais usando o atalho [B]. Explique que esta tela limpa é perfeita para o momento da gravação, eliminando qualquer distração visual.'
  },
  {
    id: 'test_shortcuts_overlay',
    type: 'test',
    title: 'Laboratório 8: Guia de Atalhos Flutuante',
    instruction: 'Com as barras fechadas, o Guia de Atalhos flutuante é de grande ajuda. Pressione a tecla [/] para exibi-lo na tela. Lembre-se: você pode clicar e arrastar a janelinha pelo topo para posicionar onde quiser, e usar o scroll do mouse sobre ela para aumentar/diminuir seu tamanho.',
    targetElementSelector: '.app-layout-grid',
    validate: (config, playback) => config.showShortcutOverlay === true,
    mentorContext: 'O usuário está testando o Guia de Atalhos flutuante. Lembre-o de que ele é arrastável e redimensionável por mouse-wheel para não cobrir a área de leitura do roteiro.'
  },
  {
    id: 'test_global_shortcuts',
    type: 'test',
    title: 'Laboratório 9: Teste de Atalhos Globais',
    instruction: 'Parabéns por chegar até aqui! Para validar sua operação profissional, teste pelo menos 3 atalhos de teclado agora. Pressione pelo menos 3 teclas dentre: [Espaço] (Iniciar/Pausar), [V] (Modo de Voz), [R] (Reiniciar Texto), [B] (Mostrar/Ocultar Sidebars) ou [/] (Guia de Atalhos).',
    targetElementSelector: '.app-layout-grid',
    tasks: [
      "Pressionar o primeiro atalho de teclado global",
      "Pressionar o segundo atalho de teclado global",
      "Pressionar o terceiro atalho de teclado global"
    ],
    validateTasks: (config, playback, isProjectionActive, hotkeysTested) => {
      if (!hotkeysTested) return [false, false, false];
      const keys = Object.keys(hotkeysTested).filter(k => hotkeysTested[k]);
      return [
        keys.length >= 1,
        keys.length >= 2,
        keys.length >= 3
      ];
    },
    mentorContext: 'O aluno está testando os atalhos de teclado para avançar. Incentive-o a pressionar as teclas Espaço, V, R, B ou / para decorar os controles e demonstrar agilidade.'
  },
  {
    id: 'course_complete',
    type: 'info',
    title: 'Parabéns, Diretor! 🎬',
    instruction: 'Você dominou 100% do teleprompterIA! Está pronto para gravar vídeos perfeitos. Se encontrar qualquer problema ou tiver sugestões, utilize os botões de contato com o desenvolvedor localizados no rodapé da barra lateral direita. Sucesso nas gravações!',
    targetElementSelector: '#developer-support',
    mentorContext: 'O curso foi concluído! Dê os parabéns ao aluno com jargões de set de filmagem, elogie a dedicação dele e deseje sucesso nas próximas gravações.'
  }
];

export const ROTEIRO_COM_ERROS = `ROTERO DETESTE PARA PROMPTE - OLÁ A TODOS
Hojé eu vou vim falar pra vcs sobre as coisa mais importante de oratoria q existi... sabe, tipo assim, a jente fica muito nervoso na frente da camera. E a camera ela fica ali olhando pra nois e a jente nao sabe o que diser, né?
Entao, tipo, o teleprompteria ajuda d+ porq ele dexa o texto rolando macio, tipo água, saca? Mas se vc nao treinar a sua rezpiraçaõ, a casa cai! Vc tem que rezpirar e nao comer as palavra.
E outra coisa, os atalho d teclado tipo J e L de velocidade ajuda mt. Se vc nao sabia disso, agora sabe. Vc aperta J e vai mais devagar, aperta L e vai mais rapido. E o espaço da play e pause. Facil né?!
Entao é isso, vamo testar essa ferramenta q é muito top e muito legal e daora. Tchau.`;
