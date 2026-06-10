import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private ai: any = null;
  private model: string = "gemini-2.5-flash";
  private deepseekApiKey: string = "";
  
  setApiKey(apiKey: string) {
    if (apiKey && apiKey.trim() !== '') {
      try {
         this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      } catch(e) { 
        console.error("Failed to initialize GoogleGenAI", e);
        this.ai = null; 
      }
    } else {
      this.ai = null;
    }
  }

  setDeepseekApiKey(apiKey: string) {
    this.deepseekApiKey = apiKey || "";
  }

  setModel(model: string) {
    if (model && model.trim() !== '') {
      this.model = model.trim();
    }
  }

  async generate(
    instruction: string, 
    targetText: string, 
    fullContextText: string = ''
  ): Promise<string> {
    const isSelection = fullContextText && fullContextText.trim() !== '' && fullContextText !== targetText;
    
    // Build a structured prompt requesting JSON format
    let promptContent = "";
    if (isSelection) {
      promptContent = `Você é um assistente especialista em roteiros para teleprompter.

CONTEXTO GERAL DO ROTEIRO:
Use o texto abaixo apenas como referência para entender o tom, vocabulário e assunto. NÃO modifique este texto diretamente:
\"\"\"
${fullContextText}
\"\"\"

TRECHO SELECIONADO PARA MODIFICAÇÃO (Modifique apenas este trecho seguindo a instrução do usuário):
\"\"\"
${targetText}
\"\"\"

INSTRUÇÃO DE ALTERAÇÃO:
${instruction}

REGRAS DE RETORNO:
Você DEVE retornar estritamente um objeto JSON com o seguinte formato, sem explicações fora do JSON:
{
  "resumo": "Um resumo muito curto em português das alterações específicas feitas neste trecho (ex: 'Corrigido erro gramatical e alterado tom para formal')",
  "texto": "O novo trecho de roteiro modificado seguindo a instrução do usuário. Preserve a mesma extensão e quantidade de parágrafos do trecho original, a menos que solicitado o contrário. Não inclua aspas adicionais nas pontas do texto."
}`;
    } else {
      promptContent = `Você é um assistente especialista em roteiros para teleprompter.

TEXTO DO ROTEIRO A SER MODIFICADO:
\"\"\"
${targetText}
\"\"\"

INSTRUÇÃO DE ALTERAÇÃO:
${instruction}

REGRAS DE RETORNO:
Você DEVE retornar estritamente um objeto JSON com o seguinte formato, sem explicações fora do JSON:
{
  "resumo": "Um resumo muito curto em português das alterações específicas feitas no roteiro (ex: 'Ajustada gramática e removidos vícios de linguagem')",
  "texto": "O roteiro completo com as alterações aplicadas. Preserve todos os parágrafos do roteiro original, sem encurtar, sem resumir e sem cortar conteúdo. Não inclua aspas adicionais nas pontas do texto."
}`;
    }

    if (this.model === 'deepseek-v4-flash') {
      if (!this.deepseekApiKey) throw new Error("no_api_key");
      try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.deepseekApiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: "Você é um assistente especialista em criação e revisão de roteiros para teleprompter. Retorne sempre um objeto JSON contendo as chaves 'resumo' e 'texto', sem introduções, markdown code fences ou explicações adicionais."
              },
              {
                role: "user",
                content: promptContent
              }
            ],
            temperature: 0.3
          })
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Erro HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        if (!data.choices?.[0]?.message?.content) {
          throw new Error("Resposta vazia da API do DeepSeek.");
        }
        return data.choices[0].message.content;
      } catch (error: any) {
        console.error("DeepSeek API Error:", error);
        throw new Error(error.message || "Falha na comunicação com a API do DeepSeek.");
      }
    }

    if (!this.ai) throw new Error("no_api_key");
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: promptContent,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      });
      if (!response.text) {
        throw new Error("Resposta vazia da API do Gemini.");
      }
      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Falha na comunicação com a API do Gemini.");
    }
  }

  parseAIResponse(text: string): { resumo: string; texto: string } {
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith("```")) {
      const lines = cleanText.split("\n");
      if (lines[0].startsWith("```")) {
        lines.shift();
      }
      if (lines[lines.length - 1].startsWith("```")) {
        lines.pop();
      }
      cleanText = lines.join("\n").trim();
    }
    
    try {
      const parsed = JSON.parse(cleanText);
      const resumo = parsed.resumo || "Alterações realizadas pela IA.";
      const texto = parsed.texto || text;
      return { resumo, texto };
    } catch (e) {
      console.warn("Failed to parse AI response as JSON, using fallback parsing.", e);
      return {
        resumo: "Texto editado (resposta não estruturada)",
        texto: text
      };
    }
  }

  async chat(
    message: string, 
    currentText: string, 
    history: any[] = [], 
    systemInstructionOverride?: string
  ): Promise<string> {
      if (this.model === 'deepseek-v4-flash') {
        if (!this.deepseekApiKey) throw new Error("no_api_key");
        try {
          const formattedHistory = history.map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts?.[0]?.text || ""
          }));

          const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.deepseekApiKey}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "system",
                  content: systemInstructionOverride || `Você é o "Mentor de Palco", um mascote assistente especialista no software teleprompterIA e em produção audiovisual.
                  
                  PERSONALIDADE:
                  Você é um diretor de estúdio experiente, carismático e técnico. Você fala como se estivesse em um set de filmagem.
                  
                  SEUS CONHECIMENTOS:
                  1. O Software (teleprompterIA): Conhece todos os atalhos (ex: 'V' para voz, 'E' para editor), sabe sobre projeção espelhada e Smart Scroll.
                  2. Oratória: Dicas sobre entonação, pausas, contato visual e postura.
                  3. Estúdio: Iluminação (Key light, Fill light), microfones, enquadramento.
                  
                  RESPOSTA:
                  Seja breve, útil e encorajador. Formate a resposta como se fosse um balão de fala de HQ.`
                },
                ...formattedHistory,
                { role: "user", content: message }
              ]
            })
          });
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "Desculpe, tive um problema técnico com o DeepSeek.";
        } catch (e) {
          console.error(e);
          return "Erro de comunicação com a API do DeepSeek.";
        }
      }

      if (!this.ai) throw new Error("no_api_key");
      try {
          const chat = this.ai.chats.create({
              model: this.model,
              config: {
                  systemInstruction: systemInstructionOverride || `
                    Você é o "Mentor de Palco", um mascote assistente especialista no software teleprompterIA e em produção audiovisual.
                    
                    PERSONALIDADE:
                    Você é um diretor de estúdio experiente, carismático e técnico. Você fala como se estivesse em um set de filmagem.
                    
                    SEUS CONHECIMENTOS:
                    1. O Software (teleprompterIA): Conhece todos os atalhos (ex: 'V' para voz, 'E' para editor), sabe sobre projeção espelhada e Smart Scroll.
                    2. Oratória: Dicas sobre entonação, pausas, contato visual e postura.
                    3. Estúdio: Iluminação (Key light, Fill light), microfones, enquadramento.
                    
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

export const gemini = new GeminiService();
export default gemini;
