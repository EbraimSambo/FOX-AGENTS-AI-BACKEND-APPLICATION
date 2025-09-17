ALTER TYPE "public"."model_enum" ADD VALUE 'OLLAMA';--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb;