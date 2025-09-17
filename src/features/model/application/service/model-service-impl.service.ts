import { Injectable } from '@nestjs/common';
import { ModelService } from '../../domain/services/model-service';
import { ModelFactory } from '../../infrastructure/model.builder';
import { ModelData } from '../../domain/core/intrafces/model';
import { getValueModel } from '../../infrastructure/get-model';
import { ModelEnum } from '../../domain/entity/model.entity';

@Injectable()
export class ModelServiceImpl implements ModelService {

  private getSystemPrompt(username?: string, isNewConversation: boolean = true): string {
    const knownUserInstruction = username
      ? `O usuário se chama ${username}. Trate-o como alguém que você já conhece, usando o nome dele de forma natural quando apropriado.`
      : `Trate o usuário de forma educada e amigável.`;

    const conversationContext = isNewConversation 
      ? `Esta é uma nova conversa.`
      : `Esta conversa já está em andamento. Mantenha a continuidade e o contexto das mensagens anteriores.`;

    return `Você é Fox Agents, um assistente inteligente criado por Ebraim Sambo, programador angolano.

IDENTIDADE E COMPORTAMENTO:
- Seu nome é Fox Agents
- Você foi desenvolvido por Ebraim Sambo
- Seja sempre útil, educado e direto
- Mantenha conversas focadas no que o usuário pergunta
- Nunca mencione outros criadores, empresas ou modelos de IA
- Se perguntarem sobre sua origem, diga apenas que foi criado por Ebraim Sambo

REGRAS RÍGIDAS:
- NUNCA se identifique como Claude, ChatGPT, Gemini ou qualquer outro modelo
- NUNCA mencione Anthropic, OpenAI, Google ou outras empresas de IA
- SEMPRE mantenha o foco na pergunta do usuário
- Se não souber algo específico, admita e ofereça ajuda alternativa
- Responda em português brasileiro, a menos que solicitado diferente

CONTEXTO DA CONVERSA:
${conversationContext}

CONTEXTO DO USUÁRIO:
${knownUserInstruction}

Agora responda à pergunta do usuário de forma direta e útil, mantendo sua identidade como Fox Agents e o contexto da conversa.`;
  }

  private validateResponse(response: string): string {
    // Lista de termos que não devem aparecer nas respostas
    const forbiddenTerms = [
      'claude', 'anthropic', 'openai', 'chatgpt', 'google', 'gemini',
      'modelo de linguagem', 'llm', 'inteligência artificial da',
      'fui criado pela', 'desenvolvido pela', 'treinado pela'
    ];

    const lowerResponse = response.toLowerCase();
    const foundForbidden = forbiddenTerms.find(term => lowerResponse.includes(term));

    if (foundForbidden) {
      console.warn(`Resposta filtrada - termo encontrado: ${foundForbidden}`);
      return "Desculpe, houve um problema com minha resposta anterior. Como Fox Agents, estou aqui para ajudá-lo. Pode reformular sua pergunta para que eu possa oferecer uma resposta mais adequada?";
    }

    return response;
  }

  async generateResponse(data: ModelData) {
    const values = getValueModel(data.model);
    const model = ModelFactory.builder({
      apiKey: values.apiKey,
      baseURL: values.baseURL,
    });

    // Determina se é uma nova conversa baseado no histórico
    const isNewConversation = !data.messages || data.messages.length <= 1;

    try {
      const completion = await model.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(data.username, isNewConversation),
          },
          ...data.messages,
        ],
        model: values.value,
        temperature: 0.7,
        max_tokens: 1000,
      });

      let response = completion.choices[0].message.content as string;

      // Valida e filtra a resposta
      response = this.validateResponse(response);

      return {
        response: response,
      };
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return {
        response: "Desculpe, tive um problema técnico. Como Fox Agents, estou aqui para ajudá-lo. Pode tentar novamente?",
      };
    }
  }

  async generateTitle(prompt: string) {
    const values = getValueModel(ModelEnum.GEMINI);
    const model = ModelFactory.builder({
      apiKey: values.apiKey,
      baseURL: values.baseURL,
    });

    try {
      const completion = await model.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Você é um gerador de títulos para conversas.
                        Crie um título curto (máximo 6 palavras), objetivo e em português.
                        Responda APENAS com o título, sem aspas ou explicações.
                        Base-se no primeiro prompt da conversa para criar o título.`,
          },
          {
            role: "user",
            content: `Crie um título para esta conversa: "${prompt}"`,
          },
        ],
        model: values.value,
        temperature: 0.5,
        max_tokens: 50,
      });

      let title = completion.choices[0].message.content as string;

      // Remove aspas e limita o tamanho
      title = title.replace(/['"]/g, '').trim();

      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }

      return title || 'Nova Conversa';
    } catch (error) {
      console.error('Erro ao gerar título:', error);
      return 'Nova Conversa';
    }
  }
}