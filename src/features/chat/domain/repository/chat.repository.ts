import { DataPagination, Pagination } from "src/shared/domain/pagination.core";
import { Chat, Content } from "../entities/content.entity";
import { User } from "src/features/user/domain/entity/user.entity";

export abstract class ChatRepository {
    abstract findOneChatByUUID(uuid: string): Promise<Chat | null>
    abstract flowChat(data:{
        chat: Chat, messages: Array<Omit<Content, "uuid">>,
    }
    ): Promise<{
        chat: Chat
        messages: Array<Content>
    }>
    abstract createChat(data:{
        userId?: number | null;
        title: string;
        uuid: string;
    }): Promise<Chat>
    abstract findAllMessagesByChatIdAndUserId(chatId: number): Promise<Array<Content>>
    abstract findAllMessages(data: {
        pagination: DataPagination,
        chatId: number
    }): Promise<Pagination<Content>>
    abstract findAllchats(data: {
        pagination: DataPagination,
        userId: number,
        name?: string
    }): Promise<Pagination<Chat>>
    abstract getUser(uuid: string): Promise<User|null>
    abstract createtUser(uuid: string): Promise<User>
}