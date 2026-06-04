"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Check, 
  X, 
  ShieldAlert,
  MapPin,
  TrendingUp
} from "lucide-react";
import HandlerSidebar from "@/components/HandlerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import "../../owner/owner.css";

export default function HandlerDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/handler/dashboard/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const d = await res.json();
      setData(d);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to confirm booking");
      }
      showToast("Booking confirmed successfully!", "success");
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Please enter cancellation reason:");
    if (reason === null) return; // cancelled prompt
    
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to cancel booking");
      }
      showToast("Booking cancelled successfully!", "success");
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const recentBookings = data?.bookings?.slice(0, 5) || [];
  const handler = data?.handler || {};
  const venues = data?.venues || [];
  const summary = data?.analytics?.summary || {};

  return (
    <ProtectedRoute role="handler">
      <div className="pg-body">
        <HandlerSidebar />
        
        <main className="pg-main">
          {/* Top Bar */}
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Handler Panel › <span>Dashboard</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip">
                <div className="pg-pulse" /> Managing {venues.length} Venue{venues.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="pg-container">
            {/* Header */}
            <div className="pg-page-header">
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                  Welcome Back, {handler.name || "Manager"}!
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
                  Role: <span className="capitalize font-bold text-primary">{handler.role}</span> | Managing assigned grounds.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="pg-card" style={{ padding: 24 }}>
                    <div style={{ color: "var(--teal)", marginBottom: 12 }}><Building2 size={28} /></div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>My Venues</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{venues.length.toString().padStart(2, '0')}</p>
                  </div>
                  
                  <div className="pg-card" style={{ padding: 24 }}>
                    <div style={{ color: "var(--purple)", marginBottom: 12 }}><Calendar size={28} /></div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Bookings</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{summary.total_bookings || 0}</p>
                  </div>

                  <div className="pg-card" style={{ padding: 24 }}>
                    <div style={{ color: "var(--primary)", marginBottom: 12 }}><IndianRupee size={28} /></div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Monthly Revenue</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                      {handler.can_view_analytics ? `₹${summary.total_revenue || 0}` : "••••••"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Recent Bookings */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="pg-card" style={{ padding: 24 }}>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-6 flex justify-between items-center">
                        <span>Recent Bookings</span>
                        <a href="/handler/bookings" className="text-xs text-primary hover:underline">View All</a>
                      </h2>

                      {recentBookings.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          No recent bookings found.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentBookings.map(booking => (
                            <div key={booking.id} className="p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-800 text-sm">{booking.ground_name}</span>
                                  <span className="text-[10px] text-gray-400">({booking.court_name})</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Player: <b>{booking.customer_name}</b> | {booking.customer_email}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Slot: {new Date(booking.start_time).toLocaleString()}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                                  booking.status === "pending" || booking.status === "initiated" ? "bg-orange-100 text-orange-700" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {booking.status}
                                </span>

                                {/* Actions Removed */}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Venue List & Permissions */}
                  <div className="space-y-6">
                    {/* Venues */}
                    <div className="pg-card" style={{ padding: 24 }}>
                      <h2 className="text-base font-extrabold text-gray-800 mb-4">My Assigned Venues</h2>
                      <div className="space-y-3">
                        {venues.map(v => (
                          <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{v.name}</span>
                            </div>
                            <span className="text-[10px] bg-teal-50 text-teal-600 font-bold px-2 py-0.5 rounded-full uppercase">
                              {v.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Permissions Alert */}
                    <div className="pg-card bg-purple-50/50 border border-purple-100" style={{ padding: 24 }}>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-3 flex items-center gap-1.5">
                        <ShieldAlert size={14} /> My Permissions
                      </h2>
                      <ul className="text-xs text-purple-950/70 space-y-2 font-medium">

                        <li className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${handler.can_view_analytics ? "bg-green-500" : "bg-red-500"}`} />
                          Access to Analytics: {handler.can_view_analytics ? "Yes" : "No"}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${handler.can_manage_pricing ? "bg-green-500" : "bg-red-500"}`} />
                          Manage Pricing: {handler.can_manage_pricing ? "Yes" : "No"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
