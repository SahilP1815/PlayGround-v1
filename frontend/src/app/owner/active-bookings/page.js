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
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OwnerSidebar from "@/components/OwnerSidebar";
import "../owner.css";

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email || "";
  const [local, domain] = email.split("@");
  const masked = local.charAt(0) + "****";
  return `${masked}@${domain}`;
};

export default function ActiveBookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/bookings/owner", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          // Filter for only future/ongoing bookings
          const active = data.filter(b => new Date(b.start_time) > now);
          setBookings(active);
        }
      } catch (err) {
        console.error("Error fetching active bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveBookings();
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.booking_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pg-body">
      <OwnerSidebar />
      
      <main className="pg-main">
        <div className="pg-topbar">
          <div className="pg-breadcrumb">Owner Panel › <span>Active Bookings</span></div>
          <div className="pg-topbar-right">
            <div className="pg-status-chip"><div className="pg-pulse" /> Upcoming Events</div>
          </div>
        </div>

        <div className="pg-container">
          <div className="pg-page-header">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Upcoming Reservations</h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Currently viewing only future and upcoming bookings.</p>
            </div>
            
            <div className="pg-header-actions" style={{ display: "flex", gap: 12 }}>
              <div className="pg-search-wrapper" style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="text" 
                  placeholder="Search active..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pg-search-input"
                  style={{ padding: "12px 16px 12px 40px", borderRadius: 12, border: "1.5px solid var(--border)", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>
          </div>

          <div className="pg-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>ID</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Customer</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date & Slot</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => setSelectedBooking(booking)}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{booking.booking_id}</span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--teal-light)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                            {booking.customer_name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{booking.customer_name}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{format(new Date(booking.start_time), "MMM d, yyyy")}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{format(new Date(booking.start_time), "hh:mm a")}</p>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "var(--teal-light)", color: "var(--teal)" }}>
                          UPCOMING
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}><ExternalLink size={16} color="var(--text-muted)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && !isLoading && (
              <div style={{ padding: 80, textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ marginBottom: 16 }}><AlertCircle size={48} style={{ margin: "0 auto", opacity: 0.3 }} /></div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No Active Bookings</h3>
                <p>There are no upcoming reservations scheduled at the moment.</p>
              </div>
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
                  <h2 className="pg-section-title">Active Booking Details</h2>
                  <button onClick={() => setSelectedBooking(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <DetailRow icon={<User size={16} />} label="Customer" value={selectedBooking.customer_name} subValue={maskEmail(selectedBooking.customer_email)} />
                  <ClockRow icon={<Clock size={16} />} label="Remaining Time" startTime={selectedBooking.start_time} />
                  <DetailRow icon={<Calendar size={16} />} label="Venue" value={selectedBooking.ground_name} subValue={selectedBooking.court_name} />
                </div>

                <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
                  <button onClick={() => setSelectedBooking(null)} className="pg-btn pg-btn-outline" style={{ flex: 1 }}>Close</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
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

function ClockRow({ icon, label, startTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(startTime) - new Date();
      if (diff < 0) {
        setTimeLeft("Ongoing or Starting now");
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${hours}h ${mins}m until start`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)" }}>{icon}</div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>{timeLeft}</p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Starts at {format(new Date(startTime), "hh:mm a")}</p>
      </div>
    </div>
  );
}
