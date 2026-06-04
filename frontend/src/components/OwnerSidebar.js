"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const sidebarCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  :root {
    --teal: #1abc9c; --teal-light: #e8f8f4; --teal-mid: #a8e6d8; --teal-dark: #0e9b7d;
    --sidebar-bg: #f7faf9; --sidebar-w: 240px; --white: #ffffff;
    --text-primary: #1a2b2a; --text-secondary: #5f7b78; --text-muted: #9ab5b2;
    --border: #e2eeec; --card-shadow: 0 2px 12px rgba(26,188,156,0.07);
    --radius: 20px; --radius-sm: 12px; --radius-xs: 8px;
    --font: 'Plus Jakarta Sans', sans-serif;
    --orange: #e67e22;
    --red: #e74c3c; --red-light: #fdeaea;
  }
  .pg-sidebar { width: var(--sidebar-w); background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; padding-bottom: 24px; font-family: var(--font); }
  .pg-logo-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 22px 20px 18px; border-bottom: 1px solid var(--border); }
  .pg-logo-row { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .pg-logo-icon { width: 36px; height: 36px; background: var(--teal); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .pg-logo-name { font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
  .pg-logo-name span { color: var(--teal); }
  .pg-owner-tag { font-size: 10px; background: #fff3e0; color: var(--orange); padding: 2px 8px; border-radius: 10px; font-weight: 700; letter-spacing: 0.05em; }
  .pg-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
  .pg-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; margin-bottom: 2px; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; text-decoration: none; }
  .pg-nav-item:hover { background: var(--teal-light); color: var(--teal-dark); }
  .pg-nav-item.active { background: var(--teal-light); color: var(--teal); font-weight: 600; }
  .pg-sidebar-bottom { padding: 0 12px; margin-top: auto; }
  .pg-user-chip { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--radius-sm); background: white; border: 1px solid var(--border); }
  .pg-avatar { width: 34px; height: 34px; background: var(--teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
  .pg-user-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
  .pg-user-email { font-size: 10px; color: var(--text-muted); }
`;

export default function OwnerSidebar({ collapsed, onToggle, hidden }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("owner");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Owner");
    setUserRole(localStorage.getItem("userRole") || "owner");
    
    const savedCollapse = localStorage.getItem("ownerSidebarCollapsed") === "true";
    setIsCollapsed(savedCollapse);
  }, []);

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem("ownerSidebarCollapsed", newVal ? "true" : "false");
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { 
      href: "/owner/dashboard", 
      label: "Dashboard", 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> 
    },
    { 
      href: "/owner/bookings", 
      label: "Bookings", 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 
    },
    { 
      href: "/owner/grounds", 
      label: "My Grounds", 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> 
    },
    { 
      href: "/owner/add-ground", 
      label: "Add Ground", 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> 
    },
    { 
      href: "/owner/handlers", 
      label: "Handlers", 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
    },
    { 
      href: "/owner/personal-bookings", 
      label: "Personal Bookings", 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
    },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="pg-logo-wrap relative">
        <Link href="/owner/dashboard" onClick={() => setDrawerOpen(false)} className="pg-logo-row" style={{ paddingRight: "30px" }}>
          <div className="pg-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
          <div className="pg-logo-name">Play<span>Ground</span></div>
        </Link>
        <span className="pg-owner-tag">OWNER PANEL</span>
        
        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute top-6 right-3 w-7 h-7 rounded-lg border border-black/5 bg-gray-50/50 hover:bg-teal-light hover:text-teal-dark items-center justify-center smooth-transition"
          style={{ cursor: "pointer", padding: 0 }}
          title="Collapse Sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
      <nav className="pg-nav">
        {navItems.map((item) => {
          const active = item.href === '/owner/grounds' 
            ? pathname.startsWith('/owner/grounds') 
            : pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setDrawerOpen(false)}
              className={`pg-nav-item ${active ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
              {active && (
                <div style={{ width: 6, height: 6, background: "var(--teal)", borderRadius: "50%", marginLeft: "auto" }} />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="pg-sidebar-bottom">
        <div className="pg-user-chip">
          <div className="pg-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="pg-user-name">{userName}</div>
            <div className="pg-user-email" style={{ textTransform: "capitalize" }}>
              {userRole === "user" ? "player" : userRole}
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setDrawerOpen(false); handleLogout(); }}
          className="pg-nav-item" 
          style={{ marginTop: 8, color: "var(--red)", border: "1px solid var(--red-light)", background: "var(--red-light)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{sidebarCss}</style>
      
      {/* Collapsed Injected Styles */}
      <style>{isCollapsed ? `
        .pg-sidebar {
          transform: translateX(-100%) !important;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .pg-main {
          margin-left: 0 !important;
          width: 100% !important;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .pg-topbar {
          padding-left: 72px !important;
          transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      ` : `
        .pg-sidebar {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .pg-main {
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .pg-topbar {
          transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>

      {/* DESKTOP COLLAPSED TRIGGER */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="hidden md:flex fixed top-2.5 left-4 z-[99] w-11 h-11 bg-white border border-black/10 rounded-xl items-center justify-center shadow-md hover:scale-105 smooth-transition"
          style={{ cursor: "pointer" }}
          title="Expand Sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* MOBILE: Floating hamburger button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[97] w-11 h-11 bg-white border border-black/10 rounded-xl flex items-center justify-center shadow-md"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* MOBILE: Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="mobile-overlay md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* DESKTOP: Fixed sidebar */}
      <aside className={`pg-sidebar hidden md:flex ${hidden ? "hidden" : ""}`}>
        {renderSidebarContent()}
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            className="md:hidden fixed top-0 left-0 h-full w-[240px] z-[99] flex flex-col"
            style={{ background: 'var(--sidebar-bg, #f7faf9)', borderRight: '1px solid var(--border, #e2eeec)' }}
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
          >
            {/* Dedicated Floating Close Button (Outside the drawer) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(false);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setDrawerOpen(false);
              }}
              className="absolute top-4 -right-14 w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-black/5 shadow-md active:scale-95 z-[100]"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-600 pointer-events-none" />
            </button>

            {renderSidebarContent()}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
