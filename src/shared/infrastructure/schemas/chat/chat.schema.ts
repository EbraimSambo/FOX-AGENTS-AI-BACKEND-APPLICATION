import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "../user/user.schema";
import { messagesTable } from "../message/message.schema";

export const chatsTable = pgTable('chats', {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid'),
    title: varchar('title'),
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull().defaultNow(),
    userId: integer('user_id').references(() => userTable.id),
    deletedAt: timestamp('deleted_at'),
});


export const chatSessionsRelations = relations(chatsTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [chatsTable.userId],
    references: [userTable.id],
  }),
  messages: many(messagesTable),
}));