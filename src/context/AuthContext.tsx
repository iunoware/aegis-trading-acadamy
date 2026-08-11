"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export interface SafeUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  discordName?: string | null;
  role: string;
  status: string;
}

interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setAuthUser: (user: SafeUser | null) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });

      if (response.ok) {
        const data = await response.json();
        console.log("user data:", data);
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setUser(data.authenticated && data.user ? data.user : null);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const setAuthUser = useCallback((user: SafeUser | null) => {
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  const isStudent = user?.role === "STUDENT";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isStudent,
        isAdmin,
        isLoading,
        setAuthUser,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
