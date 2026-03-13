CREATE TABLE "calc_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pokemonId" uuid NOT NULL,
	"mode" text DEFAULT 'offensive' NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"move" text DEFAULT '' NOT NULL,
	"opponentSpecies" text DEFAULT '' NOT NULL,
	"opponentNature" text DEFAULT 'Hardy' NOT NULL,
	"opponentAbility" text DEFAULT '' NOT NULL,
	"opponentItem" text DEFAULT '' NOT NULL,
	"opponentMove" text DEFAULT '' NOT NULL,
	"opponentTeraType" text DEFAULT '' NOT NULL,
	"opponentStatus" text DEFAULT 'Healthy' NOT NULL,
	"opponentBoostedStat" text DEFAULT '' NOT NULL,
	"opponentLevel" integer DEFAULT 50 NOT NULL,
	"opponentEvs" jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb NOT NULL,
	"opponentIvs" jsonb DEFAULT '{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}'::jsonb NOT NULL,
	"opponentBoosts" jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb NOT NULL,
	"opponentIsCrit" boolean DEFAULT false NOT NULL,
	"opponentAbilityOn" boolean DEFAULT false NOT NULL,
	"fieldConditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"selectedPokemonModifiers" jsonb DEFAULT '{"teraType":"","boosts":{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0},"status":"Healthy","isCrit":false,"abilityOn":false,"boostedStat":""}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokemon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teamId" uuid NOT NULL,
	"slot" integer NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"species" text DEFAULT '' NOT NULL,
	"nature" text DEFAULT 'Hardy' NOT NULL,
	"ability" text DEFAULT '' NOT NULL,
	"item" text DEFAULT '' NOT NULL,
	"move" text DEFAULT '' NOT NULL,
	"teraType" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Healthy' NOT NULL,
	"boostedStat" text DEFAULT '' NOT NULL,
	"level" integer DEFAULT 50 NOT NULL,
	"evs" jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb NOT NULL,
	"ivs" jsonb DEFAULT '{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}'::jsonb NOT NULL,
	"boosts" jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb NOT NULL,
	"isCrit" boolean DEFAULT false NOT NULL,
	"abilityOn" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pokemon_teamId_slot_unique" UNIQUE("teamId","slot")
);
--> statement-breakpoint
CREATE TABLE "speed_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pokemonId" uuid NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"species" text DEFAULT '' NOT NULL,
	"nature" text DEFAULT 'Hardy' NOT NULL,
	"ability" text DEFAULT '' NOT NULL,
	"item" text DEFAULT '' NOT NULL,
	"teraType" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Healthy' NOT NULL,
	"boostedStat" text DEFAULT '' NOT NULL,
	"level" integer DEFAULT 50 NOT NULL,
	"evs" jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb NOT NULL,
	"ivs" jsonb DEFAULT '{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}'::jsonb NOT NULL,
	"boosts" jsonb DEFAULT '{"hp":0,"atk":0,"def":0,"spa":0,"spd":0,"spe":0}'::jsonb NOT NULL,
	"abilityOn" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calc_entries" ADD CONSTRAINT "calc_entries_pokemonId_pokemon_id_fk" FOREIGN KEY ("pokemonId") REFERENCES "public"."pokemon"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon" ADD CONSTRAINT "pokemon_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speed_entries" ADD CONSTRAINT "speed_entries_pokemonId_pokemon_id_fk" FOREIGN KEY ("pokemonId") REFERENCES "public"."pokemon"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "teams_user_id_idx" ON "teams" USING btree ("userId");