# 🎬 teleprompterIA

> **teleprompterIA** é um teleprompter profissional moderno, inteligente e de alto desempenho, enriquecido com Inteligência Artificial para criação, revisão e controle de oratória em tempo real.

O projeto foi totalmente reestruturado em uma arquitetura modular moderna no ecossistema React + Vite, eliminando gargalos de renderização, suportando empacotamento offline nativo com Tailwind CSS v4, e oferecendo um editor de roteiros conformável e uma integração avançada com modelos da família Google Gemini e DeepSeek.

---

## ✨ Funcionalidades Principais

* **🤖 Copiloto IA Inteligente**:
  * Escolha dinâmica entre os modelos `gemini-2.5-flash`, `gemini-flash-latest` e `deepseek-v4-flash`.
  * **Visual Diff no Parágrafo**: A IA gera alterações estruturadas em JSON. Você visualiza a comparação parágrafo por parágrafo (original deletado em vermelho vs sugerido em verde) com botões para **Aceitar** ou **Rejeitar** cada trecho individualmente.
  * **Resumo de Alterações**: A IA retorna um log explicativo curto do que foi alterado.
  * **Refinamento por Seleção**: Selecione qualquer trecho do roteiro e dê comandos de voz/texto específicos apenas para aquela parte (com o restante do documento servindo de contexto de fundo).
* **🎙️ Smart Scroll (Rolagem por Voz)**:
  * Utiliza reconhecimento de fala nativo (Web Speech API) para sincronizar o scroll com a leitura do orador.
  * Algoritmo inteligente com tolerância ajustável e barreira de ruído para evitar saltos ou trancos.
* **🌐 Projeção Espelhada Remota**:
  * Sincronização bidirecional em tempo real entre a janela do operador e a janela de projeção usando a API nativa `BroadcastChannel` (`teleprompteria-sync`).
  * Suporta espelhamento horizontal (Mirror X) e vertical (Mirror Y).
* **🖥️ Layout Flexível e Conformável**:
  * Barras laterais e o painel do Copiloto IA são redimensionáveis horizontalmente por arrasto na borda e lembram suas larguras via `localStorage`.
  * Editor de texto minimalista configurável por zoom rápido de fonte (`Ctrl + Scroll` do mouse) e espaçamento gestáltico entre parágrafos.
* **⚡ Atalhos Interativos e Guia Flutuante**:
  * Painel flutuante de atalhos e status que pode ser arrastado pela tela e redimensionado.
* **🧠 Mentor de Palco (Chat)**:
  * Um assistente de IA especialista em oratória e estúdio de gravação que dá feedbacks rápidos estruturados como um balão de fala de quadrinhos.
* **🎓 Curso Prático Interativo**:
  * Uma trilha de aprendizado imersiva dividida em 12 lições práticas com validação em tempo real das ações do usuário (abrir editor, selecionar texto, configurar APIs, mudar temas, abrir projeção, usar atalhos, etc.).
  * Possui balão flutuante arrastável, checklist dinâmico de objetivos compostos e botão de avançar progressivo.
  * Veja mais detalhes técnicos no [Guia do Curso Interativo](file:///curso_interativo/CURSO_INTERATIVO.md).

---

## 🚀 Instalação e Execução

### Pré-requisitos
* **Node.js** (Versão 18 ou superior recomendada)
* **Gerenciador de pacotes** (npm, yarn ou pnpm)

### Execução Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie ou configure as chaves de API no arquivo `.env.local` na raiz do projeto:
   ```env
   GEMINI_API_KEY="SuaChaveDoGeminiAqui"
   DEEPSEEK_API_KEY="SuaChaveDoDeepSeekAqui"
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para gerar o pacote de produção minificado e offline:
   ```bash
   npm run build
   ```

---

## ⌨️ Atalhos de Teclado

Durante a apresentação ou edição, os seguintes atalhos estão ativos no teleprompter:

| Tecla | Ação |
|---|---|
| `Espaço` | Iniciar / Pausar rolagem |
| `V` | Ligar / Desligar modo Rolagem por Voz |
| `E` | Abrir / Fechar Editor de Roteiro |
| `M` | Ligar / Desligar Espelhamento Horizontal (Mirror X) |
| `N` | Ligar / Desligar Espelhamento Vertical (Mirror Y) |
| `Ctrl + Scroll` | Zoom de tamanho da fonte (com o editor ou atalhos selecionados) |
| `[ / ]` | Ajustar margem esquerda e direita (leitura confortável) |
| `Seta Cima / Baixo` | Aumentar / Diminuir velocidade de rolagem constante |

---

## 📂 Estrutura do Código (`/src`)

A base de código foi estruturada em diretórios limpos e bem definidos:

* `types/`: Declarações estritas de interfaces (`ThemeConfig`, `PrompterState`, etc.).
* `constants/`: Textos padrão de introdução, paletas de cores dos temas e guias.
* `utils/`: Algoritmos puros (como cálculo de distância Levenshtein para tracking de voz).
* `services/`: Encapsulamento de APIs (`gemini.ts` com SDK Gemini e requisições nativas DeepSeek).
* `context/`: Separação de estados (`ConfigContext` para opções salvas de sessão e `PlaybackContext` para velocidade e volume).
* `hooks/`: Gerenciadores de fluxo (Engine de scroll e captação de voz por SpeechRecognition).
* `components/`: UI dividida em modais, mentor de palco, barra lateral de layout e o editor central.
