"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setUser(null);
    setToken(null);
    window.location.href = "/"; // Hard reload to clear any panel-specific global CSS
  }, []);

  const hydrateUser = useCallback(async (authToken) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(authToken);
        // Sync legacy localStorage values for compatibility
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Hydration error:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      hydrateUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, [hydrateUser]);

  const login = (authToken, userData) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userName", userData.name);
    setToken(authToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
