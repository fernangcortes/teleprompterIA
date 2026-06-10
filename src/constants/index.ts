import { ThemeConfig } from "../types";

export const PRESETS: Record<string, ThemeConfig> = {
  original: {
    appName: "teleprompterIA",
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
    appName: "teleprompterIA",
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
    appName: "teleprompterIA",
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
    appName: "teleprompterIA",
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
    appName: "teleprompterIA",
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

export const DOCS_CONTENT = {
  readme: `# teleprompterIA - Documentação

## Sobre o Projeto
O teleprompterIA é uma solução profissional de teleprompter baseada na web. Utiliza Inteligência Artificial para reconhecimento de voz em tempo real (Smart Scroll) e geração de roteiros.

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
export const DEFAULT_TEXT = `GUIA AVANÇADO - DOMINANDO O TELEPROMPTERIA
Olá e seja muito bem-vindo a uma nova experiência de leitura e apresentação. Se você está lendo este texto agora, significa que você deu o primeiro passo para transformar a maneira como se comunica com o seu público. Este não é apenas um teleprompter comum; é uma ferramenta desenhada para potencializar a sua oratória, garantindo que cada palavra seja entregue com precisão, confiança e naturalidade.
Imagine poder falar para a câmera sem aquela sensação robótica de quem está apenas lendo um texto. Com o teleprompterIA, o controle está literalmente em suas mãos ou no ritmo da sua voz. A tecnologia de rolagem suave que implementamos permite que o texto flua como água, adaptando-se à sua velocidade natural de fala, e não o contrário. Você não precisa mais correr atrás das palavras ou esperar que elas apareçam de repente na tela, quebrando o seu raciocínio.
Vamos falar sobre os recursos visuais e o conforto ocular. Perceba como o destaque da palavra atual não é agressivo. Utilizamos um brilho suave, quase imperceptível, que guia o seu olhar sem cansar a vista, mesmo após longas sessões de gravação. Isso é fundamental para manter o foco e a conexão com a lente, que, no final das contas, é a conexão direta com quem está te assistindo do outro lado. Um olhar firme transmite autoridade e credibilidade.
Ajustar a velocidade nunca foi tão preciso e intuitivo. Se você precisa de um ritmo mais lento para explicar um assunto técnico e complexo, ou de um ritmo mais dinâmico para uma chamada de ação entusiasmada, os atalhos de teclado estão aqui para servir você instantaneamente. Lembre-se: as teclas J e L são seus melhores amigos durante a gravação. Com elas, você pode acelerar ou desacelerar o texto em tempo real. Use o Shift para mudanças rápidas ou o Alt para aquele ajuste fino e cirúrgico de velocidade.
Além disso, a projeção em segunda tela foi pensada meticulosamente para profissionais de vídeo. Seja espelhando horizontalmente ou verticalmente, o texto se adapta perfeitamente ao seu hardware, seja um teleprompter de vidro profissional ou um monitor dedicado improvisado. E se você se perder no meio do discurso? Não tem problema algum. O sistema de clique permite que você salte instantaneamente para qualquer parte do texto, retomando o raciocínio sem cortes bruscos na sua performance.
Aproveite este momento para praticar a sua respiração e entonação. Respire fundo, mantenha a postura ereta e deixe que o teleprompterIA guie você por esta jornada de comunicação. Fale com clareza, articule bem as sílabas e sinta a diferença que uma ferramenta profissional pode fazer no seu resultado final. Estamos aqui para garantir que a sua mensagem seja não apenas ouvida, mas profundamente entendida e lembrada por todos.`;
