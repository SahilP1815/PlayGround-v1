"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Users,
  IndianRupee,
  AlertTriangle,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return `${img}`;
};
import { useAuth } from "@/context/AuthContext";
import "../owner.css";

export default function MyGrounds() {
  const router = useRouter();
  const { token } = useAuth();
  const [grounds, setGrounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, groundId: null, groundName: "" });
  const [verticalGrounds, setVerticalGrounds] = useState({});

  useEffect(() => {
    const fetchMyGrounds = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetch("/api/grounds/my", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch grounds");
        const data = await response.json();
        setGrounds(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyGrounds();
  }, [token, router]);

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, groundId: id, groundName: name });
  };

  const confirmDelete = async () => {
    const { groundId } = deleteModal;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/grounds/${groundId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to delete ground");
      setGrounds(grounds.filter(g => g.id !== groundId));
      setDeleteModal({ isOpen: false, groundId: null, groundName: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ProtectedRoute role="owner">
      <div className="pg-body">
        <OwnerSidebar />
        
        <main className="pg-main">
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Owner Panel › <span>My Grounds</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip"><div className="pg-pulse" /> Active Inventory</div>
            </div>
          </div>

          <div className="pg-container">
          <div className="pg-page-header">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>My Sports Venues</h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Manage your listed grounds and track their performance.</p>
            </div>
            
            <Link href="/owner/add-ground" className="pg-btn pg-btn-teal" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Plus size={18} /> Add New Ground
            </Link>
          </div>

          {!isLoading && grounds.length > 0 && (
            <div className="pg-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 32 }}>
              <div className="pg-card" style={{ padding: 20, marginBottom: 0 }}>
                <div style={{ color: "var(--teal)", marginBottom: 8 }}><Building2 size={24} /></div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Grounds</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{grounds.length.toString().padStart(2, '0')}</p>
              </div>
              <div className="pg-card" style={{ padding: 20, marginBottom: 0 }}>
                <div style={{ color: "var(--purple)", marginBottom: 8 }}><Plus size={24} /></div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Active Courts</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                  {grounds.reduce((acc, g) => acc + (g.courts?.length || 0), 0).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="pg-grid pg-grounds-grid">
              {[1, 2].map(i => <div key={i} className="pg-card" style={{ height: 300, opacity: 0.5 }} />)}
            </div>
          ) : (
            <div className="pg-grid pg-grounds-grid">
              {grounds.map((ground) => (
                <div key={ground.id} className="pg-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ position: "relative", height: 200, backgroundColor: "#0f172a", overflow: "hidden" }}>
                      <img 
                        src={ground.images?.[0]
                          ? getImageUrl(ground.images[0])
                          : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60"} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 20 }}>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                          ground.status === 'verified' ? 'bg-green-500 text-white' :
                          ground.status === 'pending' ? 'bg-orange-500 text-white' :
                          ground.status === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {ground.status}
                        </span>
                      </div>
                      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 20 }}>
                        <Link href={`/owner/grounds/edit/${ground.id}`} style={{ padding: 8, background: "white", borderRadius: 10, color: "var(--text-secondary)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}><Edit2 size={16} /></Link>
                        <button onClick={() => handleDeleteClick(ground.id, ground.name)} style={{ padding: 8, background: "white", borderRadius: 10, color: "var(--red)", border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div style={{ padding: 24 }}>
                      <div className="flex items-center justify-between mb-1">
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 0 }}>{ground.name}</h3>
                        {ground.status === "rejected" && (
                          <button 
                            onClick={() => alert(`Rejection Reason: ${ground.rejection_reason || "None provided"}`)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Reason
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
                        <MapPin size={12} /> {ground.location?.city || ground.location?.address || "Address N/A"}
                      </p>
                      
                      <div className="pg-ground-stats-row">
                        <div style={{ textAlign: "center" }}>
                          <p className="pg-ground-stat-label">Courts</p>
                          <p className="pg-ground-stat-val">{ground.courts?.length || 0}</p>
                        </div>
                        <div style={{ textAlign: "center", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                          <p className="pg-ground-stat-label">Bookings</p>
                          <p className="pg-ground-stat-val">0</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p className="pg-ground-stat-label">Revenue</p>
                          <p className="pg-ground-stat-val">₹0</p>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <Link 
                          href={`/owner/grounds/${ground.id}/status`}
                          className="flex-1 pg-ground-card-btn bg-surface border border-black/5 rounded-2xl text-base font-extrabold text-secondary text-center hover:bg-gray-50 smooth-transition shadow-sm"
                        >
                          View Status
                        </Link>
                        <Link 
                          href={`/owner/grounds/edit/${ground.id}`}
                          className="flex-1 pg-ground-card-btn bg-teal-50 border border-teal-100 rounded-2xl text-base font-extrabold text-teal-600 text-center hover:bg-teal-100 smooth-transition shadow-sm"
                        >
                          Edit Details
                        </Link>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          )}

          {grounds.length === 0 && !isLoading && (
            <div className="pg-card" style={{ textAlign: "center", padding: "80px 20px", borderStyle: "dashed" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: 16 }}><Building2 size={48} /></div>
              <h3 className="pg-section-title">No Grounds Listed</h3>
              <p className="pg-section-desc">You haven't added any grounds yet. Get started now!</p>
              <Link href="/owner/add-ground" className="pg-btn pg-btn-teal" style={{ display: "inline-block", textDecoration: "none" }}>Add My First Ground</Link>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {deleteModal.isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ isOpen: false })} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 200 }} />
            <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none" }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 400, background: "white", borderRadius: 24, padding: 32, textAlign: "center", pointerEvents: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
                <div style={{ color: "var(--red)", marginBottom: 16, display: "flex", justifyContent: "center" }}><AlertTriangle size={48} /></div>
                <h2 className="pg-section-title">Confirm Deletion</h2>
                <p className="pg-section-desc">Are you sure you want to delete <b>{deleteModal.groundName}</b>? This action cannot be undone.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button onClick={confirmDelete} className="pg-btn" style={{ background: "var(--red)", color: "white" }}>Delete Ground</button>
                  <button onClick={() => setDeleteModal({ isOpen: false })} className="pg-btn pg-btn-outline">Cancel</button>
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
