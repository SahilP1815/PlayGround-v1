"use client";

import Navbar from "@/components/Navbar";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Github,
  Globe,
  Smartphone,
  CheckCircle2,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login or signup
  const [role, setRole] = useState("user"); // user or owner
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup" 
        ? { ...formData, role } 
        : new URLSearchParams({ username: formData.email, password: formData.password });

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: mode === "signup" ? { "Content-Type": "application/json" } : { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload instanceof URLSearchParams ? payload : JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
        // Redirect to home page
        router.push("/");
      } else {
        const err = await response.json();
        alert(err.detail || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      // Fallback for demo
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-20 pb-12 px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Branding/Value Prop */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <Trophy className="text-primary w-8 h-8" />
              </div>
              <h1 className="text-6xl font-bold outfit leading-tight mb-6">
                Join the <span className="text-gradient">Arena</span>.<br />
                Own the Game.
              </h1>
              <p className="text-gray-500 text-lg max-w-md mb-10 leading-relaxed">
                Whether you're a weekend warrior or a venue owner, PlayGround is your
                all-access pass to the best sports facilities in Ahmedabad.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-secondary">Instant Slot Booking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-secondary">Verified Premium Venues</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-secondary">Exclusive Member Rewards</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Auth Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-[48px] border border-black/5 p-10 md:p-14 shadow-2xl shadow-black/5 relative overflow-hidden"
          >
            {/* Role Switcher */}
            <div className="flex bg-surface p-1.5 rounded-2xl border border-black/5 mb-10 w-fit">
              <button
                onClick={() => setRole("user")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider smooth-transition ${role === "user" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
                  }`}
              >
                I'm a Player
              </button>
              <button
                onClick={() => setRole("owner")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider smooth-transition ${role === "owner" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
                  }`}
              >
                I'm an Owner
              </button>
            </div>

            <h2 className="text-3xl font-bold outfit mb-2">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 mb-10 text-sm">
              {mode === "login" ? "Login to access your bookings and rewards." : "Start your sports journey with us today."}
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary smooth-transition" />
                      <input
                        type="text"
                        required={mode === "signup"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Rahul Sharma"
                        className="w-full bg-surface border border-black/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary smooth-transition" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full bg-surface border border-black/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary smooth-transition" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-surface border border-black/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-secondary hover:bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-xl shadow-black/10 mt-8 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-gray-400">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-black/5 hover:bg-surface smooth-transition font-medium text-sm text-secondary">
                <Globe className="w-5 h-5" /> Google
              </button>
              <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-black/5 hover:bg-surface smooth-transition font-medium text-sm text-secondary">
                <Smartphone className="w-5 h-5" /> Smartphone
              </button>
            </div>

            <p className="text-center mt-10 text-sm text-gray-500">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="ml-2 font-bold text-primary hover:underline"
              >
                {mode === "login" ? "Sign Up Free" : "Log In"}
              </button>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
