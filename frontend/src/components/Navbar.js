"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, User, Search, Menu, LogOut, ChevronDown, Calendar, Settings, LayoutDashboard, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("userName");
      const role = localStorage.getItem("userRole");
      
      if (token) {
        setIsLoggedIn(true);
        setUserRole(role || "user");
        if (name) {
          setUserName(name);
        } else {
          try {
            const res = await fetch("http://localhost:8000/api/auth/me", {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              setUserName(data.name);
              setUserRole(data.role);
              localStorage.setItem("userName", data.name);
              localStorage.setItem("userRole", data.role);
            }
          } catch (err) {
            console.error("Failed to fetch user name:", err);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserRole("");
      }
    };

    checkAuth();
  }, [pathname]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");
    setIsDropdownOpen(false);
    router.push("/login");
  };

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
            {userRole === "owner" ? (
              <>
                <Link 
                  href="/owner/dashboard" 
                  className={`px-4 py-2 rounded-xl smooth-transition ${
                    isActive("/owner/dashboard") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/owner/grounds" 
                  className={`px-4 py-2 rounded-xl smooth-transition ${
                    isActive("/owner/grounds") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  My Grounds
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  className={`px-4 py-2 rounded-xl smooth-transition ${
                    isActive("/") 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-gray-600 hover:text-primary hover:bg-surface"
                  }`}
                >
                  Home
                </Link>
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
              </>
            )}
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
                      {userRole}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 smooth-transition ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl border border-black/5 py-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-black/5 mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logged in as</p>
                      <p className="text-sm font-bold text-secondary truncate">{userName}</p>
                      <p className="text-[10px] font-bold text-primary uppercase">{userRole}</p>
                    </div>
                    
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
                    ) : (
                      <Link 
                        href="/bookings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary smooth-transition"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>My Bookings</span>
                      </Link>
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

            <button className="md:hidden p-2 text-secondary hover:bg-surface rounded-lg smooth-transition">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
