import { DataPagination, Pagination } from "src/shared/domain/pagination.core";
import { Chat, Content } from "../entities/content.entity";

export abstract class ChatRepository {
    abstract findOneChatByUUID(uuid: string): Promise<Chat | null>
    abstract flowChat(data:{
        chat: Chat, messages: Array<Omit<Content, "uuid">>
    }
    ): Promise<{
        chat: Chat
        messages: Array<Content>
    }>
    abstract createChat(data:{
        userId?: number;
        title: string;
        uuid: string
    }): Promise<Chat>
    abstract findAllMessagesByChatIdAndUserId(chatId: number): Promise<Array<Content>>
    abstract findAllMessages(data: {
        pagination: DataPagination,
        chatId: number
    }): Promise<Pagination<Content>>
}