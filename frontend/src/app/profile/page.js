"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Settings, Activity, Calendar, Camera, Lock, CheckCircle2, Loader2, Edit2, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

const AVATAR_COLORS = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#2ecc71", "#f1c40f", "#34495e"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ bookings: 0, reviews: 0 });

  // Form States
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", bio: "", avatar_color: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [prefForm, setPrefForm] = useState({ confirmEmail: true, reminderEmail: true, newsletter: false });

  useEffect(() => {
    fetchProfile();
    fetchStats();
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem("userPrefs");
    if (savedPrefs) setPrefForm(JSON.parse(savedPrefs));
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setProfileForm({
          name: data.name,
          phone: data.phone || "",
          bio: data.bio || "",
          avatar_color: data.avatar_color || "#1abc9c"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/bookings/my", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, bookings: data.length }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        localStorage.setItem("userName", updated.name);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.new
        })
      });
      if (response.ok) {
        alert("Password changed successfully!");
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to change password");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = () => {
    localStorage.setItem("userPrefs", JSON.stringify(prefForm));
    alert("Preferences saved!");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const getStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length > 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = getStrength(passwordForm.new);

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Overview */}
          <div className="space-y-8">
            <div className="glass-card p-8 text-center flex flex-col items-center">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-extrabold shadow-2xl relative group"
                style={{ background: profileForm.avatar_color }}
              >
                {user.name.charAt(0)}
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 smooth-transition flex items-center justify-center cursor-pointer">
                   <Camera size={24} />
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-2xl font-extrabold text-secondary flex items-center justify-center gap-2">
                  {user.name} <CheckCircle2 size={18} className="text-primary" />
                </h2>
                <p className="text-gray-400 font-bold text-sm lowercase">{user.email}</p>
                <div className="mt-3 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block">
                   {user.role === "user" ? "player" : user.role} Member
                </div>
              </div>

              <div className="grid grid-cols-2 w-full gap-4 mt-8 pt-8 border-t border-black/5">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-secondary">{stats.bookings}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bookings</p>
                </div>
                <div className="text-center border-l border-black/5">
                  <p className="text-2xl font-extrabold text-secondary">{stats.reviews}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reviews</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-black/5 w-full text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
                <p className="text-sm font-bold text-secondary flex items-center gap-2">
                   <Calendar size={14} className="text-primary" /> 
                   {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'May 2024'}
                </p>
              </div>
            </div>

            <div className="glass-card p-2 overflow-hidden">
              {[
                { id: "info", label: "Personal Info", icon: <User size={18} /> },
                { id: "security", label: "Security", icon: <Lock size={18} /> },
                { id: "prefs", label: "Preferences", icon: <Settings size={18} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold smooth-transition ${
                    activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-secondary"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div 
                  key="info"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-10"
                >
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-secondary">Personal Information</h3>
                      <p className="text-xs text-gray-400 font-bold">Update your basic profile details</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                        <input 
                          type="text" 
                          value={profileForm.name}
                          onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                          className="pg-input w-full" 
                          placeholder="John Doe" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">Email (Read Only)</label>
                        <input type="email" value={user.email} disabled className="pg-input w-full bg-gray-50 opacity-60 cursor-not-allowed" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">+91</span>
                          <input 
                            type="text" 
                            value={profileForm.phone}
                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                            className="pg-input w-full pl-12" 
                            placeholder="98765 43210" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">Short Bio</label>
                      <div className="relative">
                        <textarea 
                          maxLength={160}
                          value={profileForm.bio}
                          onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                          className="pg-input w-full h-32 py-4 resize-none" 
                          placeholder="Tell us a bit about your sporting life..."
                        />
                        <span className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-400">
                          {profileForm.bio.length}/160
                        </span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={saving}
                      className="pg-btn pg-btn-teal px-10 flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity size={18} />} Save Changes
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-10"
                >
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-secondary">Security Settings</h3>
                      <p className="text-xs text-gray-400 font-bold">Keep your account safe and updated</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">Current Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="pg-input w-full" 
                        placeholder="••••••••" 
                        required
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                        <input 
                          type="password" 
                          value={passwordForm.new}
                          onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                          className="pg-input w-full" 
                          placeholder="••••••••" 
                          required
                        />
                      </div>
                      
                      {passwordForm.new && (
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <span>Password Strength</span>
                             <span className={strength >= 3 ? "text-primary" : strength >= 2 ? "text-orange-400" : "text-red-400"}>
                               {strength >= 4 ? "Strong" : strength >= 3 ? "Good" : strength >= 2 ? "Fair" : "Weak"}
                             </span>
                           </div>
                           <div className="flex gap-1 h-1.5">
                             {[1, 2, 3, 4].map(i => (
                               <div key={i} className={`flex-1 rounded-full smooth-transition ${
                                 strength >= i ? (strength >= 3 ? "bg-primary" : strength >= 2 ? "bg-orange-400" : "bg-red-400") : "bg-gray-100"
                               }`} />
                             ))}
                           </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 ml-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                          className="pg-input w-full" 
                          placeholder="••••••••" 
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={saving}
                      className="pg-btn pg-btn-teal px-10 flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock size={18} />} Update Password
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "prefs" && (
                <motion.div 
                  key="prefs"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-10"
                >
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                      <Palette size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-secondary">Preferences</h3>
                      <p className="text-xs text-gray-400 font-bold">Personalize your experience</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Avatar Color</h4>
                      <div className="flex flex-wrap gap-4">
                        {AVATAR_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setProfileForm({...profileForm, avatar_color: color})}
                            className={`w-10 h-10 rounded-full border-4 smooth-transition ${
                              profileForm.avatar_color === color ? "border-primary scale-110 shadow-lg" : "border-transparent"
                            }`}
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Notification Settings</h4>
                      <div className="space-y-4">
                        {[
                          { id: 'confirmEmail', label: 'Email me when booking is confirmed' },
                          { id: 'reminderEmail', label: 'Email me 2 hours before my slot' },
                          { id: 'newsletter', label: 'Email me when new grounds are listed nearby' }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                             <div 
                              onClick={() => setPrefForm({...prefForm, [opt.id]: !prefForm[opt.id]})}
                              className={`w-6 h-6 rounded-lg border-2 smooth-transition flex items-center justify-center ${
                                prefForm[opt.id] ? "bg-primary border-primary" : "bg-white border-black/10 group-hover:border-primary/20"
                              }`}
                             >
                               {prefForm[opt.id] && <X className="w-4 h-4 text-white rotate-45" />}
                             </div>
                             <span className="text-sm font-bold text-secondary/80">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button onClick={savePrefs} className="pg-btn pg-btn-teal px-10">Save Preferences</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
