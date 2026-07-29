"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { EnergyStyle } from "@/lib/avatarOptions";

export type Profile = {
  display_name: string | null;
  avatar_color: string | null;
  avatar_energy: EnergyStyle;
  avatar_symbols: string[];
};

export type Role = "intern" | "admin";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  /** Resolves to "intern" once loaded — never self-assignable from the app. */
  role: Role | null;
  /** Convenience — true only once `role` has resolved to "admin". */
  isAdmin: boolean;
  /** True until the initial session + profile + role check completes. */
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_color, avatar_energy, avatar_symbols")
        .eq("id", userId)
        .single();
      setProfile((data as Profile) ?? null);
    },
    [supabase]
  );

  const loadRole = useCallback(
    async (userId: string) => {
      // maybeSingle, not single — a missing row (e.g. a pre-migration user
      // who hasn't been backfilled yet) should read as "intern", not throw.
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      setRole((data?.role as Role) ?? "intern");
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active) return;
      setUser(user);
      if (user) {
        // Parallel fetch, single loading gate — both must resolve before
        // the rest of the app treats auth state as "settled".
        await Promise.all([loadProfile(user.id), loadRole(user.id)]);
      }
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadRole(session.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, loadProfile, loadRole]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === "admin",
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
