CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"osu_id" integer NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text NOT NULL,
	"pp" integer NOT NULL,
	"country" jsonb NOT NULL,
	"survey_result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_osu_id_unique" UNIQUE("osu_id")
);
