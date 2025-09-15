ALTER TABLE "chats" DROP CONSTRAINT "chats_uuid_unique";--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "uuid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "uuid" DROP NOT NULL;