"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, role, redirectTo = "/login" }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (role && user?.role !== role && user?.role !== "admin") {
        showToast("You don't have permission to access this page", "error");
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, user, role, router, redirectTo, showToast]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-primary animate-spin absolute inset-0" />
        </div>
        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || (role && user?.role !== role && user?.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
