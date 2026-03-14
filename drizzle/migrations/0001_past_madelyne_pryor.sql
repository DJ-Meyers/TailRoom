ALTER TABLE "teams" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "teams" SET "slug" = lower(regexp_replace(regexp_replace(trim("name"), '[^\w\s-]', '', 'g'), '[\s_]+', '-', 'g'));--> statement-breakpoint
UPDATE "teams" SET "slug" = 'team' WHERE "slug" IS NULL OR "slug" = '';--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_slug_unique" UNIQUE("userId","slug");
