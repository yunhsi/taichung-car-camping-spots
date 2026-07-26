CREATE TABLE "favorite_list" (
	"user_id" uuid NOT NULL,
	"attraction_id" text NOT NULL,
	CONSTRAINT "favorite_list_user_id_attraction_id_pk" PRIMARY KEY("user_id","attraction_id")
);
--> statement-breakpoint
CREATE TABLE "reviews_list" (
	"user_id" uuid NOT NULL,
	"attraction_id" text NOT NULL,
	"id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_list_user_id_attraction_id_pk" PRIMARY KEY("user_id","attraction_id")
);
--> statement-breakpoint
ALTER TABLE "favorite_list" ADD CONSTRAINT "favorite_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews_list" ADD CONSTRAINT "reviews_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;