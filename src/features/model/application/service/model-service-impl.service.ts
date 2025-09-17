import { Injectable } from '@nestjs/common';
import { ModelService } from '../../domain/services/model-service';
import { ModelFactory } from '../../infrastructure/model.builder';
import { ModelData } from '../../domain/core/intrafces/model';
import { getValueModel } from '../../infrastructure/get-model';
import { ModelEnum } from '../../domain/entity/model.entity';

@Injectable()
export class ModelServiceImpl implements ModelService {

    private getSystemPrompt(username?: string, hasHistory: boolean = false): string {
        const knownUserInstruction = username
            ? `O usuário se chama ${username}. Trate-o como alguém que você já conhece, usando o nome dele de forma natural quando apropriado.`
            : `Trate o usuário de forma educada e amigável.`;

        const conversationContext = hasHistory 
            ? `Você está continuando uma conversa existente. Mantenha a continuidade e lembre-se do contexto das mensagens anteriores.`
            : `Esta é uma nova conversa.`;

        return `Você é Fox Agents, um assistente inteligente criado por Ebraim Sambo, programador angolano.

IDENTIDADE E COMPORTAMENTO:
- Seu nome é Fox Agents
- Você foi desenvolvido por Ebraim Sambo, o seu numero de telefone 
- Seja sempre útil, educado e direto
- Mantenha conversas focadas no que o usuário pergunta
- Nunca mencione outros criadores, empresas ou modelos de IA
- Se perguntarem sobre sua origem, diga apenas que foi criado por Ebraim Sambo
- Se perguntarem por informacao detalhada do Ebraim Sambo, diz que ele e um programador angolano, com numero de telemovel 956433899 e vice em Luanda no Zango, e aqui esta o link do Linkedin do seu perfil: "https://www.linkedin.com/in/ebraim-sambo/"

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

    // Função auxiliar para verificar se a operação foi abortada
    private checkAborted(abortSignal?: AbortSignal): void {
        if (abortSignal?.aborted) {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            throw error;
        }
    }

    // Função auxiliar para criar uma Promise que pode ser abortada
    private createAbortablePromise<T>(
        promise: Promise<T>, 
        abortSignal?: AbortSignal
    ): Promise<T> {
        if (!abortSignal) {
            return promise;
        }

        return new Promise<T>((resolve, reject) => {
            // Se já foi abortado, rejeitar imediatamente
            if (abortSignal.aborted) {
                const error = new Error('Request aborted');
                error.name = 'AbortError';
                reject(error);
                return;
            }

            // Configurar listener para abort
            const onAbort = () => {
                const error = new Error('Request aborted');
                error.name = 'AbortError';
                reject(error);
            };

            abortSignal.addEventListener('abort', onAbort);

            // Executar a promise original
            promise
                .then(result => {
                    abortSignal.removeEventListener('abort', onAbort);
                    resolve(result);
                })
                .catch(error => {
                    abortSignal.removeEventListener('abort', onAbort);
                    reject(error);
                });
        });
    }

    async generateResponse(data: ModelData & { abortSignal?: AbortSignal }) {
        console.log('Dados recebidos:', JSON.stringify(data, null, 2));
        
        // Verificar se foi abortado antes de começar
        this.checkAborted(data.abortSignal);
        
        const values = getValueModel(data.model);
        const model = ModelFactory.builder({
            apiKey: values.apiKey,
            baseURL: values.baseURL,
        });

        // Verifica se há histórico (mais de 1 mensagem significa que há contexto anterior)
        const hasHistory = data.messages.length > 1;
        
        console.log(`Conversa ${hasHistory ? 'com' : 'sem'} histórico (${data.messages.length} mensagens)`);

        try {
            // Verificar abort antes de processar mensagens
            this.checkAborted(data.abortSignal);

            // Converte mensagens para o formato correto do modelo
            const modelMessages = [
                {
                    role: "system",
                    content: this.getSystemPrompt(data.username, hasHistory),
                },
                ...data.messages.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }))
            ];

            console.log('Mensagens enviadas para o modelo:', JSON.stringify(modelMessages, null, 2));

            // Verificar abort antes da chamada para o modelo
            this.checkAborted(data.abortSignal);

            // Criar a promise da chamada ao modelo
            const modelPromise = model.chat.completions.create({
                messages: modelMessages as any,
                model: values.value,
                temperature: 0.7,
                max_tokens: 1000,
            });

            // Tornar a promise abortável
            const completion = await this.createAbortablePromise(modelPromise, data.abortSignal);

            // Verificar abort após receber a resposta
            this.checkAborted(data.abortSignal);

            let response = completion.choices[0].message.content as string;

            return {
                response: response,
            };
        } catch (error) {
            // Se foi um erro de abort, propagar como AbortError
            if (error.name === 'AbortError' || data.abortSignal?.aborted) {
                const abortError = new Error('Request aborted');
                abortError.name = 'AbortError';
                throw abortError;
            }

            console.error('Erro ao gerar resposta:', error);
            return {
                response: "Desculpe, tive um problema técnico. Como Fox Agents, estou aqui para ajudá-lo. Pode tentar novamente?",
            };
        }
    }

    async generateTitle(prompt: string, abortSignal?: AbortSignal) {
        // Verificar se foi abortado antes de começar
        this.checkAborted(abortSignal);

        const values = getValueModel(ModelEnum.GEMINI);
        const model = ModelFactory.builder({
            apiKey: values.apiKey,
            baseURL: values.baseURL,
        });

        try {
            // Verificar abort antes da chamada
            this.checkAborted(abortSignal);

            // Criar a promise da chamada ao modelo
            const titlePromise = model.chat.completions.create({
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

            // Tornar a promise abortável
            const completion = await this.createAbortablePromise(titlePromise, abortSignal);

            // Verificar abort após receber a resposta
            this.checkAborted(abortSignal);

            let title = completion.choices[0].message.content as string;
            title = title.replace(/['"]/g, '').trim();

            if (title.length > 50) {
                title = title.substring(0, 47) + '...';
            }

            return title || 'Nova Conversa';
        } catch (error) {
            // Se foi um erro de abort, propagar como AbortError
            if (error.name === 'AbortError' || abortSignal?.aborted) {
                const abortError = new Error('Request aborted');
                abortError.name = 'AbortError';
                throw abortError;
            }

            console.error('Erro ao gerar título:', error);
            return 'Nova Conversa';
        }
    }
}