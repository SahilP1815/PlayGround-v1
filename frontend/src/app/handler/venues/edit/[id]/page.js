"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Upload, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Trophy,
  Loader2,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import HandlerSidebar from "@/components/HandlerSidebar";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/context/ToastContext";
import "../../../../owner/owner.css";

const css = `
  .pg-policy-selector { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px; }
  .pg-policy-card { padding: 16px; border: 1.5px solid var(--border); border-radius: 16px; background: white; cursor: pointer; transition: all 0.2s; text-align: left; }
  .pg-policy-card:hover { border-color: var(--teal-mid); background: #fafefe; }
  .pg-policy-card.active { border-color: var(--teal); background: var(--teal-light); }
  .pg-policy-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  .pg-policy-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.4; }
`;

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  const displayHour = i === 0 || i === 12 ? 12 : i % 12;
  const ampm = i < 12 ? "AM" : "PM";
  return { value: `${hour}:00`, label: `${displayHour}:00 ${ampm}` };
});

const steps = ["Basic Info", "Courts & Pricing", "Amenities", "Gallery"];

export default function EditGroundPage() {
  const router = useRouter();
  const params = useParams();
  const groundId = params.id;
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeSportTab, setActiveSportTab] = useState("");
  const [handlerInfo, setHandlerInfo] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    amenities: [],
    courts: [],
    images: [],
    cancellation_policy: "flexible",
    time_slots: []
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // 1. Fetch Handler Info
        const handlerRes = await fetch("/api/handler/dashboard/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!handlerRes.ok) throw new Error("Failed to load handler info");
        const handlerData = await handlerRes.json();
        const h = handlerData.handler || {};
        setHandlerInfo(h);

        // Verify permissions
        if (!h.can_edit_venue_details && !h.can_manage_pricing && !h.can_add_time_slots) {
          showToast("You do not have permission to edit this venue", "error");
          router.push("/handler/venues");
          return;
        }

        // 2. Fetch Ground details
        const response = await fetch(`/api/grounds/${groundId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch ground details");
        const data = await response.json();
        
        setFormData({
          name: data.name,
          address: data.location.address,
          description: data.description,
          amenities: data.amenities || [],
          courts: data.courts.map(c => ({
            id: c.id || Date.now() + Math.random(),
            name: c.name,
            sport: c.sport_type,
            price: c.base_price
          })),
          images: data.images || [],
          cancellation_policy: data.cancellation_policy || "flexible",
          time_slots: data.time_slots || []
        });
      } catch (error) {
        console.error("Error:", error);
        router.push("/handler/venues");
      } finally {
        setIsLoading(false);
      }
    };

    if (groundId) fetchDetails();
  }, [groundId, router]);

  // Sync activeSportTab based on unique sports in courts
  useEffect(() => {
    const uniqueSports = Array.from(new Set(formData.courts.map(c => c.sport).filter(Boolean)));
    if (uniqueSports.length > 0 && !activeSportTab) {
      setActiveSportTab(uniqueSports[0]);
    }
  }, [formData.courts, activeSportTab]);

  const addSlot = () => {
    if (!handlerInfo.can_add_time_slots) return;
    const activeKey = activeSportTab || (formData.courts[0]?.sport || "cricket");
    const sportKey = activeKey.toLowerCase();
    const newSlots = [...(formData.time_slots || [])];
    setFormData({
      ...formData,
      time_slots: [
        ...newSlots,
        {
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          start_time: "09:00",
          end_time: "17:00",
          price_per_hour: 1000,
          slot_type: "regular",
          sport_type: sportKey
        }
      ]
    });
  };

  const removeSlot = (index) => {
    if (!handlerInfo.can_add_time_slots) return;
    const newSlots = [...(formData.time_slots || [])];
    newSlots.splice(index, 1);
    setFormData({ ...formData, time_slots: newSlots });
  };

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      handleUpdateSubmit();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleUpdateSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        description: formData.description,
        location: { lat: 23.0225, lng: 72.5714, address: formData.address },
        images: formData.images,
        amenities: formData.amenities,
        courts: formData.courts.map(court => ({
          name: court.name,
          sport_type: court.sport.toLowerCase(),
          base_price: parseFloat(court.price) || 0
        })),
        cancellation_policy: formData.cancellation_policy,
        time_slots: (formData.time_slots || []).map(slot => ({
          days: slot.days,
          start_time: slot.start_time || slot.start,
          end_time: slot.end_time || slot.end,
          price_per_hour: parseFloat(slot.price_per_hour || slot.price),
          slot_type: slot.slot_type || slot.type || "regular",
          sport_type: slot.sport_type?.toLowerCase() || slot.sport?.toLowerCase()
        }))
      };

      const response = await fetch(`/api/grounds/${groundId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update ground");
      }
      showToast("Venue updated successfully!", "success");
      setIsSuccess(true);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pg-body" style={{ alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={48} color="var(--teal)" />
      </div>
    );
  }

  return (
    <div className="pg-body">
      <style>{css}</style>
      <HandlerSidebar />
      
      <main className="pg-main">
        <div className="pg-topbar">
          <div className="pg-breadcrumb">Handler Panel › Grounds › <span>Edit</span></div>
          <Link href="/handler/venues" style={{ textDecoration: "none" }}>
            <div className="pg-status-chip" style={{ cursor: "pointer" }}><ChevronLeft size={14} /> Back to List</div>
          </Link>
        </div>

        <div className="pg-container" style={{ maxWidth: 700 }}>
          <div style={{ marginBottom: 40 }}>
            <h1 className="pg-section-title" style={{ fontSize: 28 }}>Edit Venue</h1>
            <p className="pg-section-desc">Manage pricing, slots, and information according to your permissions.</p>
          </div>

          <div className="pg-stepper">
            <div className="pg-step-line">
              <div className="pg-step-line-fill" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
            </div>
            {steps.map((step, i) => (
              <div key={step} className={`pg-step ${i <= currentStep ? (i < currentStep ? "done" : "active") : ""}`}>
                <div className="pg-step-circle">{i < currentStep ? <Check size={14} className="text-white" /> : i + 1}</div>
                <span className="pg-step-label">{step}</span>
              </div>
            ))}
          </div>

          <div className="pg-card">
            {isSuccess ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ color: "var(--teal)", marginBottom: 20 }}><CheckCircle2 size={64} /></div>
                <h2 className="pg-section-title">Update Successful!</h2>
                <p className="pg-section-desc">Your changes have been saved successfully.</p>
                <Link href="/handler/venues" className="pg-btn pg-btn-teal" style={{ display: "inline-block", textDecoration: "none" }}>Back to Venues</Link>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    {currentStep === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div className="pg-field">
                          <label className="pg-label">Venue Name</label>
                          <input 
                            className="pg-input" 
                            disabled={!handlerInfo.can_edit_venue_details}
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            placeholder="e.g. Masterstroke Turf" 
                          />
                        </div>
                        <div className="pg-field">
                          <label className="pg-label">Address</label>
                          <input 
                            className="pg-input" 
                            disabled={!handlerInfo.can_edit_venue_details}
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                            placeholder="Full address..." 
                          />
                        </div>
                        <div className="pg-field">
                          <label className="pg-label">Description</label>
                          <textarea 
                            className="pg-textarea" 
                            disabled={!handlerInfo.can_edit_venue_details}
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            placeholder="Describe your venue..." 
                          />
                        </div>
                      </div>
                    )}
                    {currentStep === 1 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3 className="pg-label" style={{ fontSize: 14 }}>Courts & Slots</h3>
                          {handlerInfo.can_edit_venue_details && (
                            <button 
                              onClick={() => setFormData({...formData, courts: [...formData.courts, { id: Date.now(), name: "", sport: "cricket", price: "" }]})} 
                              className="pg-btn pg-btn-outline" 
                              style={{ padding: "6px 12px", fontSize: 12 }}
                            >
                              + Add Court
                            </button>
                          )}
                        </div>
                        {formData.courts.map((court, idx) => (
                          <div key={court.id} style={{ padding: 20, background: "#f8fafc", borderRadius: 16, position: "relative" }}>
                            <div className="pg-grid" style={{ gridTemplateColumns: "1fr 1fr 100px" }}>
                              <input 
                                className="pg-input" 
                                disabled={!handlerInfo.can_edit_venue_details}
                                value={court.name} 
                                onChange={e => {
                                  const newCourts = [...formData.courts];
                                  newCourts[idx].name = e.target.value;
                                  setFormData({...formData, courts: newCourts});
                                }} 
                                placeholder="Court Name" 
                              />
                              <select 
                                className="pg-select" 
                                disabled={!handlerInfo.can_edit_venue_details}
                                value={court.sport} 
                                onChange={e => {
                                  const newCourts = [...formData.courts];
                                  newCourts[idx].sport = e.target.value;
                                  setFormData({...formData, courts: newCourts});
                                }}
                              >
                                <option value="cricket">Cricket</option>
                                <option value="football">Football</option>
                                <option value="badminton">Badminton</option>
                              </select>
                              <input 
                                className="pg-input" 
                                type="number" 
                                disabled={!handlerInfo.can_manage_pricing}
                                value={court.price} 
                                onChange={e => {
                                  const newCourts = [...formData.courts];
                                  newCourts[idx].price = e.target.value;
                                  setFormData({...formData, courts: newCourts});
                                }} 
                                placeholder="Price" 
                              />
                            </div>
                            {formData.courts.length > 1 && handlerInfo.can_edit_venue_details && (
                              <button onClick={() => setFormData({...formData, courts: formData.courts.filter((_, i) => i !== idx)})} style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "var(--red)", color: "white", border: "none", cursor: "pointer", fontSize: 12 }}>×</button>
                            )}
                          </div>
                        ))}
                        
                        {/* Sport specific Slots & Pricing Configuration */}
                        {(() => {
                          const uniqueSports = Array.from(new Set(formData.courts.map(c => c.sport).filter(Boolean)));
                          if (uniqueSports.length === 0) return null;

                          const activeKey = (activeSportTab || uniqueSports[0]).toLowerCase();
                          const activeSlots = (formData.time_slots || []).filter(s => (s.sport_type || "").toLowerCase() === activeKey);

                          return (
                            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                              <div style={{ marginBottom: 16 }}>
                                <h4 className="pg-label" style={{ fontSize: 13, marginBottom: 8 }}>Custom Slots & Hourly Pricing per Sport</h4>
                                <div style={{ display: "flex", gap: 8, paddingBottom: 8, overflowX: "auto" }}>
                                  {uniqueSports.map(sport => (
                                    <button
                                      key={sport}
                                      type="button"
                                      onClick={() => setActiveSportTab(sport)}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold smooth-transition`}
                                      style={{
                                        marginRight: 6,
                                        background: activeKey === sport.toLowerCase() ? "var(--teal)" : "#edf2f7",
                                        color: activeKey === sport.toLowerCase() ? "white" : "#718096",
                                        border: "none",
                                        borderRadius: 12,
                                        cursor: "pointer"
                                      }}
                                    >
                                      {sport.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div style={{ background: "#f8fafc", padding: 20, borderRadius: 16 }}>
                                <div className="pg-section-title" style={{ fontSize: 14, marginBottom: 12 }}>Time Slots for {activeKey.toUpperCase()}</div>
                                <table className="pg-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                  <thead>
                                    <tr style={{ textAlign: "left", fontSize: 11, color: "var(--text-secondary)" }}>
                                      <th style={{ paddingBottom: 8 }}>Days</th>
                                      <th style={{ paddingBottom: 8 }}>Start</th>
                                      <th style={{ paddingBottom: 8 }}>End</th>
                                      <th style={{ paddingBottom: 8 }}>Price</th>
                                      <th style={{ paddingBottom: 8 }}>Type</th>
                                      <th style={{ paddingBottom: 8 }}></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {activeSlots.map((slot, originalIdx) => {
                                      // Find global index in formData.time_slots
                                      const globalIdx = formData.time_slots.findIndex(s => s === slot);

                                      return (
                                        <tr key={originalIdx} style={{ borderTop: "1px solid #edf2f7" }}>
                                          <td style={{ padding: "8px 0", minWidth: 160 }}>
                                            <div className="flex flex-wrap gap-1">
                                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                                                const isActive = (slot.days || []).includes(day);
                                                return (
                                                  <button
                                                    key={day}
                                                    type="button"
                                                    disabled={!handlerInfo.can_add_time_slots}
                                                    onClick={() => {
                                                      const newSlots = [...formData.time_slots];
                                                      const currentDays = slot.days || [];
                                                      if (isActive) {
                                                        newSlots[globalIdx].days = currentDays.filter(d => d !== day);
                                                      } else {
                                                        newSlots[globalIdx].days = [...currentDays, day];
                                                      }
                                                      setFormData({ ...formData, time_slots: newSlots });
                                                    }}
                                                    className={`w-6 h-6 rounded-lg text-[9px] font-bold transition-all`}
                                                    style={{
                                                      marginRight: 2,
                                                      background: isActive ? "var(--teal)" : "#edf2f7",
                                                      color: isActive ? "white" : "#718096",
                                                      border: "none",
                                                      cursor: "pointer"
                                                    }}
                                                  >
                                                    {day.substring(0, 1)}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </td>
                                          <td style={{ padding: "8px 0" }}>
                                            <select 
                                              className="pg-select" 
                                              disabled={!handlerInfo.can_add_time_slots}
                                              value={slot.start_time || slot.start || "06:00"} 
                                              onChange={e => { 
                                                const newSlots = [...formData.time_slots]; 
                                                newSlots[globalIdx].start_time = e.target.value; 
                                                newSlots[globalIdx].start = e.target.value; 
                                                setFormData({ ...formData, time_slots: newSlots }); 
                                              }}
                                              style={{ fontSize: 11, padding: "4px 8px" }}
                                            >
                                              {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                          </td>
                                          <td style={{ padding: "8px 0" }}>
                                            <select 
                                              className="pg-select" 
                                              disabled={!handlerInfo.can_add_time_slots}
                                              value={slot.end_time || slot.end || "22:00"} 
                                              onChange={e => { 
                                                const newSlots = [...formData.time_slots]; 
                                                newSlots[globalIdx].end_time = e.target.value; 
                                                newSlots[globalIdx].end = e.target.value; 
                                                setFormData({ ...formData, time_slots: newSlots }); 
                                              }}
                                              style={{ fontSize: 11, padding: "4px 8px" }}
                                            >
                                              {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                              <option value="23:59">12:00 AM</option>
                                            </select>
                                          </td>
                                          <td style={{ padding: "8px 0" }}>
                                            <input 
                                              type="number" 
                                              className="pg-input" 
                                              disabled={!handlerInfo.can_manage_pricing}
                                              value={slot.price_per_hour || slot.price || ""} 
                                              onChange={e => { 
                                                const newSlots = [...formData.time_slots]; 
                                                newSlots[globalIdx].price_per_hour = e.target.value; 
                                                newSlots[globalIdx].price = e.target.value; 
                                                setFormData({ ...formData, time_slots: newSlots }); 
                                              }}
                                              style={{ fontSize: 11, padding: "4px 8px", width: 60 }} 
                                            />
                                          </td>
                                          <td style={{ padding: "8px 0" }}>
                                            <select 
                                              className="pg-select" 
                                              disabled={!handlerInfo.can_add_time_slots}
                                              value={slot.slot_type || slot.type || "regular"} 
                                              onChange={e => { 
                                                const newSlots = [...formData.time_slots]; 
                                                newSlots[globalIdx].slot_type = e.target.value; 
                                                newSlots[globalIdx].type = e.target.value; 
                                                setFormData({ ...formData, time_slots: newSlots }); 
                                              }}
                                              style={{ fontSize: 11, padding: "4px 8px" }}
                                            >
                                              <option value="regular">Regular</option>
                                              <option value="peak">Peak</option>
                                              <option value="off_peak">Off-peak</option>
                                            </select>
                                          </td>
                                          <td style={{ padding: "8px 0", textAlign: "right" }}>
                                            {handlerInfo.can_add_time_slots && (
                                              <button 
                                                type="button" 
                                                onClick={() => removeSlot(globalIdx)}
                                                className="flex items-center justify-center"
                                                style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }}
                                              >
                                                <X size={14} />
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {handlerInfo.can_add_time_slots && (
                                  <button 
                                    type="button" 
                                    onClick={addSlot}
                                    style={{
                                      marginTop: 12,
                                      background: "none",
                                      border: "none",
                                      color: "var(--teal)",
                                      fontWeight: 700,
                                      fontSize: 12,
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4
                                    }}
                                  >
                                    + Add Another Slot
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <div style={{ marginTop: 24 }}>
                          <label className="pg-label">Cancellation Policy</label>
                          <div className="pg-policy-selector">
                            {[
                              { id: "flexible", title: "Flexible", desc: "Full refund up to 24h before." },
                              { id: "moderate", title: "Moderate", desc: "50% refund up to 24h, 100% up to 48h." },
                              { id: "strict", title: "Strict", desc: "No refunds allowed for any cancellation." }
                            ].map(p => (
                              <button 
                                key={p.id}
                                disabled={!handlerInfo.can_edit_venue_details}
                                className={`pg-policy-card ${formData.cancellation_policy === p.id ? "active" : ""}`}
                                style={{ opacity: !handlerInfo.can_edit_venue_details ? 0.7 : 1, cursor: !handlerInfo.can_edit_venue_details ? "not-allowed" : "pointer" }}
                                onClick={() => setFormData({ ...formData, cancellation_policy: p.id })}
                              >
                                <div className="pg-policy-title">{p.title}</div>
                                <div className="pg-policy-desc">{p.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        {["Parking", "Water", "Washroom", "Floodlights", "CCTV", "Canteen"].map(item => {
                          const isActive = formData.amenities.includes(item);
                          return (
                            <div 
                              key={item} 
                              onClick={() => {
                                if (!handlerInfo.can_edit_venue_details) return;
                                const newAmen = isActive ? formData.amenities.filter(a => a !== item) : [...formData.amenities, item];
                                setFormData({...formData, amenities: newAmen});
                              }} 
                              className={`pg-chip ${isActive ? "active" : ""}`}
                              style={{ opacity: !handlerInfo.can_edit_venue_details && !isActive ? 0.5 : 1, cursor: !handlerInfo.can_edit_venue_details ? "not-allowed" : "pointer" }}
                            >
                              {item}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div>
                        {handlerInfo.can_edit_venue_details ? (
                          <ImageUploader 
                            images={formData.images} 
                            onChange={(newImages) => setFormData({ ...formData, images: typeof newImages === 'function' ? newImages(formData.images) : newImages })}
                            maxImages={10}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-4">
                            {formData.images.map((img) => (
                              <div key={img} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-black/5">
                                <img src={img} className="w-full h-full object-cover" alt="Preview" />
                              </div>
                            ))}
                            {formData.images.length === 0 && (
                              <p className="text-xs text-gray-400 italic">No images uploaded.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <button onClick={prevStep} disabled={currentStep === 0} className="pg-btn pg-btn-outline" style={{ opacity: currentStep === 0 ? 0 : 1 }}>Back</button>
                  <button onClick={nextStep} disabled={isSubmitting} className="pg-btn pg-btn-teal">
                    {isSubmitting ? "Updating..." : (currentStep === steps.length - 1 ? "Save Changes" : "Continue")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
