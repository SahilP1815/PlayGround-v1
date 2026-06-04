"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Search, 
  User, 
  ChevronDown, 
  Bell, 
  LayoutDashboard, 
  ShieldCheck, 
  AlertCircle, 
  Users, 
  Building2, 
  Calendar, 
  Settings,
  LogOut,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Check,
  X
} from "lucide-react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --teal: #1abc9c; --teal-light: #e8f8f4; --teal-mid: #a8e6d8; --teal-dark: #0e9b7d;
    --sidebar-bg: #f7faf9; --sidebar-w: 240px; --white: #ffffff;
    --text-primary: #1a2b2a; --text-secondary: #5f7b78; --text-muted: #9ab5b2;
    --border: #e2eeec; --card-shadow: 0 2px 12px rgba(26,188,156,0.07);
    --radius: 16px; --radius-sm: 10px; --radius-xs: 8px;
    --font: 'Plus Jakarta Sans', sans-serif;
    --green: #27ae60; --green-light: #eafaf1;
    --orange: #e67e22; --orange-light: #fef5e7;
    --red: #e74c3c; --red-light: #fdeaea;
    --blue: #3498db; --blue-light: #ebf5fb;
    --purple: #7c6fe0; --purple-light: #f0eeff;
  }
  .pg-body { font-family: var(--font); background: #f0f5f4; color: var(--text-primary); min-height: 100vh; display: flex; }
  .pg-sidebar { width: var(--sidebar-w); background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 10; padding-bottom: 24px; }
  .pg-logo-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 22px 20px 18px; border-bottom: 1px solid var(--border); }
  .pg-logo-row { display: flex; align-items: center; gap: 10px; }
  .pg-logo-icon { width: 36px; height: 36px; background: var(--teal); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .pg-logo-name { font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
  .pg-logo-name span { color: var(--teal); }
  .pg-admin-tag { font-size: 10px; background: #fff3e0; color: var(--orange); padding: 2px 8px; border-radius: 10px; font-weight: 700; letter-spacing: 0.05em; }
  .pg-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
  .pg-nav-section { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 12px 6px; }
  .pg-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-xs); font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; margin-bottom: 2px; transition: all 0.15s; position: relative; border: none; background: none; width: 100%; text-align: left; }
  .pg-nav-item:hover { background: var(--teal-light); color: var(--teal-dark); }
  .pg-nav-item.active { background: var(--teal-light); color: var(--teal); font-weight: 600; }
  .pg-nav-dot { width: 7px; height: 7px; background: var(--teal); border-radius: 50%; margin-left: auto; }
  .pg-badge-count { margin-left: auto; background: var(--red); color: white; border-radius: 10px; font-size: 10px; font-weight: 700; padding: 2px 7px; min-width: 20px; text-align: center; }
  .pg-badge-orange { background: var(--orange) !important; }
  .pg-nav-divider { height: 1px; background: var(--border); margin: 6px 12px; }
  .pg-sidebar-bottom { padding: 0 12px; }
  .pg-user-chip { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-xs); }
  .pg-avatar { width: 34px; height: 34px; background: var(--orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
  .pg-user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .pg-user-role { font-size: 11px; color: var(--orange); font-weight: 600; }
  .pg-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; }
  .pg-topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 5; }
  .pg-page-name { font-size: 17px; font-weight: 700; color: var(--text-primary); }
  .pg-breadcrumb { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
  .pg-topbar-right { display: flex; align-items: center; gap: 12px; }
  .pg-notif-btn { position: relative; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .pg-notif-badge { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: var(--red); border-radius: 50%; font-size: 10px; color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
  .pg-admin-chip { display: flex; align-items: center; gap: 8px; padding: 7px 14px; background: #fff3e0; border-radius: 20px; font-size: 13px; font-weight: 600; color: var(--orange); }
  .pg-content { padding: 28px; flex: 1; overflow: auto; }
  .pg-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .pg-metric-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; box-shadow: var(--card-shadow); }
  .pg-metric-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .pg-metric-label { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
  .pg-metric-value { font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; }
  .pg-metric-sub { font-size: 11px; margin-top: 3px; font-weight: 600; }
  .c-green { color: var(--green); } .c-orange { color: var(--orange); } .c-red { color: var(--red); } .c-blue { color: var(--blue); } .c-teal { color: var(--teal); }
  .pg-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--card-shadow); overflow: hidden; margin-bottom: 16px; }
  .pg-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .pg-card-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .pg-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .pg-progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 6px; }
  .pg-progress-fill { height: 100%; border-radius: 3px; background: var(--teal); }
  .pg-progress-fill.orange { background: var(--orange); }
  .pg-progress-fill.red { background: var(--red); }
  .pg-mini-chart { display: flex; align-items: flex-end; gap: 3px; height: 36px; }
  .pg-bar { border-radius: 3px 3px 0 0; background: var(--teal-mid); flex: 1; transition: height 0.3s; }
  .pg-bar.active { background: var(--teal); }
  .pg-page-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  .pg-page-tab { padding: 9px 18px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; display: flex; align-items: center; gap: 6px; border: none; background: none; }
  .pg-page-tab.active { color: var(--teal); border-bottom: 2px solid var(--teal); }
  .pg-tab-count { background: var(--teal-light); color: var(--teal-dark); border-radius: 10px; font-size: 11px; padding: 1px 7px; font-weight: 700; }
  .pg-page-tab.active .pg-tab-count { background: var(--teal); color: white; }
  .pg-ground-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); transition: background 0.12s; }
  .pg-ground-row:hover { background: #fafefe; }
  .pg-ground-row:last-child { border-bottom: none; }
  .pg-ground-thumb { width: 52px; height: 52px; border-radius: var(--radius-xs); background: linear-gradient(135deg, var(--teal-mid) 0%, var(--teal) 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .pg-ground-info { flex: 1; min-width: 0; }
  .pg-ground-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .pg-ground-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .pg-ground-owner { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
  .pg-check-list { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .pg-check-item { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
  .pg-check-item.pass { background: var(--green-light); color: var(--green); }
  .pg-check-item.fail { background: var(--red-light); color: var(--red); }
  .pg-check-item.pending { background: var(--orange-light); color: var(--orange); }
  .pg-ground-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; flex-shrink: 0; }
  .pg-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .pg-badge-verified { background: var(--teal-light); color: var(--teal-dark); }
  .pg-badge-pending { background: var(--orange-light); color: var(--orange); }
  .pg-badge-rejected { background: var(--red-light); color: var(--red); }
  .pg-badge-review { background: var(--blue-light); color: var(--blue); }
  .pg-badge-suspended { background: #f5e6ff; color: #6c3483; }
  .pg-btn { padding: 7px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-size: 12px; font-weight: 600; color: var(--text-secondary); background: white; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: var(--font); }
  .pg-btn:hover { border-color: var(--teal); color: var(--teal); }
  .pg-btn.teal { background: var(--teal); color: white; border-color: var(--teal); }
  .pg-btn.teal:hover { background: var(--teal-dark); color: white; }
  .pg-btn.red { border-color: var(--red); color: var(--red); }
  .pg-btn.red:hover { background: var(--red-light); }
  .pg-btn.orange { border-color: var(--orange); color: var(--orange); }
  .pg-btn.orange:hover { background: var(--orange-light); }
  .pg-btn.sm { padding: 5px 10px; font-size: 11px; }
  .pg-toolbar { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-bottom: 1px solid var(--border); background: #fafefe; }
  .pg-search-box { display: flex; align-items: center; gap: 8px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); padding: 7px 12px; background: white; flex: 1; max-width: 280px; }
  .pg-search-box input { border: none; outline: none; font-size: 13px; color: var(--text-primary); background: transparent; width: 100%; font-family: var(--font); }
  .pg-filter-select { padding: 7px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-size: 12px; font-weight: 600; color: var(--text-secondary); background: white; cursor: pointer; font-family: var(--font); }
  .pg-table-wrap { overflow-x: auto; }
  .pg-table { width: 100%; border-collapse: collapse; }
  .pg-table thead th { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 16px; text-align: left; background: #f7faf9; border-bottom: 1px solid var(--border); white-space: nowrap; }
  .pg-table tbody td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-primary); vertical-align: middle; }
  .pg-table tbody tr:last-child td { border-bottom: none; }
  .pg-table tbody tr:hover { background: #fafefe; }
  .td-name { font-weight: 600; }
  .td-sub { font-size: 11px; color: var(--text-muted); }
  .pg-user-row { display: flex; align-items: center; gap: 8px; }
  .pg-mini-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
  .pg-dispute-card { padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .pg-dispute-card:last-child { border-bottom: none; }
  .pg-dispute-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .pg-dispute-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .pg-dispute-meta { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
  .pg-dispute-desc { font-size: 13px; color: var(--text-secondary); margin-top: 8px; background: #fff9f0; border-left: 3px solid var(--orange); border-radius: 0 6px 6px 0; padding: 8px 12px; }
  .pg-dispute-footer { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .pg-reporter-count { font-size: 12px; background: var(--orange-light); border-radius: 20px; padding: 3px 10px; font-weight: 600; color: var(--orange); }
  .pg-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .pg-modal { background: white; border-radius: var(--radius); width: 580px; max-width: 95vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .pg-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .pg-modal-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
  .pg-modal-close { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; }
  .pg-modal-body { padding: 24px; }
  .pg-doc-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .pg-doc-row:last-of-type { border-bottom: none; }
  .pg-doc-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .pg-doc-sub { font-size: 11px; color: var(--text-muted); }
  .pg-modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid var(--border); background: #fafefe; }
  .pg-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-family: var(--font); font-size: 13px; color: var(--text-primary); outline: none; resize: vertical; min-height: 80px; transition: border-color 0.15s; }
  .pg-textarea:focus { border-color: var(--teal); }
  .pg-toast { position: fixed; bottom: 24px; right: 24px; background: var(--text-primary); color: white; padding: 12px 24px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; z-index: 1000; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); animation: toastIn 0.3s ease-out; }
  @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .pg-section-label { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; }
  .pg-progress-row { margin-bottom: 12px; }
  .pg-progress-row-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .pg-progress-row-label { font-size: 13px; font-weight: 600; }
  .pg-week-labels { display: flex; justify-content: space-between; margin-top: 8px; }
  .pg-week-label { font-size: 11px; color: var(--text-muted); }
  .pg-week-label.active { color: var(--teal); font-weight: 700; }
  .pg-booking-stats { margin-top: 12px; display: flex; gap: 16px; }
  .pg-booking-stat-label { font-size: 11px; color: var(--text-muted); }
  .pg-booking-stat-value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
  .pg-settings-wrap { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .pg-setting-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
  .pg-setting-hint { font-size: 12px; color: var(--text-muted); }
  .pg-divider { height: 1px; background: var(--border); }
  .pg-switch { width: 44px; height: 24px; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; border: none; }
  .pg-switch-thumb { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 3px; transition: left 0.2s; }
  .pg-switch-row { display: flex; align-items: center; gap: 10px; }
  .pg-input { padding: 8px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-size: 14px; font-family: var(--font); outline: none; }
  .pg-select { padding: 8px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-size: 14px; font-family: var(--font); outline: none; background: white; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .pulse { animation: pulse 2s infinite; }
`;

const NAV = [
  { section: "Overview", items: [{ id: "overview", label: "Dashboard", dot: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }] },
  { section: "Verification", items: [
    { id: "grounds", label: "Grounds", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> },
    { id: "disputes", label: "Disputes", badge: 0, badgeClass: "pg-badge-orange", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg> },
  ]},
  { section: "Management", items: [
    { id: "owners", label: "Owners", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg> },
    { id: "users", label: "Users", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: "bookings", label: "Bookings", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ]},
  { section: "Config", items: [
    { id: "settings", label: "Settings", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ]},
];

const PAGE_NAMES = { overview: "Dashboard", grounds: "Grounds Management", disputes: "Disputes", owners: "Owners", users: "Users", bookings: "Bookings", settings: "Settings" };

function Badge({ variant, children, pulse }) {
  return <span className={`pg-badge pg-badge-${variant}${pulse ? " pulse" : ""}`}>{children}</span>;
}

function Btn({ variant, size, onClick, children }) {
  return <button className={`pg-btn${variant ? ` ${variant}` : ""}${size ? ` ${size}` : ""}`} onClick={onClick}>{children}</button>;
}

export default function AdminPanel() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("overview");
  const [selectedGround, setSelectedGround] = useState(null);
  const [stats, setStats] = useState({
    total_users: 0, total_owners: 0, total_grounds: 0, verified_grounds: 0,
    pending_grounds: 0, disputes_open: 0, revenue: 0
  });
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [pendingGrounds, setPendingGrounds] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groundTab, setGroundTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolvingDisputeId, setResolvingDisputeId] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchOwnersQuery, setSearchOwnersQuery] = useState("");
  const [searchUsersQuery, setSearchUsersQuery] = useState("");
  const [searchGroundsQuery, setSearchGroundsQuery] = useState("");
  const [searchBookingsQuery, setSearchBookingsQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setIsLoading(true);
    const headers = { "Authorization": `Bearer ${token}` };

    try {
      // 1. Authenticate first
      const meRes = await fetch("/api/auth/me", { headers });
      if (!meRes.ok) {
        localStorage.removeItem("token");
        router.push("/admin/login");
        return;
      }
      const meData = await meRes.json();
      if (meData.role?.toLowerCase() !== "admin") {
        router.push("/admin/login");
        return;
      }
      setAdminData(meData);

      // 2. Fetch data points independently
      const safeFetch = async (url, setter) => {
        try {
          const res = await fetch(url, { headers });
          if (res.ok) setter(await res.json());
        } catch (e) {
          console.error(`Failed to fetch ${url}:`, e);
        }
      };

      await Promise.all([
        safeFetch("/api/admin/stats", setStats),
        safeFetch("/api/admin/users", setUsers),
        safeFetch("/api/admin/owners", setOwners),
        safeFetch("/api/admin/grounds/pending", setPendingGrounds),
        safeFetch("/api/grounds/all", setGrounds),
        safeFetch("/api/admin/bookings", setAllBookings),
        safeFetch("/api/admin/disputes", setDisputes),
      ]);

    } catch (error) {
      console.error("Critical error in fetchData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId, resolution) => {
    setIsResolving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution: resolution,
          admin_notes: adminNotes
        })
      });
      if (res.ok) {
        setToast({ message: `Dispute resolved successfully: ${resolution.toUpperCase()}`, type: "success" });
        setResolvingDisputeId(null);
        setAdminNotes("");
        await fetchData();
      } else {
        const err = await res.json();
        setToast({ message: err.detail || "Failed to resolve dispute", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Connection error", type: "error" });
    } finally {
      setIsResolving(false);
    }
  };

  const renderSection = () => {
    switch (activePage) {
      case "overview": return (
        <div>
          <div className="pg-metrics">
            {[
              { label: "Total Grounds", value: stats.total_grounds, sub: "+0 this week", subClass: "c-teal", iconBg: "var(--teal-light)", iconColor: "#1abc9c", icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/> },
              { label: "Verified", value: stats.verified_grounds, sub: `${Math.round((stats.verified_grounds/stats.total_grounds)*100 || 0)}% rate`, subClass: "c-green", iconBg: "var(--green-light)", iconColor: "#27ae60", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></> },
              { label: "Pending Review", value: stats.pending_grounds, sub: "Oldest: 0 days", subClass: "c-orange", iconBg: "var(--orange-light)", iconColor: "#e67e22", icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
              { label: "Total Users", value: stats.total_users, sub: "Registered", subClass: "c-purple", iconBg: "var(--purple-light)", iconColor: "#7c6fe0", icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
              { label: "Total Owners", value: stats.total_owners, sub: "Arena Partners", subClass: "c-blue", iconBg: "var(--blue-light)", iconColor: "#3498db", icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></> },
              { label: "Revenue", value: `₹${(stats.revenue/1000).toFixed(1)}L`, sub: "Platform Vol", subClass: "c-teal", iconBg: "var(--teal-light)", iconColor: "#1abc9c", icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></> },
            ].map(m => (
              <div className="pg-metric-card" key={m.label}>
                <div className="pg-metric-icon" style={{ background: m.iconBg }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={m.iconColor} strokeWidth="2" width="20" height="20">{m.icon}</svg>
                </div>
                <div className="pg-metric-label">{m.label}</div>
                <div className="pg-metric-value">{m.value}</div>
                <div className={`pg-metric-sub ${m.subClass}`}>{m.sub}</div>
              </div>
            ))}
          </div>
          <div className="pg-two-col">
            <div className="pg-card">
              <div className="pg-card-header"><div className="pg-card-title">Verification Status</div><Badge variant="pending" pulse>Live</Badge></div>
              <div style={{ padding: "20px" }}>
                {[["Verified", stats.verified_grounds, "c-teal", `${(stats.verified_grounds/stats.total_grounds)*100 || 0}%`, ""], ["Pending", stats.pending_grounds, "c-orange", `${(stats.pending_grounds/stats.total_grounds)*100 || 0}%`, "orange"], ["Other", stats.total_grounds - stats.verified_grounds - stats.pending_grounds, "c-red", "0%", "red"]].map(([l, v, cls, w, pcls]) => (
                  <div className="pg-progress-row" key={l}>
                    <div className="pg-progress-row-top"><span className="pg-progress-row-label">{l}</span><span className={`pg-progress-row-label ${cls}`}>{v}</span></div>
                    <div className="pg-progress-bar"><div className={`pg-progress-fill ${pcls}`} style={{ width: w }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pg-card">
              <div className="pg-card-header"><div className="pg-card-title">User Registration</div></div>
              <div style={{ padding: "20px" }}>
                <div className="pg-booking-stat-label">Total Registered Users</div>
                <div className="pg-booking-stat-value" style={{ fontSize: 32 }}>{stats.total_users}</div>
                <div className="pg-metric-sub c-teal" style={{ marginTop: 8 }}>Platforms Growing Steadily</div>
              </div>
            </div>
          </div>
        </div>
      );
      case "grounds": return (
        <div>
          <div className="pg-page-tabs">
            {["pending", "verified", "rejected"].map(tab => (
              <button 
                key={tab}
                className={`pg-page-tab ${groundTab === tab ? "active" : ""}`}
                onClick={() => setGroundTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="pg-tab-count">
                  {tab === "pending" ? pendingGrounds.length : grounds.filter(g => g.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          <div className="pg-card">
            <div className="pg-toolbar">
              <div className="pg-search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder={`Search ${groundTab} grounds...`} 
                  value={searchGroundsQuery}
                  onChange={(e) => setSearchGroundsQuery(e.target.value)}
                />
              </div>
            </div>

            {groundTab === "pending" ? (
              pendingGrounds.filter(g => 
                g.name.toLowerCase().includes(searchGroundsQuery.toLowerCase()) || 
                (g.owner_name && g.owner_name.toLowerCase().includes(searchGroundsQuery.toLowerCase())) || 
                (g.owner_email && g.owner_email.toLowerCase().includes(searchGroundsQuery.toLowerCase()))
              ).length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No pending grounds to verify.</div>
              ) : (
                pendingGrounds
                  .filter(g => 
                    g.name.toLowerCase().includes(searchGroundsQuery.toLowerCase()) || 
                    (g.owner_name && g.owner_name.toLowerCase().includes(searchGroundsQuery.toLowerCase())) || 
                    (g.owner_email && g.owner_email.toLowerCase().includes(searchGroundsQuery.toLowerCase()))
                  )
                  .map(g => (
                    <div className="pg-ground-row" key={g.id} onClick={() => setSelectedGround(g)} style={{ cursor: "pointer" }}>
                      <div className="pg-ground-thumb">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="24" height="24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                      </div>
                      <div className="pg-ground-info">
                        <div className="pg-ground-name">{g.name}</div>
                        <div className="pg-ground-meta">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ display: "inline", verticalAlign: "middle", marginRight: 4, marginTop: -2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {g.location.city} · {g.location.address}
                        </div>
                        <div className="pg-ground-owner">
                          <strong>Owner:</strong> {g.owner_name} ({g.owner_email})
                          <div style={{ fontSize: 11, marginTop: 4 }}>
                            Sports: {g.courts?.map(c => c.sport_type).join(", ")} · Submitted: {new Date(g.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {rejectingId === g.id && (
                          <div style={{ marginTop: 12, animation: "toastIn 0.2s ease-out" }} onClick={(e) => e.stopPropagation()}>
                            <textarea 
                              className="pg-textarea" 
                              placeholder="Reason for rejection..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              autoFocus
                            />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <Btn variant="red" size="sm" onClick={() => handleVerify(g.id, "reject")}>Confirm Reject</Btn>
                              <Btn size="sm" onClick={() => { setRejectingId(null); setRejectionReason(""); }}>Cancel</Btn>
                            </div>
                          </div>
                        )}
                      </div>
                      {rejectingId !== g.id && (
                        <div className="pg-ground-actions">
                          <Badge variant="pending">Pending</Badge>
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <Btn variant="teal" size="sm" onClick={(e) => { e.stopPropagation(); handleVerify(g.id, "verify"); }}>Approve</Btn>
                            <Btn variant="red" size="sm" onClick={(e) => { e.stopPropagation(); setRejectingId(g.id); }}>Reject</Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )
            ) : (
              <div className="pg-table-wrap">
                <table className="pg-table">
                  <thead>
                    <tr>
                      <th>Ground</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grounds
                      .filter(g => g.status === groundTab)
                      .filter(g => 
                        g.name.toLowerCase().includes(searchGroundsQuery.toLowerCase()) || 
                        (g.location?.city && g.location.city.toLowerCase().includes(searchGroundsQuery.toLowerCase()))
                      )
                      .map(g => (
                        <tr key={g.id}>
                          <td><div className="td-name">{g.name}</div></td>
                          <td>{g.location?.city || "N/A"}</td>
                          <td><Badge variant={g.status === "verified" ? "verified" : "rejected"}>{g.status}</Badge></td>
                          <td><Btn size="sm" onClick={() => setSelectedGround(g)}>View Details</Btn></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {grounds
                  .filter(g => g.status === groundTab)
                  .filter(g => 
                    g.name.toLowerCase().includes(searchGroundsQuery.toLowerCase()) || 
                    (g.location?.city && g.location.city.toLowerCase().includes(searchGroundsQuery.toLowerCase()))
                  ).length === 0 && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No {groundTab} grounds found.</div>
                  )}
              </div>
            )}
          </div>
        </div>
      );
      case "disputes": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="pg-card">
            <div className="pg-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="pg-card-title">Disputes Feed</div>
              <span className="pg-badge pg-badge-orange" style={{ fontSize: 12, padding: "4px 10px" }}>
                {disputes.filter(d => d.status === "open").length} Active
              </span>
            </div>

            {disputes.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.5 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div style={{ fontSize: 16, fontWeight: 700 }}>All Quiet Here!</div>
                <div style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>No active disputes are pending user report reviews. Players can raise disputes on completed sessions.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {disputes.map(disp => (
                  <div key={disp.id} className="pg-dispute-card" style={{ padding: 24, borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{disp.ground_name}</span>
                          <span className="pg-badge" style={{ fontSize: 10, textTransform: "uppercase", background: "var(--teal-light)", color: "var(--teal)" }}>{disp.sport_type}</span>
                          {disp.status === "open" ? (
                            <span className="pg-badge" style={{ fontSize: 10, background: "var(--orange-light)", color: "var(--orange)" }}>PENDING REVIEW</span>
                          ) : (
                            <span className="pg-badge" style={{ fontSize: 10, background: "var(--green-light)", color: "var(--green)" }}>RESOLVED: {disp.resolution?.toUpperCase()}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                          Booking ID: <strong style={{ color: "var(--text-secondary)" }}>{disp.human_booking_id}</strong> • Raised on {new Date(disp.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ fontSize: 12, textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Player: {disp.player_name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{disp.player_email}</div>
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 20px", borderLeft: "4px solid var(--orange)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Reason: {disp.reason_category}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                        "{disp.description}"
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderTop: "1px dashed var(--border)", paddingTop: 16 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        <strong>Venue Owner:</strong> {disp.owner_name} ({disp.owner_email})
                      </div>

                      {disp.status === "open" && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {resolvingDisputeId === disp.id ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 260, background: "white", padding: 12, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                              <textarea
                                placeholder="Write resolution notes..."
                                value={adminNotes}
                                onChange={e => setAdminNotes(e.target.value)}
                                style={{ width: "100%", padding: 8, border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, resize: "none", height: 60 }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  className="pg-btn pg-btn-red sm"
                                  disabled={isResolving}
                                  onClick={() => handleResolveDispute(disp.id, "refunded")}
                                  style={{ flex: 1, padding: "6px", fontSize: 11, background: "var(--red)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                                >
                                  Refund Player
                                </button>
                                <button
                                  className="pg-btn pg-btn-teal sm"
                                  disabled={isResolving}
                                  onClick={() => handleResolveDispute(disp.id, "released")}
                                  style={{ flex: 1, padding: "6px", fontSize: 11, background: "var(--teal)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                                >
                                  Release Payout
                                </button>
                              </div>
                              <button
                                onClick={() => setResolvingDisputeId(null)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 10, cursor: "pointer", textDecoration: "underline", textAlign: "center", marginTop: 4 }}
                              >
                                Cancel Action
                              </button>
                            </div>
                          ) : (
                            <button
                              className="pg-btn pg-btn-outline sm"
                              onClick={() => setResolvingDisputeId(disp.id)}
                            >
                              Resolve Dispute
                            </button>
                          )}
                        </div>
                      )}

                      {disp.status === "resolved" && disp.admin_notes && (
                        <div style={{ fontSize: 12, background: "#f1f5f9", padding: "8px 14px", borderRadius: 8, width: "100%", marginTop: 4 }}>
                          <strong>Admin Notes:</strong> "{disp.admin_notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
      case "owners": return (
        <div className="pg-card">
          <div className="pg-toolbar">
            <div className="pg-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                placeholder="Search owners..." 
                value={searchOwnersQuery}
                onChange={(e) => setSearchOwnersQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="pg-table-wrap"><table className="pg-table">
            <thead><tr><th>Owner</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {owners
                .filter(o => 
                  o.name.toLowerCase().includes(searchOwnersQuery.toLowerCase()) || 
                  o.email.toLowerCase().includes(searchOwnersQuery.toLowerCase())
                )
                .map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className="pg-user-row">
                        <div className="pg-mini-avatar" style={{ background: o.avatar_color || "var(--teal)" }}>{o.name[0]?.toUpperCase()}</div>
                        <div className="td-name">{o.name}</div>
                      </div>
                    </td>
                    <td>{o.email}</td>
                    <td>{o.role}</td>
                    <td><Badge variant="verified">Active</Badge></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <Btn size="sm" onClick={() => setSelectedUser(o)}>View</Btn>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table></div>
          {owners.filter(o => 
            o.name.toLowerCase().includes(searchOwnersQuery.toLowerCase()) || 
            o.email.toLowerCase().includes(searchOwnersQuery.toLowerCase())
          ).length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No owners found.</div>
          )}
        </div>
      );
      case "users": return (
        <div className="pg-card">
          <div className="pg-toolbar">
            <div className="pg-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                placeholder="Search users..." 
                value={searchUsersQuery}
                onChange={(e) => setSearchUsersQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="pg-table-wrap"><table className="pg-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users
                .filter(u => 
                  u.name.toLowerCase().includes(searchUsersQuery.toLowerCase()) || 
                  u.email.toLowerCase().includes(searchUsersQuery.toLowerCase())
                )
                .map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="pg-user-row">
                        <div className="pg-mini-avatar" style={{ background: u.avatar_color || "var(--purple)" }}>{u.name[0]?.toUpperCase()}</div>
                        <div className="td-name">{u.name}</div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td><Badge variant="verified">Active</Badge></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <Btn size="sm" onClick={() => setSelectedUser(u)}>View</Btn>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table></div>
          {users.filter(u => 
            u.name.toLowerCase().includes(searchUsersQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchUsersQuery.toLowerCase())
          ).length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No users found.</div>
          )}
        </div>
      );
      case "bookings": return (
        <div className="pg-card">
          <div className="pg-toolbar">
            <div className="pg-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                placeholder="Search bookings..." 
                value={searchBookingsQuery}
                onChange={(e) => setSearchBookingsQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="pg-table-wrap"><table className="pg-table">
            <thead><tr><th>Booking ID</th><th>User</th><th>Ground</th><th>Slot</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {allBookings
                .filter(b => 
                  b.id.toLowerCase().includes(searchBookingsQuery.toLowerCase()) ||
                  (b.user_name && b.user_name.toLowerCase().includes(searchBookingsQuery.toLowerCase())) ||
                  (b.ground_name && b.ground_name.toLowerCase().includes(searchBookingsQuery.toLowerCase()))
                )
                .map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--teal)" }}>{b.id}</span></td>
                    <td>{b.user_name}</td>
                    <td>{b.ground_name}</td>
                    <td>
                      {b.start_time ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{format(new Date(b.start_time), "MMM d, yyyy")}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            {b.end_time 
                              ? `${format(new Date(b.start_time), "hh:mm a")} - ${format(new Date(b.end_time), "hh:mm a")}`
                              : `${format(new Date(b.start_time), "hh:mm a")} onwards`}
                          </div>
                        </>
                      ) : "N/A"}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{b.total_price}</td>
                    <td><Badge variant="verified">{b.status}</Badge></td>
                  </tr>
                ))}
            </tbody>
          </table></div>
          {allBookings.filter(b => 
            b.id.toLowerCase().includes(searchBookingsQuery.toLowerCase()) ||
            (b.user_name && b.user_name.toLowerCase().includes(searchBookingsQuery.toLowerCase())) ||
            (b.ground_name && b.ground_name.toLowerCase().includes(searchBookingsQuery.toLowerCase()))
          ).length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No bookings found.</div>
          )}
        </div>
      );
      case "settings": return (
        <div className="pg-card" style={{ maxWidth: 600 }}>
          <div className="pg-card-header"><div className="pg-card-title">Platform Settings</div></div>
          <div className="pg-settings-wrap">
            <div>
              <div className="pg-setting-label">AUTO-APPROVE IF ALL CHECKS PASS</div>
              <div className="pg-switch-row">
                <button className="pg-switch" style={{ background: "#e0e0e0" }}>
                  <div className="pg-switch-thumb" style={{ left: 3 }} />
                </button>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Grounds with all automated checks passing are auto-verified</span>
              </div>
            </div>
            <div className="pg-divider" />
            <div>
              <div className="pg-setting-label">VIDEO CALL THRESHOLD (₹)</div>
              <input type="number" defaultValue="2000" className="pg-input" style={{ width: "100%", maxWidth: "160px", padding: "10px 14px" }} />
              <div className="pg-setting-hint" style={{ marginTop: 8 }}>Grounds priced above this require a live video call verification</div>
            </div>
            <div className="pg-divider" />
            <div>
              <div className="pg-setting-label">AUTO-SUSPEND AFTER N COMPLAINTS</div>
              <input type="number" defaultValue="3" className="pg-input" style={{ width: "100%", maxWidth: "100px", padding: "10px 14px" }} />
            </div>
            <div className="pg-divider" />
            <div>
              <div className="pg-setting-label">RE-VERIFICATION INTERVAL</div>
              <select className="pg-select" defaultValue="Every 6 months" style={{ width: "100%", maxWidth: "200px", padding: "10px 14px" }}>
                <option>Every 3 months</option>
                <option>Every 6 months</option>
                <option>Every year</option>
              </select>
            </div>
            <div style={{ marginTop: 8 }}><Btn variant="teal" style={{ padding: "12px 28px", borderRadius: "10px" }}>Save Settings</Btn></div>
          </div>
        </div>
      );
      default: return <div>Coming Soon...</div>;
    }
  };

  const handleVerify = async (id, action) => {
    const token = localStorage.getItem("token");
    const headers = { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      const url = `/api/admin/grounds/${id}/${action}`;
      const body = action === "reject" ? JSON.stringify({ reason: rejectionReason }) : null;
      
      const res = await fetch(url, { 
        method: "PATCH", 
        headers,
        body
      });

      if (res.ok) {
        // Optimistic update
        setPendingGrounds(prev => prev.filter(g => g.id !== id));
        setToast(`Ground successfully ${action === "verify" ? "verified" : "rejected"}!`);
        setRejectingId(null);
        setRejectionReason("");
        
        // Refresh full list in background
        const groundsRes = await fetch("/api/grounds/all", { headers });
        if (groundsRes.ok) setGrounds(await groundsRes.json());
      } else {
        setToast("Failed to update ground status.");
      }
    } catch (err) {
      console.error(err);
      setToast("An error occurred.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/admin/login");
  };

  if (isLoading) return <div style={{ padding: 40, textAlign: "center", fontFamily: "Plus Jakarta Sans", color: "#1abc9c", fontWeight: 700 }}>Initializing Secure Console...</div>;

  if (!adminData) return null;

  return (
    <>
      <style>{css}</style>
      {toast && <div className="pg-toast">{toast}</div>}
      <div className="pg-body">
        <aside className="pg-sidebar">
          <div className="pg-logo-wrap">
            <div className="pg-logo-row">
              <div className="pg-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="20" height="20"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
              <div className="pg-logo-name">Play<span>Ground</span></div>
            </div>
            <span className="pg-admin-tag">ADMIN PANEL</span>
          </div>
          <nav className="pg-nav">
            {NAV.map(({ section, items }) => (
              <div key={section}>
                <div className="pg-nav-section">{section}</div>
                {items.map(item => (
                  <button key={item.id} className={`pg-nav-item${activePage === item.id ? " active" : ""}`} onClick={() => setActivePage(item.id)}>
                    {item.icon}{item.label}
                    {item.dot && activePage === item.id && <span className="pg-nav-dot" />}
                    {(item.id === "grounds" && stats.pending_grounds > 0) && <span className="pg-badge-count">{stats.pending_grounds}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="pg-sidebar-bottom">
            <div className="pg-user-chip">
              <div className="pg-avatar">{adminData.name[0]}</div>
              <div><div className="pg-user-name">{adminData.name}</div><div className="pg-user-role">{adminData.role}</div></div>
            </div>
            <button 
              onClick={handleLogout}
              className="pg-nav-item" 
              style={{ marginTop: 8, color: "var(--red)", border: "1px solid var(--red-light)", background: "var(--red-light)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        <main className="pg-main">
          <div className="pg-topbar">
            <div><div className="pg-page-name">{PAGE_NAMES[activePage]}</div><div className="pg-breadcrumb">Admin Panel › {PAGE_NAMES[activePage]}</div></div>
            <div className="pg-topbar-right">
              <div className="pg-notif-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div>
              <div className="pg-admin-chip">{adminData.name}</div>
            </div>
          </div>
          <div className="pg-content">
            {isLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading platform data...</div>
            ) : adminData.role?.toLowerCase() !== "admin" ? (
              <div style={{ padding: "80px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Access Denied</h2>
                <p style={{ color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto" }}>
                  This section is reserved for platform administrators only. 
                  Your current account ({adminData.email}) does not have the necessary permissions.
                </p>
              </div>
            ) : renderSection()}
          </div>
        </main>
        {selectedGround && (() => {
          const owner = owners.find(o => String(o.id) === String(selectedGround.owner_id));
          const ownerName = selectedGround.owner_name || owner?.name || "Unknown Owner";
          const ownerEmail = selectedGround.owner_email || owner?.email || "No Email";
          return (
            <div className="pg-modal-overlay" onClick={() => setSelectedGround(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
              <div className="pg-modal" onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "640px", maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                
                {/* Header */}
                <div className="pg-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <h2 className="pg-modal-title" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Verify Ground: {selectedGround.name}</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Review venue details and legal documents</p>
                  </div>
                  <button className="pg-modal-close" onClick={() => setSelectedGround(null)} style={{ border: "1.5px solid var(--border)", background: "white", borderRadius: 10, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><X size={16} /></button>
                </div>

                {/* Scrollable Body */}
                <div className="pg-modal-body" style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
                  
                  {/* Images Gallery */}
                  {selectedGround.images && selectedGround.images.length > 0 && (
                    <div>
                      <p className="pg-section-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Venue Photos</p>
                      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                        {selectedGround.images.map((img, idx) => {
                          const src = img.startsWith('http') || img.startsWith('data:') ? img : `${img}`;
                          return (
                            <div key={idx} style={{ width: 140, height: 90, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border)" }}>
                              <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Ground" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ground General Details */}
                  <div style={{ background: "#f8fafc", borderRadius: 18, padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Location Address</span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                        {selectedGround.location?.address || "N/A"}<br />
                        {selectedGround.location?.city || "N/A"}{selectedGround.location?.pincode ? ` - ${selectedGround.location.pincode}` : ""}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Owner Contact</span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                        {ownerName}<br />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{ownerEmail}</span>
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Surface & Type</span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                        {selectedGround.surface_type || "Standard"} · {selectedGround.is_indoor ? "Indoor Arena" : "Outdoor Field"}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</span>
                      <div style={{ marginTop: 2 }}>
                        <Badge variant={selectedGround.status}>{selectedGround.status?.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Courts list */}
                  {selectedGround.courts && selectedGround.courts.length > 0 && (
                    <div>
                      <p className="pg-section-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Courts & Pricing</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selectedGround.courts.map((court, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid var(--border)" }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{court.name}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teal)", background: "var(--teal-light)", padding: "2px 8px", borderRadius: 20, marginLeft: 8 }}>{court.sport_type?.toUpperCase()}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>₹{court.base_price}/hr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal Documents Verification Checklist */}
                  <div>
                    <p className="pg-section-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Legal Verification Documents</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { name: "Property Proof Documents", key: "property_proof", desc: "Proof of venue ownership or lease agreement" },
                        { name: "Government Authorized ID", key: "gov_id", desc: "Owner ID card, passport or trade license" },
                        { name: "Municipal NOC / Permission", key: "municipal_permission", desc: "No Objection Certificate from local government" },
                        { name: "Bank Account Details", key: "bank_details", desc: "Cheque copy or bank statement for payouts" }
                      ].map(doc => {
                        const fileLink = selectedGround.verification_docs?.[doc.key];
                        return (
                          <div key={doc.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{doc.name}</p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{doc.desc}</p>
                            </div>
                            <div>
                              {fileLink ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", background: "var(--green-light)", padding: "3px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 3 }}><Check size={10} /> UPLOADED</span>
                                  <button 
                                    onClick={() => {
                                      if (fileLink.startsWith("data:")) {
                                        try {
                                          const parts = fileLink.split(",");
                                          const mime = parts[0].match(/:(.*?);/)[1];
                                          const bstr = atob(parts[1]);
                                          let n = bstr.length;
                                          const u8arr = new Uint8Array(n);
                                          while (n--) {
                                            u8arr[n] = bstr.charCodeAt(n);
                                          }
                                          const blob = new Blob([u8arr], { type: mime });
                                          const blobUrl = URL.createObjectURL(blob);
                                          window.open(blobUrl, "_blank");
                                        } catch (err) {
                                          console.error("Blob conversion failed, using fallback iframe:", err);
                                          const w = window.open();
                                          if (w) w.document.write(`<iframe src="${fileLink}" style="border:0;width:100%;height:100%"></iframe>`);
                                        }
                                      } else {
                                        const url = fileLink.startsWith("http") ? fileLink : `${fileLink}`;
                                        window.open(url, "_blank");
                                      }
                                    }}
                                    className="pg-btn pg-btn-outline sm"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                                  >
                                    <ExternalLink size={12} /> View File
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "#f1f5f9", padding: "3px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 3 }}><X size={10} /> MISSING</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inline Rejection box inside Modal */}
                  {rejectingId === selectedGround.id && (
                    <div style={{ animation: "toastIn 0.2s ease-out", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", marginBottom: 8 }}>Provide Rejection Reason</p>
                      <textarea 
                        className="pg-textarea" 
                        placeholder="Reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Btn variant="red" size="sm" onClick={async () => {
                          await handleVerify(selectedGround.id, "reject");
                          setSelectedGround(null);
                        }}>Confirm Reject</Btn>
                        <Btn size="sm" onClick={() => { setRejectingId(null); setRejectionReason(""); }}>Cancel</Btn>
                      </div>
                    </div>
                  )}

                </div>

                {/* Action Footer */}
                {selectedGround.status === "pending" && rejectingId !== selectedGround.id && (
                  <div className="pg-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--border)", background: "#fafefe" }}>
                    <Btn variant="red" onClick={() => setRejectingId(selectedGround.id)}>Reject Ground</Btn>
                    <Btn variant="teal" onClick={async () => {
                      await handleVerify(selectedGround.id, "verify");
                      setSelectedGround(null);
                    }}>Approve & Verify</Btn>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
        {selectedUser && (() => {
          const isOwner = selectedUser.role === "owner";
          const userGrounds = isOwner ? grounds.filter(g => String(g.owner_id) === String(selectedUser.id)) : [];
          const userBookings = !isOwner ? allBookings.filter(b => String(b.user_id) === String(selectedUser.id) || b.user_email === selectedUser.email) : [];
          
          return (
            <div className="pg-modal-overlay" onClick={() => setSelectedUser(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
              <div className="pg-modal" onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "640px", maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                
                {/* Header */}
                <div className="pg-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <h2 className="pg-modal-title" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{isOwner ? "Owner Details" : "User Details"}: {selectedUser.name}</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Review registered member profile and system data</p>
                  </div>
                  <button className="pg-modal-close" onClick={() => setSelectedUser(null)} style={{ border: "1.5px solid var(--border)", background: "white", borderRadius: 10, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><X size={16} /></button>
                </div>

                {/* Scrollable Body */}
                <div className="pg-modal-body" style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
                  
                  {/* Avatar & General Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: selectedUser.avatar_color || (isOwner ? "var(--teal)" : "var(--purple)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white" }}>
                      {selectedUser.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{selectedUser.name}</h3>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{selectedUser.email}</p>
                      <span className="pg-badge pg-badge-verified" style={{ background: isOwner ? "var(--teal-light)" : "var(--purple-light)", color: isOwner ? "var(--teal-dark)" : "var(--purple)", marginTop: 6, display: "inline-block" }}>
                        {selectedUser.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Profile Details Cards */}
                  <div style={{ background: "#f8fafc", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Member Since</span>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Bio / Notes</span>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5, fontStyle: selectedUser.bio ? "normal" : "italic" }}>
                        {selectedUser.bio || "No biography provided by the user."}
                      </p>
                    </div>
                  </div>

                  {/* Specific Listing lists (Grounds for Owners, Bookings for Users) */}
                  {isOwner ? (
                    <div>
                      <p className="pg-section-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Registered Grounds ({userGrounds.length})</p>
                      {userGrounds.length === 0 ? (
                        <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>This owner has not registered any venues yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {userGrounds.map(ground => (
                            <div key={ground.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{ground.name}</p>
                                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{ground.location?.city} · {ground.location?.address}</p>
                              </div>
                              <Badge variant={ground.status}>{ground.status?.toUpperCase()}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="pg-section-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Booking History ({userBookings.length})</p>
                      {userBookings.length === 0 ? (
                        <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>This user has not placed any bookings yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {userBookings.map(booking => (
                            <div key={booking.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{booking.ground_name}</p>
                                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Slot: {booking.slot} · Paid: ₹{booking.amount}</p>
                              </div>
                              <Badge variant={booking.status === "confirmed" || booking.status === "active" ? "verified" : "rejected"}>
                                {booking.status?.toUpperCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div className="pg-modal-footer" style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid var(--border)", background: "#fafefe" }}>
                  <Btn variant="teal" onClick={() => setSelectedUser(null)}>Close Window</Btn>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
