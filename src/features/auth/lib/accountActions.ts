"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { createAccountResultUrl } from "@/features/auth/lib/accountResult";

export async function signInWithGoogle() {
  let authorizationUrl: string;

  try {
    authorizationUrl = await signIn("google", {
      redirect: false,
      redirectTo: createAccountResultUrl("login-success"),
    });
  } catch {
    redirect(createAccountResultUrl("login-error"));
  }

  redirect(authorizationUrl);
}

export async function signOutCurrentUser() {
  try {
    await signOut({ redirect: false });
  } catch {
    redirect(createAccountResultUrl("logout-error"));
  }

  redirect(createAccountResultUrl("logout-success"));
}
