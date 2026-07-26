import "server-only";

import { auth } from "@/auth";
import type { AuthenticatedUser } from "@/features/user/types";

export async function readUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
    name: session.user.name ?? null,
  };
}
