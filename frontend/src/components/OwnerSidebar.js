"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  Plus,
  Building2,
  Settings,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function OwnerSidebar({ collapsed, onToggle, hidden }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Owner";
    const email = localStorage.getItem("userEmail") || "owner@playground.com";
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  const navItems = [
    { href: "/owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/owner/bookings", icon: Calendar, label: "Bookings" },
    { href: "/owner/grounds", icon: Building2, label: "My Grounds" },
    { href: "/owner/add-ground", icon: Plus, label: "Add Ground" },
  ];

  const bottomItems = [
    { icon: LogOut, label: "Logout", onClick: handleLogout, danger: true },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-white border-r border-gray-100 smooth-transition ${
        collapsed ? "w-[78px]" : "w-[272px]"
      } ${hidden ? "-translate-x-full" : "translate-x-0"}`}
    >
      {/* Header — Logo + Hamburger */}
      <div
        className={`flex items-center px-5 pt-7 pb-6 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link
          href="/owner/dashboard"
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Trophy className="text-white w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight outfit text-secondary">
              Play<span className="text-primary">Ground</span>
            </span>
          )}
        </Link>

      </div>



      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100" />

      {/* Main Navigation */}
      <nav className="flex-1 px-3 pt-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-2xl smooth-transition font-semibold text-sm group relative ${
                collapsed ? "justify-center px-0 py-3.5 mx-1" : "px-4 py-3.5"
              } ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:text-secondary hover:bg-surface"
              }`}
            >
              <div
                className={`p-2 rounded-xl smooth-transition shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-transparent group-hover:bg-white group-hover:shadow-sm"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 smooth-transition whitespace-nowrap z-[60] shadow-xl">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-secondary rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section — Settings & Logout */}
      <div className="px-3 pb-2">
        <div className="mx-1 h-px bg-gray-100 mb-3" />
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-2xl smooth-transition font-semibold text-sm group relative ${
                collapsed
                  ? "justify-center px-0 py-3.5 mx-1"
                  : "px-4 py-3.5"
              } ${
                item.danger
                  ? "text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                  : "text-gray-400 hover:text-secondary hover:bg-surface"
              }`}
            >
              <div className="p-2 rounded-xl smooth-transition shrink-0 bg-transparent">
                <Icon className="w-[18px] h-[18px]" />
              </div>
              {!collapsed && <span>{item.label}</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 smooth-transition whitespace-nowrap z-[60] shadow-xl">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-secondary rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div
        className={`border-t border-gray-100 px-3 py-4 ${
          collapsed ? "flex justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : "px-3"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-primary/20">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-secondary truncate leading-tight">
                {userName}
              </p>
              <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                {userEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
