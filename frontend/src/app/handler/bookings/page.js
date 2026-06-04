"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Check, 
  X, 
  IndianRupee, 
  Clock, 
  User, 
  Building2,
  Mail,
  MoreVertical
} from "lucide-react";
import HandlerSidebar from "@/components/HandlerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import "../../owner/owner.css";

// Helper to mask customer email for privacy
const maskEmail = (email) => {
  if (!email || email === "N/A") return "N/A";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}****${local[local.length - 1]}@${domain}`;
};

export default function HandlerBookings() {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [bookings, setBookings] = useState([]);
  const [handlerInfo, setHandlerInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // We can fetch from handler dashboard which yields enriched bookings and handler info
      const res = await fetch("/api/handler/dashboard/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load bookings");
      const d = await res.json();
      setBookings(d.bookings || []);
      setHandlerInfo(d.handler || {});
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    if (!handlerInfo.can_confirm_bookings) {
      showToast("You do not have permission to confirm bookings.", "error");
      return;
    }
    
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
      fetchBookings();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!handlerInfo.can_cancel_bookings) {
      showToast("You do not have permission to cancel bookings.", "error");
      return;
    }

    const reason = window.prompt("Please enter cancellation reason:");
    if (reason === null) return;
    
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
      fetchBookings();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Get unique venues for filter dropdown
  const uniqueVenues = Array.from(new Set(bookings.map(b => b.ground_name)));

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesVenue = venueFilter === "all" || b.ground_name === venueFilter;
    
    return matchesSearch && matchesStatus && matchesVenue;
  });

  return (
    <ProtectedRoute role="handler">
      <div className="pg-body">
        <HandlerSidebar />
        
        <main className="pg-main">
          {/* Top Bar */}
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Handler Panel › <span>Bookings</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip">
                <div className="pg-pulse" /> Managing {filteredBookings.length} Booking{filteredBookings.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="pg-container">
            {/* Page Header */}
            <div className="pg-page-header">
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Bookings Management</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
                  Manage reservations, confirm pending slot requests, and process cancellations for your venues.
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="pg-card flex flex-col md:flex-row gap-4 mb-6 items-center" style={{ padding: "20px 24px" }}>
              
              {/* Search */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or Booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Venue Filter */}
              <div className="w-full md:w-56">
                <select
                  value={venueFilter}
                  onChange={(e) => setVenueFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Venues</option>
                  {uniqueVenues.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Bookings Table / List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="pg-card" style={{ textAlign: "center", padding: "80px 20px", borderStyle: "dashed" }}>
                <div style={{ color: "var(--text-muted)", marginBottom: 16 }}><Calendar size={48} /></div>
                <h3 className="pg-section-title">No Bookings Found</h3>
                <p className="pg-section-desc">There are no bookings matching the selected filters or search terms.</p>
              </div>
            ) : (
              <div className="pg-card overflow-hidden" style={{ padding: 0 }}>
                {/* Horizontal Scroll wrapper for responsive tables */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Booking ID</th>
                        <th className="px-6 py-4">Venue & Court</th>
                        <th className="px-6 py-4">Customer Details</th>
                        <th className="px-6 py-4">Timing</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-gray-900">{booking.booking_id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800">{booking.ground_name}</span>
                              <span className="text-[10px] text-gray-400 capitalize">{booking.court_name} • {booking.sport_type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-700">{booking.customer_name}</span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Mail size={10} /> {maskEmail(booking.customer_email)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="font-medium text-gray-600">
                              {new Date(booking.start_time).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-teal-600">₹{booking.total_price}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                              booking.status === "confirmed" ? "bg-green-50 text-green-700 border border-green-200" :
                              booking.status === "pending" || booking.status === "initiated" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                              "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {booking.status}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
