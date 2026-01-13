"use client";

import * as React from "react";
import type { User } from "@/api/auth";

export function useSessionUser() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const stored = sessionStorage.getItem("lm_user");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
    } catch {
      sessionStorage.removeItem("lm_user");
    }
  }, []);

  return user;
}
