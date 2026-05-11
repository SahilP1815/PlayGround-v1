"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, User, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 smooth-transition ${
        isScrolled ? "glass py-3 shadow-lg shadow-black/5" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between max-w-[1400px]">
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <div className="bg-primary p-1.5 rounded-lg">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight outfit text-secondary">
            Play<span className="text-primary">Ground</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center space-x-1 text-sm font-medium border-r border-black/5 pr-6 mr-2">
            <Link 
              href="/explore" 
              className={`px-4 py-2 rounded-xl smooth-transition ${
                isActive("/explore") 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "text-gray-600 hover:text-primary hover:bg-surface"
              }`}
            >
              Explore
            </Link>
            <Link 
              href="/bookings" 
              className={`px-4 py-2 rounded-xl smooth-transition ${
                isActive("/bookings") 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "text-gray-600 hover:text-primary hover:bg-surface"
              }`}
            >
              My Bookings
            </Link>
            <Link 
              href="/owner" 
              className={`px-4 py-2 rounded-xl smooth-transition ${
                isActive("/owner") 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "text-gray-400 hover:text-primary hover:bg-surface"
              }`}
            >
              List Your Ground
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button className="lg:hidden p-2 hover:bg-surface rounded-full smooth-transition text-gray-600">
              <Search className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center relative mr-2 group">
              <Search className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-primary smooth-transition" />
              <input 
                type="text" 
                placeholder="Search for grounds..." 
                className="bg-gray-50/50 border border-black/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 focus:w-72 smooth-transition hover:bg-white hover:shadow-xl hover:shadow-black/5 glass"
              />
            </div>
            <Link 
              href="/login" 
              className="flex items-center space-x-2 bg-white hover:bg-surface px-4 py-2 rounded-full border border-black/5 shadow-sm smooth-transition"
            >
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-secondary">Login</span>
            </Link>
            <button className="md:hidden p-2 text-secondary hover:bg-surface rounded-lg smooth-transition">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
