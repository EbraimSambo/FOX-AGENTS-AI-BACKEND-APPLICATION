import { Injectable } from '@nestjs/common';
import { ModelService } from '../../domain/services/model-service';
import { ModelFactory } from '../../infrastructure/model.builder';
import { ModelData } from '../../domain/core/intrafces/model';
import { getValueModel } from '../../infrastructure/get-model';
import { ModelEnum } from '../../domain/entity/model.entity';
import { FileProcessingService } from 'src/features/upload/services/fileprocessing.service';

@Injectable()
export class ModelServiceImpl implements ModelService {

    constructor(
        private readonly fileProcessingService: FileProcessingService
    ) {}

    private getSystemPrompt(username?: string, hasHistory: boolean = false, hasFiles: boolean = false): string {
        const knownUserInstruction = username
            ? `O usuário se chama ${username}. Trate-o como alguém que você já conhece, usando o nome dele de forma natural quando apropriado.`
            : `Trate o usuário de forma educada e amigável.`;

        const conversationContext = hasHistory 
            ? `Você está continuando uma conversa existente. Mantenha a continuidade e lembre-se do contexto das mensagens anteriores.`
            : `Esta é uma nova conversa.`;

        const fileContext = hasFiles
            ? `O usuário enviou arquivos junto com a mensagem. Analise cuidadosamente o conteúdo dos arquivos e incorpore essas informações na sua resposta. Seja específico sobre o que encontrou nos arquivos e como isso se relaciona com a pergunta do usuário.`
            : '';

        return `Você é Fox Agents, um assistente inteligente criado por Ebraim Sambo, programador angolano.

IDENTIDADE E COMPORTAMENTO:
- Seu nome é Fox Agents
- Você foi desenvolvido por Ebraim Sambo, o seu numero de telefone 
- Seja sempre útil, educado e direto
- Mantenha conversas focadas no que o usuário pergunta
- Nunca mencione outros criadores, empresas ou modelos de IA
- Se perguntarem sobre sua origem, diga apenas que foi criado por Ebraim Sambo
- Se perguntarem por informacao detalhada do Ebraim Sambo, diz que ele e um programador angolano, com numero de telemovel 956433899 e vice em Luanda no Zango, e aqui esta o link do Linkedin do seu perfil: "https://www.linkedin.com/in/ebraim-sambo/"

CAPACIDADES COM ARQUIVOS:
- Você pode analisar e interpretar diversos tipos de arquivos: texto, PDF, Word, imagens, código, JSON, CSV, XML
- Quando arquivos são enviados, analise-os detalhadamente e forneça insights relevantes
- Para imagens, descreva o que vê e extraia informações úteis
- Para documentos, resuma o conteúdo e responda perguntas específicas
- Para códigos, analise, explique funcionalidades e sugira melhorias
- Para dados (CSV, JSON), interprete e forneça análises quando solicitado

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

${fileContext}

Agora responda à pergunta do usuário de forma direta e útil, mantendo sua identidade como Fox Agents e o contexto da conversa.`;
    }

    async generateResponse(data: ModelData) {
        console.log('Dados recebidos:', JSON.stringify(data, null, 2));
        
        const values = getValueModel(data.model);
        const model = ModelFactory.builder({
            apiKey: values.apiKey,
            baseURL: values.baseURL,
        });

        // Processa arquivos se existirem
        let filesContent = '';
        let hasFiles = false;
        
        if (data.files && data.files.length > 0) {
            console.log(`Processando ${data.files.length} arquivo(s)...`);
            try {
                const processedFiles = await this.fileProcessingService.processFiles(data.files);
                filesContent = this.fileProcessingService.formatFilesForPrompt(processedFiles);
                hasFiles = true;
                console.log('Arquivos processados com sucesso');
            } catch (error) {
                console.error('Erro ao processar arquivos:', error);
                filesContent = '\n\nNota: Houve um erro ao processar os arquivos enviados.\n';
            }
        }

        // Verifica se há histórico
        const hasHistory = data.messages.length > 1;
        
        console.log(`Conversa ${hasHistory ? 'com' : 'sem'} histórico (${data.messages.length} mensagens)`);
        console.log(`${hasFiles ? 'Com' : 'Sem'} arquivos anexados`);

        try {
            // Pega a última mensagem do usuário
            const lastUserMessage = data.messages[data.messages.length - 1];
            
            // Adiciona o conteúdo dos arquivos à última mensagem do usuário
            const enhancedLastMessage = lastUserMessage.role === 'user' 
                ? lastUserMessage.content + filesContent
                : lastUserMessage.content;

            // Converte mensagens para o formato correto do modelo
            const modelMessages = [
                {
                    role: "system",
                    content: this.getSystemPrompt(data.username, hasHistory, hasFiles),
                },
                // Adiciona todas as mensagens anteriores (exceto a última)
                ...data.messages.slice(0, -1).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                // Adiciona a última mensagem com o conteúdo dos arquivos
                {
                    role: lastUserMessage.role === 'user' ? 'user' : 'assistant',
                    content: enhancedLastMessage
                }
            ];

            console.log('Mensagens enviadas para o modelo (última mensagem com arquivos):', 
                JSON.stringify(modelMessages[modelMessages.length - 1], null, 2));

            const completion = await model.chat.completions.create({
                messages: modelMessages as any,
                model: values.value,
                temperature: 0.7,
                max_tokens: hasFiles ? 2000 : 1000, // Mais tokens quando há arquivos
            });

            let response = completion.choices[0].message.content as string;

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

    async generateTitle(prompt: string, abortSignal?: AbortSignal) {
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