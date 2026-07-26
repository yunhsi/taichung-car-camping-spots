CREATE TABLE "api_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"request_count" integer NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL
);
