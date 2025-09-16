import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatService } from '../../domain/service/chat.service';
import { Chat, Content, Role } from '../../domain/entities/content.entity';
import { ChatRepository } from '../../domain/repository/chat.repository';
import { ModelService } from 'src/features/model/domain/services/model-service';
import { ModelEnum } from 'src/features/model/domain/entity/model.entity';
import { DataPagination, Pagination } from 'src/shared/domain/pagination.core';

@Injectable()
export class ChatServiceImpl implements ChatService {
    constructor(
        private repository: ChatRepository,
        private modelService: ModelService
    ) { }

    async findOneChatByUUID(uuid: string): Promise<Chat | null> {
        return await this.repository.findOneChatByUUID(uuid);
    }

    async chatFlow(data: { chatUUID: string; prompt: string; userUUID?: string, username?: string,  model?: ModelEnum }): Promise<{ chat: Chat; messages: Array<Content>; }> {
        let userId: number | undefined;
        let chat: Chat
        if (data.userUUID) {
            const user = await this.repository.getUser(data.userUUID)
                ?? await this.repository.createtUser(data.userUUID);
            userId = user.id;
        }

        const existingChat = await this.repository.findOneChatByUUID(data.chatUUID);

        if (!existingChat) {
            const titleChat =  await this.modelService.generateTitle(data.prompt)
            chat = await this.repository.createChat({
                title: titleChat,
                uuid: data.chatUUID,
                userId
            });
        } else {
            chat = existingChat;
        }

        const messages = await this.repository.findAllMessagesByChatIdAndUserId(chat.id)
        messages.reverse()
        const formattedChatHistory = messages.map(msg => ({
            role: msg.role === Role.USER ? 'user' : 'system' as "user",
            content: msg.content
        }));

        formattedChatHistory.push({ content: data.prompt, role: "user" });
        const response = await this.modelService.generateResponse({
            messages: [...formattedChatHistory],
            model: ModelEnum.GEMINI,
            username: data.username
        })

        const aiMessageData: Omit<Content, "uuid">[] = [
            {
                chatId: chat.id,
                content: data.prompt,
                model: data.model || ModelEnum.GEMINI,
                role: Role.USER,
            },
            {
                chatId: chat.id,
                content: response.response,
                model: data.model || ModelEnum.GEMINI,
                role: Role.MODEL,
            }
        ];

        const createMessages = await this.repository.flowChat({
            chat,
            messages: [...aiMessageData]
        })
        return createMessages;
    }

    async findAllMessages(data: { pagination: DataPagination; chatUUID: string; }): Promise<Pagination<Content>> {
        const chat = await this.findOneChatByUUID(data.chatUUID)
        if (chat) return await this.repository.findAllMessages({
            ...data,
            chatId: chat.id
        })

        return {
            isHasPage: false,
            items: [],
            nextPage: null,
            page: 1,
            prevPage: null,
            totalElements: 0,
            totalPages: 1
        }
    }

    async findAllchats(data: { pagination: DataPagination; userUUID: string; name?: string; }): Promise<Pagination<Chat>> {
        const user = await this.repository.getUser(data.userUUID)
        if(!user) return {
            isHasPage: false,
            items: [],
            nextPage: null,
            page: 1,
            prevPage: null,
            totalElements: 0,
            totalPages: 1
        };

        return await this.repository.findAllchats({
            ...data,
            userId: user.id,
        })
    }
}