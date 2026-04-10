// src/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@/hooks/useUser";
import authService from "@/service/auth.service";
import {
  clearAuthSession,
  getStoredAuthUser,
  getStoredDemoUser,
  getStoredToken,
  isDemoToken,
  storeAuthUser,
} from "@/service/auth-storage";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (globalThis.window === undefined) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    const token = getStoredToken();
    const cachedUser = getStoredAuthUser<User>();

    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    if (isDemoToken(token)) {
      const demoUser = getStoredDemoUser<User>();
      setCurrentUser(demoUser);
      setIsLoading(false);
      return;
    }

    try {
      const user = await authService.getProfile();
      setCurrentUser(user);
      storeAuthUser(user, { rememberMe: Boolean(globalThis.localStorage.getItem("token")) });
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        clearAuthSession();
        setCurrentUser(null);
      } else {
        setCurrentUser(cachedUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await loadUser();
  }, [loadUser]);

  const value = useMemo(
    () => ({ currentUser, setCurrentUser, isLoading, refreshUser }),
    [currentUser, isLoading, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}