"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Shield, 
  MapPin, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  X, 
  Mail, 
  Phone as PhoneIcon, 
  Calendar,
  Lock,
  UserCheck
} from "lucide-react";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import "../owner.css";

export default function HandlersManagement() {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [handlers, setHandlers] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHandler, setSelectedHandler] = useState(null);
  
  // Add Form State
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "manager",
    assigned_venues: []
  });

  // Edit Permissions State
  const [editPermissions, setEditPermissions] = useState({
    can_confirm_bookings: true,
    can_cancel_bookings: true,
    can_view_analytics: true,
    can_edit_venue_details: false,
    can_add_time_slots: true,
    can_manage_pricing: true,
    is_active: true
  });

  useEffect(() => {
    if (token) {
      fetchHandlers();
      fetchMyGrounds();
    }
  }, [token]);

  const fetchHandlers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/handlers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch handlers");
      const data = await res.json();
      setHandlers(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyGrounds = async () => {
    try {
      const res = await fetch("/api/grounds/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch grounds");
      const data = await res.json();
      setGrounds(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    try {
      const res = await fetch("/api/handlers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create handler");
      
      showToast("Handler created successfully!", "success");
      setIsAddModalOpen(false);
      setAddForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "manager",
        assigned_venues: []
      });
      fetchHandlers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEditClick = (handler) => {
    setSelectedHandler(handler);
    setEditPermissions({
      can_confirm_bookings: handler.can_confirm_bookings,
      can_cancel_bookings: handler.can_cancel_bookings,
      can_view_analytics: handler.can_view_analytics,
      can_edit_venue_details: handler.can_edit_venue_details,
      can_add_time_slots: handler.can_add_time_slots,
      can_manage_pricing: handler.can_manage_pricing,
      is_active: handler.is_active
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    try {
      const res = await fetch(`/api/handlers/${selectedHandler.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editPermissions)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update handler");
      
      showToast("Handler permissions updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchHandlers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`Are you sure you want to revoke access for ${name}? This will permanently remove their credentials and ground assignments.`)) {
      try {
        const res = await fetch(`/api/handlers/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to delete handler");
        
        showToast("Handler access revoked successfully!", "success");
        fetchHandlers();
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  const handleGroundToggle = (groundId) => {
    const isAssigned = addForm.assigned_venues.includes(groundId);
    if (isAssigned) {
      setAddForm({
        ...addForm,
        assigned_venues: addForm.assigned_venues.filter(id => id !== groundId)
      });
    } else {
      setAddForm({
        ...addForm,
        assigned_venues: [...addForm.assigned_venues, groundId]
      });
    }
  };

  const handleEditGroundAssignment = async (handler, groundId, currentAssigned) => {
    const endpoint = currentAssigned ? "revoke-venue" : "assign-venue";
    try {
      const res = await fetch(`/api/handlers/${handler.id}/${endpoint}`, {
        method: currentAssigned ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ground_id: groundId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update venue assignment");
      
      showToast("Venue assignment updated successfully!", "success");
      fetchHandlers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <ProtectedRoute role="owner">
      <div className="pg-body">
        <OwnerSidebar />
        
        <main className="pg-main">
          {/* Top Bar */}
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Owner Panel › <span>Staff & Handlers</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip"><div className="pg-pulse" /> Active Operations</div>
            </div>
          </div>

          <div className="pg-container">
            {/* Page Header */}
            <div className="pg-page-header">
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Handlers & Managers</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Create manager accounts and assign them to specific sports venues.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="pg-btn pg-btn-teal" 
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Plus size={18} /> Add New Handler
              </button>
            </div>

            {/* List Handlers */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : handlers.length === 0 ? (
              <div className="pg-card" style={{ textAlign: "center", padding: "80px 20px", borderStyle: "dashed" }}>
                <div style={{ color: "var(--text-muted)", marginBottom: 16 }}><Users size={48} /></div>
                <h3 className="pg-section-title">No Handlers Registered</h3>
                <p className="pg-section-desc">You haven't added any staff or managers yet. Register your first handler to delegate venue operations.</p>
                <button onClick={() => setIsAddModalOpen(true)} className="pg-btn pg-btn-teal" style={{ display: "inline-block" }}>Add First Handler</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {handlers.map(handler => (
                  <div key={handler.id} className="pg-card relative flex flex-col justify-between" style={{ padding: 24 }}>
                    
                    {/* Top Section */}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                            handler.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {handler.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="ml-2 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-purple-100 text-purple-700">
                            {handler.role}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditClick(handler)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition"
                            title="Edit Permissions"
                          >
                            <Shield size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(handler.id, handler.name)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition"
                            title="Revoke Access"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-1">{handler.name}</h3>
                      
                      <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={12} /> {handler.email}
                        </div>
                        {handler.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon size={12} /> {handler.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar size={12} /> Assigned {new Date(handler.assigned_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Assigned Venues</p>
                        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {grounds.map(ground => {
                            const isAssigned = handler.assigned_venues.includes(ground.id);
                            return (
                              <div key={ground.id} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 font-medium truncate max-w-[150px]">{ground.name}</span>
                                <button
                                  onClick={() => handleEditGroundAssignment(handler, ground.id, isAssigned)}
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                                    isAssigned 
                                      ? "bg-teal-50 text-teal-600 hover:bg-teal-100" 
                                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                  }`}
                                >
                                  {isAssigned ? "Assigned" : "Assign"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Preview removed */}

                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Create Handler Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative animate-scale-up">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserCheck className="text-primary" /> Register New Handler
              </h2>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="rahul@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Login Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Staff Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="manager">Manager (Has edit slots/pricing access)</option>
                    <option value="supervisor">Supervisor (Can view/cancel bookings only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assign Initial Grounds</label>
                  <div className="border border-gray-200 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-2">
                    {grounds.map(ground => (
                      <div 
                        key={ground.id} 
                        onClick={() => handleGroundToggle(ground.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          addForm.assigned_venues.includes(ground.id) ? "bg-primary/5 border border-primary/20" : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-700">{ground.name}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                          addForm.assigned_venues.includes(ground.id) ? "bg-primary border-primary text-white" : "border-gray-300"
                        }`}>
                          {addForm.assigned_venues.includes(ground.id) && <Check size={12} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={isSubmitLoading}
                    className="flex-1 pg-btn pg-btn-teal"
                  >
                    {isSubmitLoading ? "Registering..." : "Create Account"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 pg-btn pg-btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Handler Permissions Modal */}
        {isEditModalOpen && selectedHandler && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 relative">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-2">Edit Permissions</h2>
              <p className="text-xs text-gray-400 mb-6">{selectedHandler.name} ({selectedHandler.email})</p>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                
                {/* Active Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-gray-700">Account Active Status</p>
                    <p className="text-[10px] text-gray-400">Enable/disable account login access.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPermissions({ ...editPermissions, is_active: !editPermissions.is_active })}
                    className="text-primary hover:scale-105 transition"
                  >
                    {editPermissions.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
                  </button>
                </div>

                {/* Bookings Permissions toggles removed */}

                {/* View Analytics */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-gray-700">View Revenue Analytics</p>
                    <p className="text-[10px] text-gray-400">Can access revenue stats & metrics.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPermissions({ ...editPermissions, can_view_analytics: !editPermissions.can_view_analytics })}
                    className="text-primary hover:scale-105 transition"
                  >
                    {editPermissions.can_view_analytics ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
                  </button>
                </div>

                {/* Manage Pricing */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-gray-700">Manage Slot Pricing</p>
                    <p className="text-[10px] text-gray-400">Can customize time slot pricing settings.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditPermissions({ ...editPermissions, can_manage_pricing: !editPermissions.can_manage_pricing })}
                    className="text-primary hover:scale-105 transition"
                  >
                    {editPermissions.can_manage_pricing ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
                  </button>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={isSubmitLoading}
                    className="flex-1 pg-btn pg-btn-teal"
                  >
                    {isSubmitLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 pg-btn pg-btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
