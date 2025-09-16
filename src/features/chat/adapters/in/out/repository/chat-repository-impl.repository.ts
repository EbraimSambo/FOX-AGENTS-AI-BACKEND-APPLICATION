import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { Chat, Content } from 'src/features/chat/domain/entities/content.entity';
import { ChatRepository } from 'src/features/chat/domain/repository/chat.repository';
import { User } from 'src/features/user/domain/entity/user.entity';
import { DatabaseService } from 'src/shared/domain/core/db';
import { DataPagination, Pagination } from 'src/shared/domain/pagination.core';
import { chatsTable, messagesTable, userTable } from 'src/shared/infrastructure/schemas/index.schema';

@Injectable()
export class ChatRepositoryImpl implements ChatRepository {
    constructor(
        private databaseService: DatabaseService
    ) { }

    async findOneChatByUUID(uuid: string): Promise<Chat | null> {
        const chat = await this.databaseService.db.query.chatsTable.findFirst({
            where: (fields, { and, eq }) => {
                return and(
                    eq(fields.uuid, uuid)
                )
            },
        })
        return chat as Chat
    }

    async flowChat(data: { chat: Chat; messages: Array<Content>; }): Promise<{ chat: Chat; messages: Array<Content>; }> {
        return await this.databaseService.db.transaction(async (tx) => {
            const messages = await tx.insert(messagesTable)
                .values(data.messages).returning();
            return {
                chat: data.chat,
                messages: messages as Array<Content>
            }
        })

    }

    async createChat(data: { userId?: number; title: string, uuid: string; }): Promise<Chat> {
        const [chat] = await this.databaseService.db.insert(chatsTable)
            .values({
                ...data,
            }).returning();
        return chat as unknown as Chat
    }

    async findAllMessagesByChatIdAndUserId(chatId: number) {
        return await this.databaseService.db.query.messagesTable.findMany({
            where: (messages, { eq, and }) => and(
                eq(messages.chatId, chatId),
            ),
            orderBy: (messages, { desc }) => desc(messages.createdAt),
            limit: 30,
        }) as Array<Content>;
    }

    async findAllMessages(data: { pagination: DataPagination; chatId: number; }): Promise<Pagination<Content>> {
        const { chatId } = data
        const { limit, page } = data.pagination
        const offset = (page - 1) * limit;
        return await this.databaseService.db.transaction(async (tx) => {
            const [rows, total] = await Promise.all([
                tx.query.messagesTable.findMany({
                    where: (elements, { and, eq }) => and(
                        eq(elements.chatId, chatId),
                    ),
                    limit,
                    offset
                }),
                tx.select({ count: sql<number>`count(*)` }).from(messagesTable).where(and(
                    eq(messagesTable.chatId, chatId)
                )).then(res => Number(res[0].count))
            ])

            const totalPages = Math.ceil(total / limit);
            return {
                items: rows as Array<Content>,
                totalPages,
                totalElements: total,
                page,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
                isHasPage: page < totalPages,
            }
        })
    }

    async findAllchats(data: { pagination: DataPagination; userId: number; name?: string; }): Promise<Pagination<Chat>> {
        const { userId } = data
        const { limit, page } = data.pagination
        const offset = (page - 1) * limit;
        return await this.databaseService.db.transaction(async (tx) => {
            const [rows, total] = await Promise.all([
                tx.query.chatsTable.findMany({
                    where: (elements, { and, eq,sql, }) => and(
                        eq(elements.userId, userId),
                        data.name ? sql`LOWER(${elements.title}) LIKE LOWER(${`%${data.name}%`})` : undefined
                    ),
                    limit,
                    offset
                }),
                tx.select({ count: sql<number>`count(*)` }).from(chatsTable).where(and(
                    eq(chatsTable.userId, userId)
                )).then(res => Number(res[0].count))
            ])

            const totalPages = Math.ceil(total / limit);
            return {
                items: rows as Array<Chat>,
                totalPages,
                totalElements: total,
                page,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
                isHasPage: page < totalPages,
            }
        })
    }

    async getUser(uuid: string): Promise<User | null> {
        return await this.databaseService.db.query.userTable.findFirst({
            where: (fields, { and, eq }) => {
                return and(
                    eq(fields.uuid, uuid)
                )
            },
        }) as User
    }

   async  createtUser(uuid: string): Promise<User> {
        const [user] = await this.databaseService.db.insert(userTable)
        .values({
            uuid
        }).returning()
        return user;
    }

}
