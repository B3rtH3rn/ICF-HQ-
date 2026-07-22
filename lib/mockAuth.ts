"use client";

/**
 * MOCK AUTH — placeholder only.
 * There is no real authentication yet. This stub stores a pretend "logged in"
 * user in localStorage so the personalized UI (login → dashboard) can be built
 * and reviewed before we choose a real auth provider. Swap the internals of
 * these functions for the real provider later; the component API stays the same.
 */

import { useEffect, useState } from "react";

export type MockUser = {
  name: string;
};

const KEY = "icf-mock-user";
const EVENT = "icf-auth-change";

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function loginMock(name = "Bert"): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ name }));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function logoutMock(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

/** React hook: returns the current mock user, updating on login/logout. */
export function useMockUser(): MockUser | null {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(getMockUser());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}
