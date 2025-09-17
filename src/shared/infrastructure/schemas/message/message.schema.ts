import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userTable } from "../user/user.schema";
import { chatsTable } from "../chat/chat.schema";

export const messageRoleEnum = pgEnum('message_role', ['MODEL', 'USER', 'SYSTEM']);
export const typeModelEnum = pgEnum('model_enum', ['GPT', 'CLAUDE', 'GEMINI','OLLAMA']);

export const messagesTable = pgTable('messages', {
    id: serial('id').primaryKey(),
    uuid: uuid("uuid").defaultRandom().unique(),
    userId: integer('user_id').references(() => userTable.id),
    content: text('content'),
    role: messageRoleEnum('role').default("USER").notNull(), 
    model: typeModelEnum("model").default("GEMINI"),
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow(),
    attachments: jsonb("attachments").$type<Array<{
        url: string,
        type: string
    }>>().default([]),
    chatId: integer('chat_id').notNull().references(() => chatsTable.id),
});