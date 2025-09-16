import { relations } from "drizzle-orm";
import { date, pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const userTable = pgTable("users", {
    id: serial("id").primaryKey().notNull(),
    uuid: uuid("ref").notNull().unique(),
    name: varchar("name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const userSchemaRelations = relations(userTable, ({many})=>({
    
}))