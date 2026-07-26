import "server-only";

import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import { favorites } from "@/lib/db/schema";

export async function readFavorites(
  userId: string,
): Promise<string[]> {
  const database = getDatabase();
  const rows = await database
    .select({ attractionId: favorites.attractionId })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  return rows.map((row) => row.attractionId);
}

export async function updateFavorite(
  userId: string,
  attractionId: string,
  isFavorite: boolean,
): Promise<void> {
  const database = getDatabase();

  if (isFavorite) {
    await database
      .insert(favorites)
      .values({ userId, attractionId })
      .onConflictDoNothing();
    return;
  }

  await database
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.attractionId, attractionId),
      ),
    );
}
