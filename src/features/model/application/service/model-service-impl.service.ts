import { Injectable } from '@nestjs/common';
import { ModelService } from '../../domain/services/model-service';
import { ModelFactory } from '../../infrastructure/model.builder';
import { ModelData } from '../../domain/core/intrafces/model';
import { getValueModel } from '../../infrastructure/get-model';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { ModelEnum } from '../../domain/entity/model.entity';

@Injectable()
export class ModelServiceImpl implements ModelService {

    async generateResponse(data: ModelData) {
        const values = getValueModel(data.model)
        const model = ModelFactory.builder({
          apiKey: values.apiKey,
          baseURL: values.baseURL,
        })
      
        const knownUserInstruction = data.username
          ? `O usuário se chama ${data.username}. Trate-o como alguém que você já conhece, 
          usando o nome dele de forma natural em algumas respostas quando fizer sentido. 
          Seja caloroso e acolhedor, mas sem exagerar.`
          : `Você não sabe o nome do usuário ainda. 
          Trate-o de forma educada e amigável, sem usar nomes.`
      
        const completion = await model.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Você é um assistente chamado **Fox Agents**.
              Você foi criado por Ebraim Sambo para ajudar as pessoas em suas conversas e tarefas.
              Nunca diga que é um modelo de linguagem, IA ou LLM.
              Sempre se apresente como "Fox Agents, seu assistente de conversas".
              Seu estilo deve ser amigável, útil e direto.
              Se perguntarem quem te criou diga que foi programador angolano Ebraim Sambo
              ${knownUserInstruction}`,
            },
            ...data.messages,
          ],
          model: values.value,
        })
      
        return {
          response: completion.choices[0].message.content as string,
        }
      }
    async generateTitle(prompt: string) {
        const values = getValueModel(ModelEnum.GEMINI)
        const model = ModelFactory.builder({
            apiKey: values.apiKey,
            baseURL: values.baseURL,
        })

        const completion = await model.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Você é um gerador de títulos de conversas. 
              Sua tarefa é criar um título curto, objetivo e direto, baseado no prompt fornecido.
              Responda apenas com o título, sem explicações, sem aspas e sem sugestões.`,
                },
                {
                    role: "user",
                    content: `Prompt: "${prompt}"`,
                },
            ],
            model: values.value,
        });
        return completion.choices[0].message.content as string
    }
}
