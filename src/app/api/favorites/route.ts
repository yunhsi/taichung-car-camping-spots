import { NextResponse } from "next/server";

import { readUser } from "@/features/auth/lib/authenticatedUser";
import {
  readFavorites,
  updateFavorite,
} from "@/features/favorites/data/favoritesRepository";
import { parseFavoriteUpdateInput } from "@/features/favorites/lib/favoriteValidation";
import { enforceUserRateLimit } from "@/features/security/lib/userRateLimit";
import { readJsonRequest } from "@/lib/apiRequest";

const FAVORITE_WRITE_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function GET() {
  const user = await readUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    favoriteAttractionIds: await readFavorites(user.id),
  });
}

export async function PATCH(request: Request) {
  const user = await readUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await enforceUserRateLimit({
    action: "favorite-write",
    userId: user.id,
    limit: FAVORITE_WRITE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const favorite = parseFavoriteUpdateInput(await readJsonRequest(request));

  if (!favorite) {
    return NextResponse.json({ error: "Invalid favorite" }, { status: 400 });
  }

  await updateFavorite(user.id, favorite.attractionId, favorite.isFavorite);

  return NextResponse.json({ success: true });
}
