import type { AdapterAccountType } from "next-auth/adapters";

import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    index("accounts_user_id_idx").on(account.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (session) => [index("sessions_user_id_idx").on(session.userId)],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attractionId: text("attraction_id").notNull(),
  },
  (favorite) => [
    primaryKey({ columns: [favorite.userId, favorite.attractionId] }),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attractionId: text("attraction_id").notNull(),
    id: text("id").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (review) => [
    primaryKey({ columns: [review.userId, review.attractionId] }),
    uniqueIndex("reviews_id_unique").on(review.id),
    index("reviews_attraction_updated_idx").on(
      review.attractionId,
      review.updatedAt,
    ),
  ],
);

export const reviewReports = pgTable(
  "review_reports",
  {
    reporterUserId: uuid("reporter_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewId: text("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (report) => [
    primaryKey({ columns: [report.reporterUserId, report.reviewId] }),
    index("review_reports_review_id_idx").on(report.reviewId),
  ],
);

export const apiRateLimits = pgTable("api_rate_limits", {
  key: text("key").primaryKey(),
  requestCount: integer("request_count").notNull(),
  windowStartedAt: timestamp("window_started_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});
