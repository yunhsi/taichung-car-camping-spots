ALTER TABLE "favorite_list" RENAME TO "favorites";--> statement-breakpoint
ALTER TABLE "reviews_list" RENAME TO "reviews";--> statement-breakpoint
ALTER TABLE "favorites" DROP CONSTRAINT "favorite_list_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_list_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "reviews_list_attraction_updated_idx";--> statement-breakpoint
ALTER TABLE "favorites" DROP CONSTRAINT "favorite_list_user_id_attraction_id_pk";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_list_user_id_attraction_id_pk";--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_attraction_id_pk" PRIMARY KEY("user_id","attraction_id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_attraction_id_pk" PRIMARY KEY("user_id","attraction_id");--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reviews_attraction_updated_idx" ON "reviews" USING btree ("attraction_id","updated_at");