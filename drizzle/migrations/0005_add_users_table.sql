CREATE TABLE "users" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_slug_unique" UNIQUE("slug")
);
