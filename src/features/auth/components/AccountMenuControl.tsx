"use client";

import { AccountMenuContent } from "@/features/auth/components/AccountMenuContent";
import {
  signInWithGoogle,
  signOutCurrentUser,
} from "@/features/auth/lib/accountActions";
import { useUserData } from "@/features/user/components/UserDataProvider";

export function AccountMenuControl() {
  const { user } = useUserData();
  const actions = {
    signInAction: signInWithGoogle,
    signOutAction: signOutCurrentUser,
  };

  if (!user) {
    return <AccountMenuContent status="unauthenticated" {...actions} />;
  }

  return (
    <AccountMenuContent
      {...actions}
      status="authenticated"
      user={user}
    />
  );
}
