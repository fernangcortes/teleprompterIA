Para tirar o curso interativo do papel e integrá-lo de forma limpa ao repositório **fernangcortes/teleprompteria**, precisamos de uma estratégia de desenvolvimento em etapas. O objetivo é garantir que a nova máquina de estados não quebre os contextos existentes (ConfigContext e PlaybackContext) e que a interface reaja perfeitamente aos destaques visuais.  
Aqui está o plano de implementação dividido em 5 etapas lógicas:

## **🛠️ Plano de Desenvolvimento: Curso Interativo teleprompterIA**

### **Etapa 1: Estrutura de Dados e Novo Contexto Global**

O coração do curso é o gerenciamento do progresso e a validação em tempo real.

* **Criar src/constants/courseLessons.ts:** Centralizar a matriz de lições, separando os passos conceituais (type: 'info') dos laboratoriais (type: 'test').  
* **Criar src/context/CourseContext.tsx:** Implementar o provedor de estado que armazena currentStepIndex, monitora se o passo atual está validado e expõe a função nextStep().  
* **Injeção no Root:** Envolver o componente principal no CourseProvider dentro de src/App.tsx, logo abaixo dos provedores de configuração e reprodução para herdar seus estados.

### **Etapa 2: Mecanismo de Destaque Visual (UI Spotlight)**

Para o usuário saber exatamente onde clicar, a interface precisa apontar para o componente correto baseado no targetElementSelector.

* **Refatorar ou substituir TourOverlay.tsx:** Adaptar o antigo modal de tour para ler os dados do novo CourseContext.  
* **Implementar Efeito CSS de Glow/Foco:** Criar uma classe global (ex: .course-highlight) em src/index.css com animação de pulso ou borda iluminada.  
* **Manipulação de DOM Segura:** Usar um useEffect dentro do overlay que monitora o passo atual, busca o elemento via document.querySelector(currentStep.targetElementSelector) e adiciona/remove a classe de destaque dinamicamente.

### **Etapa 3: Conexão dos Validadores de Estado**

Garantir que as ações no editor de texto ou nos painéis laterais disparem o avanço automático ou liberem a trava do curso.

* **Monitorar o Editor Central:** Garantir que as mudanças de texto em TextEditor.tsx atualizem o estado de leitura do validador do curso.  
* **Mapeamento de Configurações:** Testar os gatilhos vinculando as ações dos componentes de alteração de velocidade e chaves de ativação ao ciclo de vida do CourseContext.

### **Etapa 4: Injeção de Contexto no Mentor IA (Gemini)**

A IA precisa mudar sua postura e virar um professor dedicado ao curso se a trilha estiver ativa.

* **Modificar src/services/gemini.ts:** Ajustar a função que envia mensagens para aceitar um parâmetro opcional systemInstructionOverride.  
* **Ajustar MentorChat.tsx:** Antes de disparar a mensagem digitada pelo usuário para a API do Gemini, injetar a instrução específica da lição atual (currentStep.mentorContext) junto com o status da validação (se a tarefa já foi cumprida ou se o usuário ainda está tentando).

### **Etapa 5: Polimento, Atalhos e Botão de Entrada**

* **Tratamento de Atalhos de Teclado:** Evitar que os atalhos do aplicativo (como dar Space para rolar) atrapalhem o usuário enquanto ele digita no chat ou lê a introdução.  
* **Ponto de Partida na UI:** Adicionar um botão discreto e convidativo no LeftSidebar.tsx ou em um banner inicial: *"Fazer o Curso Prático Interativo"*.

Como pretendemos começar a codificar esses módulos diretamente na estrutura do repositório, você prefere que criemos primeiro o arquivo base de lições com todos os passos detalhados ou quer começar estruturando o arquivo do novo contexto (CourseContext.tsx)?

## **📋 Resumo Conciso do que foi Falado**

* **Etapa 1 (Base):** Criação dos arquivos de constantes de lições e do CourseContext encapsulando as regras de avanço do curso.  
* **Etapa 2 (Visual):** Desenvolvimento do sistema de Spotlight/Glow usando seletores CSS nativos para destacar os menus e botões corretos na tela.  
* **Etapa 3 (Reatividade):** Integração dos validadores aos componentes reais do editor e dos seletores laterais para capturar as ações do usuário.  
* **Etapa 4 (Inteligência):** Ajuste do serviço do Gemini para receber instruções de sistema mutáveis baseadas na fase atual do aprendizado do aluno.  
* **Etapa 5 (Experiência):** Criação do ponto de entrada na interface para o usuário disparar o onboarding completo quando desejar.