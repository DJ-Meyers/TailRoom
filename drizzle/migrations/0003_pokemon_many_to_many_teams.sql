-- Add userId to pokemon (populated from teams join)
ALTER TABLE "pokemon" ADD COLUMN "userId" text;
--> statement-breakpoint

-- Backfill userId from teams table
UPDATE "pokemon" SET "userId" = "teams"."userId"
FROM "teams" WHERE "pokemon"."teamId" = "teams"."id";
--> statement-breakpoint

-- Make userId NOT NULL after backfill
ALTER TABLE "pokemon" ALTER COLUMN "userId" SET NOT NULL;
--> statement-breakpoint

-- Create index on pokemon.userId
CREATE INDEX "pokemon_user_id_idx" ON "pokemon" ("userId");
--> statement-breakpoint

-- Create team_pokemon join table
CREATE TABLE "team_pokemon" (
  "teamId" uuid NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "pokemonId" uuid NOT NULL REFERENCES "pokemon"("id") ON DELETE CASCADE,
  "slot" integer NOT NULL,
  CONSTRAINT "team_pokemon_teamId_pokemonId_pk" PRIMARY KEY ("teamId", "pokemonId"),
  CONSTRAINT "team_pokemon_team_slot_unique" UNIQUE ("teamId", "slot")
);
--> statement-breakpoint

-- Migrate existing team-pokemon relationships to join table
INSERT INTO "team_pokemon" ("teamId", "pokemonId", "slot")
SELECT "teamId", "id", "slot" FROM "pokemon";
--> statement-breakpoint

-- Drop old constraints and column
ALTER TABLE "pokemon" DROP CONSTRAINT "pokemon_teamId_slot_unique";
--> statement-breakpoint
ALTER TABLE "pokemon" DROP CONSTRAINT "pokemon_teamId_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "pokemon" DROP COLUMN "teamId";
--> statement-breakpoint
ALTER TABLE "pokemon" DROP COLUMN "slot";
