# 🤖 Recursos de IA - teleprompterIA

Este documento detalha o funcionamento, as integrações de API e os algoritmos que capacitam os recursos de Inteligência Artificial do **teleprompterIA**.

---

## 1. Modelos de IA Suportados

O usuário pode alternar facilmente de modelo na janela de configurações gerais. A infraestrutura de backend de IA é unificada em `src/services/gemini.ts` e suporta:

* **Google Gemini (`gemini-2.5-flash` / `gemini-flash-latest`)**:
  * Utiliza o SDK oficial `@google/genai`.
  * Configurado com `responseMimeType: "application/json"` para garantir retornos estruturados.
  * Temperatura de `0.3` para garantir reescritas estilísticas sem alucinações de conteúdo.
* **DeepSeek (`deepseek-v4-flash`)**:
  * Implementação direta de requisição `fetch` HTTPS para o endpoint compatível com OpenAI da DeepSeek (`api.deepseek.com/chat/completions`).
  * Utiliza o parâmetro `response_format: { type: "json_object" }` para impor a mesma estrutura de JSON que o Gemini.
  * Valida automaticamente chaves no fluxo de interface do usuário, permitindo o funcionamento pleno apenas com a chave do DeepSeek configurada.

---

## 2. Estrutura do Contrato de Retorno (JSON Mode)

Para fornecer uma interface rica que não sobrescreve o texto do usuário de forma cega, a IA é instruída a sempre responder no formato JSON:

```json
{
  "resumo": "Explicação muito breve e direta das alterações feitas no texto.",
  "texto": "O roteiro completo ou trecho revisado com as alterações aplicadas."
}
```

### Sanitização e Fallback (`parseAIResponse`)
Alguns provedores ou proxies de rede podem envolver a resposta JSON em blocos de código Markdown do tipo \`\`\`json. O método de tratamento limpa essas strings:
1. Corta espaços em branco e quebras extras nas pontas.
2. Identifica se a string começa com \`\`\` e remove a linha inicial (ex: \`\`\`json) e a linha final (\`\`\`).
3. Efetua o parse JSON.
4. **Fallback**: Se por algum motivo a IA falhar e retornar texto simples sem estrutura JSON (por exemplo, devido a instabilidade na API), o método captura o erro graciosamente e mapeia todo o retorno como a chave `"texto"`, aplicando o resumo genérico `"Texto editado (resposta não estruturada)"` para manter o fluxo operando sem quebras de tela.

---

## 3. Fluxo de Diff Visual e Toggles de Parágrafo (original vs IA)

Quando o Copiloto IA retorna a sugestão de roteiro, ela é carregada no painel direito **"✨ Sugestão da IA"** em vez de ser injetada de imediato no editor.

```mermaid
sequenceDiagram
    participant U as Usuário
    participant E as Editor de Texto
    participant IA as Copiloto IA (Gemini/DeepSeek)
    participant P as Painel de Diff/Revisão

    U->>E: Seleciona texto ou aciona ação rápida
    E->>IA: Envia prompt (com contexto de fundo)
    IA->>P: Retorna JSON { resumo, texto }
    P->>U: Exibe resumo e parágrafos modificados com toggle
    U->>P: Clica em "Rejeitar" em parágrafos específicos
    U->>P: Clica em "Substituir Texto"
    P->>E: Injeta texto combinando aceitos e originais
```

### O Algoritmo de Alinhamento
* O texto original é dividido em um array de parágrafos: `originalParas = originalText.split('\n')`.
* O texto sugerido pela IA é dividido em um array de parágrafos: `suggestedParas = suggestedText.split('\n')`.
* **Cenário Alinhado (Mesmo número de parágrafos)**:
  * O sistema exibe cada parágrafo lado a lado.
  * Se o parágrafo não foi modificado, ele é ocultado ou exibido com menor contraste.
  * Se foi alterado, o usuário ganha um botão **Aceitar / Rejeitar**.
  * Ao confirmar, o editor reconstrói o documento final mesclando o parágrafo sugerido (se aceito) ou mantendo o parágrafo original (se rejeitado).
* **Cenário Desalinhado (Quebra de parágrafos alterada)**:
  * Caso a IA crie ou junte quebras de linha (mudando o tamanho dos arrays), o alinhamento 1:1 é desfeito.
  * O sistema exibe um aviso claro ao usuário informando que a estrutura foi alterada, mostrando o bloco completo excluído em vermelho e o bloco sugerido em verde, e permitindo apenas a substituição completa.

---

## 4. Refinamento Context-Aware por Seleção

Ao selecionar um trecho específico no editor e abrir a IA:
1. O sistema armazena a seleção ativa e o local exato do cursor (`Range` temporário).
2. O prompt enviado à IA contém a instrução personalizada do usuário + o trecho selecionado + o **documento inteiro como contexto geral**.
3. O modelo usa o documento geral apenas para entender o estilo de escrita, vocabulário e coesão, e modifica exclusivamente o trecho selecionado.
4. Ao aceitar, o editor de texto reinjeta a revisão precisamente no ponto da seleção original sem afetar o resto do roteiro.
