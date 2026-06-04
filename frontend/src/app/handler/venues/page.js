"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Layers, 
  Users, 
  IndianRupee,
  Activity,
  Compass
} from "lucide-react";
import Link from "next/link";
import HandlerSidebar from "@/components/HandlerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import "../../owner/owner.css";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return `${img}`;
};

export default function HandlerVenues() {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [venues, setVenues] = useState([]);
  const [handlerInfo, setHandlerInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchVenues();
    }
  }, [token]);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/handler/dashboard/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load assigned venues");
      const d = await res.json();
      setVenues(d.venues || []);
      setHandlerInfo(d.handler || {});
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute role="handler">
      <div className="pg-body">
        <HandlerSidebar />
        
        <main className="pg-main">
          {/* Top Bar */}
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Handler Panel › <span>Assigned Venues</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip">
                <div className="pg-pulse" /> Active Assignment
              </div>
            </div>
          </div>

          <div className="pg-container">
            {/* Header */}
            <div className="pg-page-header">
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>My Assigned Venues</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
                  View information, court configurations, and booking metrics of the grounds assigned to you.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : venues.length === 0 ? (
              <div className="pg-card" style={{ textAlign: "center", padding: "80px 20px", borderStyle: "dashed" }}>
                <div style={{ color: "var(--text-muted)", marginBottom: 16 }}><Building2 size={48} /></div>
                <h3 className="pg-section-title">No Venues Assigned</h3>
                <p className="pg-section-desc">You are currently not assigned to manage any grounds. Please contact your venue owner to assign you.</p>
              </div>
            ) : (
              <div className="pg-grid pg-grounds-grid">
                {venues.map((venue) => (
                  <div key={venue.id} className="pg-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ position: "relative", height: 200, backgroundColor: "#0f172a", overflow: "hidden" }}>
                      <img 
                        src={venue.images?.[0]
                          ? getImageUrl(venue.images[0])
                          : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60"} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 20 }}>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm bg-teal-500 text-white`}>
                          {venue.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{venue.name}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                        <MapPin size={12} /> {venue.location?.city || venue.location?.address || "Address N/A"}
                      </p>
                      
                      <div className="pg-ground-stats-row mb-6">
                        <div style={{ textAlign: "center" }}>
                          <p className="pg-ground-stat-label">Courts</p>
                          <p className="pg-ground-stat-val">{venue.courts?.length || 0}</p>
                        </div>
                        <div style={{ textAlign: "center", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                          <p className="pg-ground-stat-label">Bookings</p>
                          <p className="pg-ground-stat-val">{venue.bookings_count || 0}</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p className="pg-ground-stat-label">Location Type</p>
                          <p className="pg-ground-stat-val text-[11px] font-bold text-gray-500">
                            {venue.courts?.[0]?.is_indoor ? "Indoor" : "Outdoor"}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Courts List</h4>
                        <div className="space-y-3">
                          {venue.courts?.map((court, idx) => (
                            <div key={court.id || idx} className="flex justify-between items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                              <div>
                                <p className="text-xs font-bold text-gray-800">{court.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium capitalize">
                                  {court.sport_type} • {court.surface_type || "Standard"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-extrabold text-teal-600">₹{court.base_price}/hr</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">
                                  Max: {court.max_players} Players
                                </p>
                              </div>
                            </div>
                          ))}
                          {(!venue.courts || venue.courts.length === 0) && (
                            <p className="text-xs text-gray-400 italic">No courts added to this venue yet.</p>
                          )}
                        </div>
                      </div>

                      {(handlerInfo.can_edit_venue_details || handlerInfo.can_manage_pricing || handlerInfo.can_add_time_slots) && (
                        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <Link 
                            href={`/handler/venues/edit/${venue.id}`}
                            className="flex-1 pg-ground-card-btn bg-teal-50 border border-teal-100 rounded-2xl text-base font-extrabold text-teal-600 text-center hover:bg-teal-100 smooth-transition shadow-sm"
                            style={{ textDecoration: "none", display: "block", padding: "12px 0" }}
                          >
                            Edit Slots & Pricing
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
