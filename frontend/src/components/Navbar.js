"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, User, Search, Menu, LogOut, ChevronDown, Calendar, Settings, LayoutDashboard, MapPin, Heart, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onMenuClick, sidebarOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = isAuthenticated;
  const userName = user?.name || "";
  const userRole = user?.role || "";
  const displayRole = 
    userRole === "user" ? "player" :
    userRole === "handler" ? "handler" :
    (userRole === "admin" && (pathname?.startsWith("/owner") || pathname === "/bookings")) ? "owner" : 
    userRole;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 smooth-transition ${
          isScrolled ? "glass py-3 shadow-lg shadow-black/5" : "bg-transparent py-5"
        }`}
      >
      <div className="container mx-auto px-4 flex items-center justify-between max-w-[1400px]">
        <div className="flex items-center gap-4 flex-1">
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="p-2 hover:bg-black/5 rounded-xl smooth-transition"
            >
              <Menu className={`w-6 h-6 ${sidebarOpen ? "text-primary" : "text-gray-400"}`} />
            </button>
          )}
          {(!pathname?.startsWith("/owner") || isScrolled) && (
            <Link href={userRole === "owner" ? "/owner/dashboard" : "/"} className="flex items-center space-x-2 shrink-0">
              <div className="bg-primary p-1.5 rounded-lg">
                <Trophy className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight outfit text-secondary">
                Play<span className="text-primary">Ground</span>
              </span>
            </Link>
          )}
        </div>

        {/* Centered Navigation Links */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center text-sm font-medium" style={{ gap: "24px" }}>
            {displayRole === "owner" ? (
              <>
                <Link 
                  href="/owner/dashboard" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/owner/dashboard") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/owner/grounds" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/owner/grounds") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  My Grounds
                </Link>
                <Link 
                  href="/owner/personal-bookings" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/owner/personal-bookings") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  My Bookings
                </Link>
              </>
            ) : displayRole === "admin" ? (
              <>
                <Link 
                  href="/" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/explore" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/explore") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Explore
                </Link>
                <Link 
                  href="/bookings" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/bookings") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  My Bookings
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/explore" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/explore") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Explore
                </Link>
                <Link 
                  href="/bookings" 
                  style={{ padding: "8px 16px" }}
                  className={`rounded-xl smooth-transition ${
                    isActive("/bookings") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  My Bookings
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center flex-1 justify-end" style={{ gap: "24px" }}>
          <div className="flex items-center space-x-2">
            {!pathname?.startsWith("/owner") && pathname !== "/explore" && (
              <>
                <button 
                  onClick={() => router.push("/explore")}
                  className="lg:hidden p-2 hover:bg-surface rounded-full smooth-transition text-gray-600"
                >
                  <Search className="w-5 h-5" />
                </button>
                <div className="hidden lg:flex items-center relative mr-2 group">
                  <Search className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-primary smooth-transition" />
                  <input 
                    type="text" 
                    placeholder="Search for grounds..." 
                    suppressHydrationWarning
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchQuery("");
                      }
                    }}
                    className="bg-gray-50/50 border border-black/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 focus:w-64 smooth-transition hover:bg-white hover:shadow-xl hover:shadow-black/5 glass"
                  />
                </div>
              </>
            )}

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-white hover:bg-surface px-3 py-1.5 rounded-full border border-black/5 shadow-sm smooth-transition"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-sm font-semibold text-secondary leading-none max-w-[100px] truncate">
                      {userName || "Profile"}
                    </span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter opacity-70">
                      {displayRole}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 smooth-transition ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/5 py-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-black/5 mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logged in as</p>
                      <p className="text-sm font-bold text-secondary truncate">{userName}</p>
                      <p className="text-[10px] font-bold text-primary uppercase">{displayRole}</p>
                    </div>

                    <Link 
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    
                    {userRole === "owner" ? (
                      <>
                        <Link 
                          href="/owner/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link 
                          href="/owner/grounds"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>My Grounds</span>
                        </Link>
                      </>
                    ) : userRole === "handler" ? (
                      <>
                        <Link 
                          href="/handler/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link 
                          href="/handler/venues"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Assigned Venues</span>
                        </Link>
                      </>
                    ) : userRole === "admin" ? (
                      <Link 
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : (
                      <>
                        <Link 
                          href="/bookings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>My Bookings</span>
                        </Link>
                        <Link 
                          href="/favorites"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                        >
                          <Heart className="w-4 h-4" />
                          <span>My Favorites</span>
                        </Link>
                      </>
                    )}

                    <div className="h-px bg-black/5 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 smooth-transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center space-x-2 bg-white hover:bg-surface px-4 py-2 rounded-full border border-black/5 shadow-sm smooth-transition"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-secondary">Login</span>
              </Link>
            )}

            {!pathname?.startsWith("/owner") && (
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-secondary hover:bg-surface rounded-lg smooth-transition"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>

    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Dark overlay — clicking it closes the drawer */}
          <motion.div
            className="mobile-overlay md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed top-0 left-0 h-full w-72 bg-white z-[99] flex flex-col shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header row: logo + X close button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <Trophy className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold outfit text-secondary">
                  Play<span className="text-primary">Ground</span>
                </span>
              </Link>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                }} 
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface bg-gray-50 border border-black/5 active:scale-95 smooth-transition"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-600 pointer-events-none" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
              {displayRole === "owner" ? (
                <>
                  <Link href="/owner/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/owner/dashboard") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link href="/owner/grounds" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/owner/grounds") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <MapPin className="w-5 h-5" /> My Grounds
                  </Link>
                  <Link href="/owner/personal-bookings" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/owner/personal-bookings") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Calendar className="w-5 h-5" /> My Bookings
                  </Link>
                </>
              ) : displayRole === "admin" ? (
                <>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Trophy className="w-5 h-5" /> Home
                  </Link>
                  <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/explore") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Search className="w-5 h-5" /> Explore
                  </Link>
                  <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/bookings") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Calendar className="w-5 h-5" /> My Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Trophy className="w-5 h-5" /> Home
                  </Link>
                  <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/explore") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Search className="w-5 h-5" /> Explore
                  </Link>
                  <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-5 py-3.5 text-base rounded-xl ${isActive("/bookings") ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-surface hover:text-primary"}`}>
                    <Calendar className="w-5 h-5" /> My Bookings
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-black/5 p-4">
              {isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-secondary">{userName || "Profile"}</span>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{displayRole}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-2xl font-bold text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-2xl font-bold text-sm"
                >
                  <User className="w-4 h-4" /> Login / Sign Up
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
