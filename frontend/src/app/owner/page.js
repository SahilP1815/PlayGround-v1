"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function OwnerPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/owner/dashboard");
  }, [router]);

  return (
    <ProtectedRoute role="owner">
      <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </ProtectedRoute>
  );
}
