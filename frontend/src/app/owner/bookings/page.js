"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  CreditCard, 
  X,
  ExternalLink,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import "../owner.css";

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email || "";
  const [local, domain] = email.split("@");
  const masked = local.charAt(0) + "****";
  return `${masked}@${domain}`;
};

export default function OwnerBookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/bookings/owner", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (err) {
        console.error("Error fetching owner bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOwnerBookings();
  }, []);

  const now = new Date();
  const filteredBookings = bookings
    .filter(b => {
      const matchSearch = b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.booking_id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      
      const startTime = new Date(b.start_time);
      if (activeTab === "upcoming") {
        return startTime > now;
      } else {
        return startTime <= now;
      }
    })
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  return (
    <ProtectedRoute role="owner">
      <div className="pg-body">
        <OwnerSidebar />
      
      <main className="pg-main">
        <div className="pg-topbar">
          <div className="pg-breadcrumb">Owner Panel › <span>Bookings</span></div>
          <div className="pg-topbar-right">
            <div className="pg-status-chip"><div className="pg-pulse" /> Live Bookings</div>
          </div>
        </div>

        <div className="pg-container">
          <div className="pg-page-header">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Ground Bookings</h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Track and manage all reservations across your venues.</p>
            </div>
            
            <div className="pg-header-actions" style={{ display: "flex", gap: 12 }}>
              <div className="pg-search-wrapper" style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="text" 
                  placeholder="Search bookings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pg-search-input"
                  style={{ padding: "12px 16px 12px 40px", borderRadius: 12, border: "1.5px solid var(--border)", fontSize: 14, outline: "none" }}
                />
              </div>
              <button className="pg-btn pg-btn-outline" style={{ padding: 12 }}><Filter size={18} /></button>
            </div>
          </div>

          <div style={{ display: "flex", background: "#f1f5f9", padding: "6px", borderRadius: "14px", border: "1.5px solid var(--border)", marginBottom: "24px", width: "fit-content" }}>
            <button
              onClick={() => setActiveTab("upcoming")}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: activeTab === "upcoming" ? "white" : "transparent",
                color: activeTab === "upcoming" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: activeTab === "upcoming" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              Upcoming Bookings
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: activeTab === "history" ? "white" : "transparent",
                color: activeTab === "history" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: activeTab === "history" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              Booking History
            </button>
          </div>

          <div className="pg-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>ID</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Customer</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date & Slot</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Amount</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}></th>
                  </tr>
                </thead>
                <tbody style={{ divideY: "1px solid var(--border)" }}>
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{booking.booking_id}</span>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{format(new Date(booking.created_at), "MMM d")}</p>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--teal-light)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                            {booking.customer_name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{booking.customer_name}</p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{maskEmail(booking.customer_email)}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{format(new Date(booking.start_time), "MMM d, yyyy")}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {booking.end_time 
                            ? `${format(new Date(booking.start_time), "hh:mm a")} - ${format(new Date(booking.end_time), "hh:mm a")}`
                            : `${format(new Date(booking.start_time), "hh:mm a")} onwards`}
                        </p>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>₹{booking.total_price}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: booking.status === 'confirmed' ? "var(--green-light)" : "var(--orange-light)", color: booking.status === 'confirmed' ? "var(--green)" : "var(--orange)" }}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}><ExternalLink size={16} color="var(--text-muted)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && !isLoading && (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No bookings found</div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBooking(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 200 }} />
            <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none" }}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", pointerEvents: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                  <h2 className="pg-section-title">Booking Details</h2>
                  <button onClick={() => setSelectedBooking(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <DetailRow icon={<User size={16} />} label="Customer" value={selectedBooking.customer_name} subValue={maskEmail(selectedBooking.customer_email)} />
                  <DetailRow 
                    icon={<Clock size={16} />} 
                    label="Time Slot" 
                    value={format(new Date(selectedBooking.start_time), "EEEE, MMM d, yyyy")} 
                    subValue={
                      selectedBooking.end_time 
                        ? `${format(new Date(selectedBooking.start_time), "hh:mm a")} - ${format(new Date(selectedBooking.end_time), "hh:mm a")}`
                        : `${format(new Date(selectedBooking.start_time), "hh:mm a")} onwards`
                    } 
                  />
                  <DetailRow icon={<CreditCard size={16} />} label="Payment" value={`₹${selectedBooking.total_price}`} subValue={selectedBooking.status.toUpperCase()} />
                  <DetailRow icon={<Calendar size={16} />} label="Venue" value={selectedBooking.ground_name} subValue={selectedBooking.court_name} />
                </div>

                <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
                  <button className="pg-btn pg-btn-outline" style={{ flex: 1 }}>Print Ticket</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
    </ProtectedRoute>
  );
}

function DetailRow({ icon, label, value, subValue }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>{icon}</div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{value}</p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{subValue}</p>
      </div>
    </div>
  );
}

