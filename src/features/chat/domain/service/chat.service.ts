import { DataPagination, Pagination } from "src/shared/domain/pagination.core";
import { Chat, Content } from "../entities/content.entity";
import { ModelEnum } from "src/features/model/domain/entity/model.entity";

export abstract class ChatService {
    abstract findOneChatByUUID(uuid: string): Promise<Chat | null>
    abstract chatFlow(data: {
        chatUUID: string;
        prompt: string,
        userUUID?: string,
        username?: string
        model?: ModelEnum
    }
    ): Promise<{
        chat: Chat
        messages: Array<Content>
    }>
    abstract findAllMessages(data: {
        pagination: DataPagination,
        chatUUID: string
    }): Promise<Pagination<Content>>
    abstract findAllchats(data: {
        pagination: DataPagination,
        userUUID: string,
        name?: string
    }): Promise<Pagination<Chat>>
}