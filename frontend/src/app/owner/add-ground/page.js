"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUploader from "@/components/ImageUploader";
import { Check, X, MapPin, Shield, Video, Clapperboard, Rocket, Plus } from "lucide-react";
import SportIcon from "@/components/SportIcon";
import "../owner.css";

// Dynamically imported — Leaflet needs the browser window, so ssr: false is required
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const css = `
  .pg-map-placeholder { height: 200px; background: #eef2f1; border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); cursor: pointer; border: 2px dashed var(--border); transition: all 0.2s; }
  .pg-map-placeholder:hover { background: #e8eceb; border-color: var(--teal-mid); color: var(--teal); }
  .pg-amenities { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
  .pg-pill { padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--border); background: white; font-size: 12px; font-weight: 600; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
  .pg-pill.active { background: var(--teal-light); border-color: var(--teal); color: var(--teal); }
  .pg-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .pg-table th { text-align: left; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; padding-bottom: 12px; }
  .pg-table td { padding: 8px 4px; }
  .pg-add-slot { width: 100%; padding: 14px; border: 2px dashed var(--teal-mid); border-radius: var(--radius-sm); background: var(--teal-light); color: var(--teal); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
  .pg-add-slot:hover { background: #dff4f0; }
  .pg-banner { padding: 16px 20px; border-radius: var(--radius-sm); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; }
  .pg-banner.teal { background: var(--teal-light); color: var(--teal-dark); border: 1px solid var(--teal-mid); }
  .pg-banner.purple { background: var(--purple-light); color: var(--purple); border: 1px solid #c9c3f5; }
  .pg-doc-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); }
  .pg-doc-row:last-child { border-bottom: none; }
  .pg-badge-uploaded { background: var(--green-light); color: var(--green); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .pg-footer { position: fixed; bottom: 0; left: var(--sidebar-w); right: 0; height: 80px; background: white; border-top: 1px solid var(--border); padding: 0 32px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
  .pg-btn-ghost { background: none; color: var(--text-muted); }
  .pg-btn-ghost:hover { color: var(--text-primary); }
  .pg-btn-purple { background: var(--purple); color: white; }
  .pg-policy-selector { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px; }
  .pg-policy-card { padding: 16px; border: 1.5px solid var(--border); border-radius: 16px; background: white; cursor: pointer; transition: all 0.2s; text-align: left; }
  .pg-policy-card:hover { border-color: var(--teal-mid); background: #fafefe; }
  .pg-policy-card.active { border-color: var(--teal); background: var(--teal-light); }
  .pg-policy-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  .pg-policy-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.4; }
`;

const SPORTS = [
  { label: "Cricket", icon: "cricket" },
  { label: "Football", icon: "football" },
  { label: "Volleyball", icon: "volleyball" },
  { label: "Basketball", icon: "basketball" },
  { label: "Badminton", icon: "badminton" },
  { label: "Tennis", icon: "tennis" },
  { label: "Pickleball", icon: "pickleball" }
];
const AMENITIES = ["Floodlights", "Changing Room", "Parking", "Washrooms", "Cafeteria", "Scoreboard", "Security", "Live Streaming", "Spectator Seating", "WiFi"];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  const displayHour = i === 0 ? "12" : i > 12 ? (i - 12).toString() : i.toString();
  const ampm = i < 12 ? "AM" : "PM";
  return { value: `${hour}:00`, label: `${displayHour}:00 ${ampm}` };
});

export default function AddGroundPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState(0);
  const [activeSportTab, setActiveSportTab] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sportTypes: new Set(),
    sportConfigs: {}, // stores config per sport: { cricket: { courtCount: 1, slots: [...] } }
    surfaceType: "",
    groundSize: "",
    maxPlayers: "",
    isIndoor: "outdoor",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    amenities: new Set(),
    slots: [
      { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], start: "06:00", end: "23:00", price: 1200, type: "regular" },
      { days: ["Sat", "Sun"], start: "06:00", end: "23:00", price: 1500, type: "peak" }
    ],
    advanceDays: 30,
    cancellation: "18_hours",
    minDuration: 1.0,
    deposit: 0,
    photos: [],
    video: null,
    docs: { propertyProof: null, govId: null, municipal: null, bank: null }
  });

  // lat/lng captured from the map when the owner pins a location
  const [mapLocation, setMapLocation] = useState({ lat: null, lng: null });

  const [isLoading, setIsLoading] = useState(false);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const tabs = ["Ground Info", "Slots & Pricing", "Photos & Video", "Verification Docs"];

  const isTabValid = () => {
    if (currentTab === 0) {
      return formData.name.trim() !== "" &&
        formData.address.trim() !== "" &&
        formData.city.trim() !== "" &&
        formData.state.trim() !== "" &&
        formData.sportTypes.size > 0;
    }
    if (currentTab === 1) {
      if (formData.sportTypes.size === 0) return false;
      return Array.from(formData.sportTypes).every(sport => {
        const conf = formData.sportConfigs[sport.toLowerCase()];
        return conf && conf.surfaceType && conf.maxPlayers && conf.slots.length > 0;
      });
    }
    if (currentTab === 2) {
      return formData.photos.length > 0;
    }
    if (currentTab === 3) {
      return !!formData.docs.propertyProof;
    }
    return true;
  };

  const handleNext = () => {
    if (!isTabValid()) {
      setAttemptedSubmit(true);
      showToast("Please fill all the required details marked in red.", "error");
      return;
    }
    setAttemptedSubmit(false);
    if (currentTab < 3) setCurrentTab(currentTab + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentTab > 0) setCurrentTab(currentTab - 1);
  };

  const toggleSport = (sport) => {
    const newSports = new Set(formData.sportTypes);
    const newConfigs = { ...formData.sportConfigs };
    const sportKey = sport.toLowerCase();

    if (newSports.has(sport)) {
      newSports.delete(sport);
      delete newConfigs[sportKey];

      // If we are deleting the active sport tab, switch to another one
      if (activeSportTab === sport) {
        setActiveSportTab(Array.from(newSports)[0] || "");
      }
    } else {
      newSports.add(sport);
      newConfigs[sportKey] = {
        courtCount: 1,
        surfaceType: "",
        maxPlayers: "",
        isIndoor: "outdoor",
        slots: [
          { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], start: "06:00", end: "23:00", price: 1200, type: "regular" },
          { days: ["Sat", "Sun"], start: "06:00", end: "23:00", price: 1500, type: "peak" }
        ]
      };

      if (!activeSportTab) {
        setActiveSportTab(sport);
      }
    }
    setFormData({ ...formData, sportTypes: newSports, sportConfigs: newConfigs });
  };

  // Sync activeSportTab when tab changes or sportTypes updates
  useEffect(() => {
    if (formData.sportTypes.size > 0 && !activeSportTab) {
      setActiveSportTab(Array.from(formData.sportTypes)[0]);
    }
  }, [formData.sportTypes, activeSportTab]);

  const toggleAmenity = (amenity) => {
    const newAmenities = new Set(formData.amenities);
    if (newAmenities.has(amenity)) newAmenities.delete(amenity);
    else newAmenities.add(amenity);
    setFormData({ ...formData, amenities: newAmenities });
  };

  const addSlot = () => {
    if (!activeSportTab) return;
    const sportKey = activeSportTab.toLowerCase();
    const newConfigs = { ...formData.sportConfigs };
    const sportSlots = newConfigs[sportKey]?.slots || [];
    newConfigs[sportKey] = {
      ...newConfigs[sportKey],
      slots: [...sportSlots, { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], start: "09:00", end: "17:00", price: 1000, type: "regular" }]
    };
    setFormData({ ...formData, sportConfigs: newConfigs });
  };

  const removeSlot = (index) => {
    if (!activeSportTab) return;
    const sportKey = activeSportTab.toLowerCase();
    const newConfigs = { ...formData.sportConfigs };
    const sportSlots = [...(newConfigs[sportKey]?.slots || [])];
    sportSlots.splice(index, 1);
    newConfigs[sportKey] = {
      ...newConfigs[sportKey],
      slots: sportSlots
    };
    setFormData({ ...formData, sportConfigs: newConfigs });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photos: [...prev.photos, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/uploads/document", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formDataUpload
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          docs: { ...prev.docs, [type]: data.url }
        }));
        showToast("Document uploaded successfully", "success");
      } else {
        const err = await res.json();
        showToast(err.detail || "Upload failed", "error");
      }
    } catch (err) {
      showToast("Connection error during upload", "error");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Construct courts and time slots from per-sport configs
      const courts = [];
      const timeSlots = [];

      Array.from(formData.sportTypes).forEach(sport => {
        const sportKey = sport.toLowerCase();
        const config = formData.sportConfigs[sportKey] || { courtCount: 1, slots: [] };
        const courtCount = config.courtCount || 1;
        const firstSlotPrice = config.slots[0]?.price || 1000;

        for (let i = 1; i <= courtCount; i++) {
          courts.push({
            name: `${sport} Court ${i}`,
            sport_type: sportKey,
            base_price: parseFloat(firstSlotPrice),
            surface_type: config.surfaceType || undefined,
            max_players: config.maxPlayers ? parseInt(config.maxPlayers) : undefined,
            is_indoor: config.isIndoor === "indoor"
          });
        }

        config.slots.forEach(slot => {
          timeSlots.push({
            days: slot.days,
            start_time: slot.start,
            end_time: slot.end,
            price_per_hour: parseFloat(slot.price),
            slot_type: slot.type,
            sport_type: sportKey
          });
        });
      });

      // Map UI state to backend schema
      const payload = {
        name: formData.name,
        description: formData.description,
        location: {
          lat: mapLocation.lat ?? 23.0225,
          lng: mapLocation.lng ?? 72.5714,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark
        },
        surface_type: formData.surfaceType,
        ground_size: formData.groundSize,
        max_players: parseInt(formData.maxPlayers) || 0,
        is_indoor: formData.isIndoor === "indoor",
        images: formData.photos,
        video_url: null, // Placeholder for video
        amenities: Array.from(formData.amenities),
        advance_booking_days: parseInt(formData.advanceDays) || 30,
        cancellation_policy: formData.cancellation,
        min_booking_duration: parseFloat(formData.minDuration) || 1.0,
        security_deposit: parseFloat(formData.deposit) || 0,
        courts: courts,
        time_slots: timeSlots,
        verification_docs: {
          property_proof: formData.docs.propertyProof,
          gov_id: formData.docs.govId,
          municipal_permission: formData.docs.municipal,
          bank_details: formData.docs.bank
        }
      };

      const res = await fetch("/api/grounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Ground submitted for verification!", "success");
        router.push("/owner/grounds");
      } else {
        const err = await res.json();
        showToast(JSON.stringify(err.detail), "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Submission failed. Check console.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute role="owner">
      <>
        <style>{css}</style>
        <div className="pg-body">
          <OwnerSidebar />

          <main className="pg-main">
            <div className="pg-topbar">
              <div className="pg-breadcrumb">My Grounds › <span>Add New Ground</span></div>
              <div className="pg-topbar-right">
                <div className="pg-status-chip"><div className="pg-pulse" /> Business is Live</div>
              </div>
            </div>

            <div className="pg-container">
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>List Your Ground</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Fill in the details below to get your ground verified and live on PlayGround</p>
              </div>
              {/* STEPPER */}
              <div className="pg-stepper">
                <div className="pg-step-line"><div className="pg-step-line-fill" style={{ width: `${(currentTab + 1) * 25}%` }} /></div>
                {["Account", "Ground Info", "Slots & Pricing", "Photos", "Verification"].map((label, i) => (
                  <div key={label} className={`pg-step ${i === 0 ? "done" : (i <= currentTab + 1 ? "active" : "")}`}>
                    <div className="pg-step-circle">{i === 0 ? <Check size={14} className="text-white" /> : i}</div>
                    <span className="pg-step-label">{label}</span>
                  </div>
                ))}
              </div>

              {/* TABS */}
              <div className="pg-tabs">
                {tabs.map((tab, i) => (
                  <button key={tab} className={`pg-tab ${currentTab === i ? "active" : ""}`} onClick={() => setCurrentTab(i)}>
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentTab === 0 && (
                    <div>
                      <div className="pg-card">
                        <div className="pg-section-title">Select Sports</div>
                        <div className="pg-section-desc">Which sports can be played at this venue?</div>
                        <div className={`pg-chips ${attemptedSubmit && formData.sportTypes.size === 0 ? "pg-error rounded-xl p-2" : ""}`}>
                          {SPORTS.map(s => (
                            <button key={s.label} className={`pg-chip ${formData.sportTypes.has(s.label) ? "active" : ""}`} onClick={() => toggleSport(s.label)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 24px", minWidth: 100 }}>
                              <SportIcon sport={s.icon} size={28} className={formData.sportTypes.has(s.label) ? "text-teal" : "text-text-secondary"} />
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pg-card">
                        <div className="pg-section-title">Ground Details</div>
                        <div className="pg-field"><label className="pg-label">Ground Name</label><input className={`pg-input ${attemptedSubmit && !formData.name.trim() ? "pg-error" : ""}`} placeholder="e.g. Green Valley Arena" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div className="pg-field">
                          <label className="pg-label">Description</label>
                          <textarea className="pg-textarea" maxLength={300} placeholder="Tell players about your turf..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                          <div className="pg-char-count">{formData.description.length}/300</div>
                        </div>
                      </div>

                      <div className="pg-card">
                        <div className="pg-section-title">Location</div>
                        <div className="pg-field"><label className="pg-label">Full Address</label><input className={`pg-input ${attemptedSubmit && !formData.address.trim() ? "pg-error" : ""}`} placeholder="Shop no, Building, Area..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                        <div className="pg-grid">
                          <div className="pg-field"><label className="pg-label">City</label><input className={`pg-input ${attemptedSubmit && !formData.city.trim() ? "pg-error" : ""}`} placeholder="Ahmedabad" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} /></div>
                          <div className="pg-field"><label className="pg-label">State</label><input className={`pg-input ${attemptedSubmit && !formData.state.trim() ? "pg-error" : ""}`} placeholder="Gujarat" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} /></div>
                          <div className="pg-field"><label className="pg-label">Pincode</label><input className="pg-input" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} /></div>
                          <div className="pg-field"><label className="pg-label">Landmark</label><input className="pg-input" value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value })} /></div>
                        </div>
                        {/* Map + Google Places search box */}
                        <MapComponent
                          onLocationSelect={(loc) => {
                            setMapLocation({ lat: loc.lat, lng: loc.lng });
                            // Pre-fill the address field if it is still empty
                            if (!formData.address.trim()) {
                              setFormData(prev => ({ ...prev, address: loc.address }));
                            }
                          }}
                        />
                      </div>

                      <div className="pg-card">
                        <div className="pg-section-title">Amenities</div>
                        <div className="pg-amenities">
                          {AMENITIES.map(a => (
                            <button key={a} className={`pg-pill ${formData.amenities.has(a) ? "active" : ""}`} onClick={() => toggleAmenity(a)}>{a}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTab === 1 && (
                    <div className="pg-card">
                      {formData.sportTypes.size === 0 ? (
                        <div style={{ padding: 40, textAlign: "center" }}>
                          <p className="text-gray-400 font-bold">Please go back to "Ground Info" and select at least one sport.</p>
                        </div>
                      ) : (
                        <>
                          {/* Sport Selector Tabs */}
                          <div className="flex gap-6 mb-8 border-b border-gray-100 pb-4 overflow-x-auto">
                            {Array.from(formData.sportTypes).map(sport => (
                              <button
                                key={sport}
                                type="button"
                                onClick={() => setActiveSportTab(sport)}
                                style={{ minWidth: '140px', padding: '12px 24px', borderRadius: '12px' }}
                                className={`text-base font-bold transition-all shrink-0 text-center ${activeSportTab === sport
                                    ? "bg-teal-500 text-white shadow-lg"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                  }`}
                              >
                                {sport}
                              </button>
                            ))}
                          </div>

                          {/* Active Sport Config Panel */}
                          {activeSportTab && (() => {
                            const activeKey = activeSportTab.toLowerCase();
                            const activeConfig = formData.sportConfigs[activeKey] || { courtCount: 1, slots: [] };

                            return (
                              <>
                                {/* Court Count Input Section */}
                                <div style={{ marginTop: '32px' }}>
                                  <div className="pg-section-title">Court Configuration for {activeSportTab}</div>
                                  <div className="pg-section-desc">How many courts are available for {activeSportTab}? Each court will be listed separately.</div>
                                  <div className="pg-grid mt-6">
                                    <div className="pg-field">
                                      <label className="pg-label">Number of Courts</label>
                                      <input
                                        type="number"
                                        min="1"
                                        className="pg-input"
                                        value={activeConfig.courtCount}
                                        onChange={(e) => {
                                          const val = Math.max(1, parseInt(e.target.value) || 1);
                                          const newConfigs = { ...formData.sportConfigs };
                                          newConfigs[activeKey] = {
                                            ...newConfigs[activeKey],
                                            courtCount: val
                                          };
                                          setFormData({ ...formData, sportConfigs: newConfigs });
                                        }}
                                      />
                                    </div>
                                    <div className="pg-field">
                                      <label className="pg-label">Surface Type</label>
                                      <select className={`pg-select ${attemptedSubmit && !activeConfig.surfaceType ? "pg-error" : ""}`} value={activeConfig.surfaceType} onChange={e => { const newConfigs = { ...formData.sportConfigs }; newConfigs[activeKey].surfaceType = e.target.value; setFormData({ ...formData, sportConfigs: newConfigs }); }}>
                                        <option value="">Select surface</option>
                                        <option>Artificial Turf</option>
                                        <option>Natural Grass</option>
                                        <option>Clay</option>
                                        <option>Hard Court</option>
                                      </select>
                                    </div>
                                    <div className="pg-field">
                                      <label className="pg-label">Max Players (inside court)</label>
                                      <input type="number" className={`pg-input ${attemptedSubmit && !activeConfig.maxPlayers ? "pg-error" : ""}`} value={activeConfig.maxPlayers} onChange={e => { const newConfigs = { ...formData.sportConfigs }; newConfigs[activeKey].maxPlayers = e.target.value; setFormData({ ...formData, sportConfigs: newConfigs }); }} />
                                    </div>
                                    <div className="pg-field">
                                      <label className="pg-label">Venue Type</label>
                                      <select className="pg-select" value={activeConfig.isIndoor} onChange={e => { const newConfigs = { ...formData.sportConfigs }; newConfigs[activeKey].isIndoor = e.target.value; setFormData({ ...formData, sportConfigs: newConfigs }); }}>
                                        <option value="outdoor">Outdoor</option>
                                        <option value="indoor">Indoor</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {/* Slots Editor Section */}
                                <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
                                  <div className="pg-section-title">Time Slots & Hourly Pricing ({activeSportTab})</div>
                                  <div className="pg-section-desc">Specify hourly pricing and slot types for {activeSportTab} courts.</div>
                                  <table className="pg-table" style={{ marginTop: 20 }}>
                                    <thead><tr><th>Days</th><th>Start</th><th>End</th><th>Price/hr</th><th>Type</th><th></th></tr></thead>
                                    <tbody>
                                      {activeConfig.slots.map((slot, i) => (
                                        <tr key={i}>
                                          <td style={{ minWidth: 200 }}>
                                            <div className="flex flex-wrap gap-1">
                                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                                                const isActive = slot.days.includes(day);
                                                return (
                                                  <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                      const newConfigs = { ...formData.sportConfigs };
                                                      const sportSlots = [...newConfigs[activeKey].slots];
                                                      if (isActive) {
                                                        sportSlots[i].days = sportSlots[i].days.filter(d => d !== day);
                                                      } else {
                                                        sportSlots[i].days = [...sportSlots[i].days, day];
                                                      }
                                                      newConfigs[activeKey] = {
                                                        ...newConfigs[activeKey],
                                                        slots: sportSlots
                                                      };
                                                      setFormData({ ...formData, sportConfigs: newConfigs });
                                                    }}
                                                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${isActive
                                                        ? "bg-teal-500 text-white shadow-sm"
                                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                      }`}
                                                  >
                                                    {day.substring(0, 1)}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </td>
                                          <td>
                                            <select
                                              className="pg-select"
                                              value={slot.start}
                                              onChange={e => {
                                                const newConfigs = { ...formData.sportConfigs };
                                                const sportSlots = [...newConfigs[activeKey].slots];
                                                sportSlots[i].start = e.target.value;
                                                newConfigs[activeKey] = { ...newConfigs[activeKey], slots: sportSlots };
                                                setFormData({ ...formData, sportConfigs: newConfigs });
                                              }}
                                            >
                                              {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                          </td>
                                          <td>
                                            <select
                                              className="pg-select"
                                              value={slot.end}
                                              onChange={e => {
                                                const newConfigs = { ...formData.sportConfigs };
                                                const sportSlots = [...newConfigs[activeKey].slots];
                                                sportSlots[i].end = e.target.value;
                                                newConfigs[activeKey] = { ...newConfigs[activeKey], slots: sportSlots };
                                                setFormData({ ...formData, sportConfigs: newConfigs });
                                              }}
                                            >
                                              {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                              <option value="23:59">12:00 AM</option>
                                            </select>
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              className="pg-input"
                                              value={slot.price}
                                              onChange={e => {
                                                const newConfigs = { ...formData.sportConfigs };
                                                const sportSlots = [...newConfigs[activeKey].slots];
                                                sportSlots[i].price = e.target.value;
                                                newConfigs[activeKey] = { ...newConfigs[activeKey], slots: sportSlots };
                                                setFormData({ ...formData, sportConfigs: newConfigs });
                                              }}
                                            />
                                          </td>
                                          <td>
                                            <select
                                              className="pg-select"
                                              value={slot.type}
                                              onChange={e => {
                                                const newConfigs = { ...formData.sportConfigs };
                                                const sportSlots = [...newConfigs[activeKey].slots];
                                                sportSlots[i].type = e.target.value;
                                                newConfigs[activeKey] = { ...newConfigs[activeKey], slots: sportSlots };
                                                setFormData({ ...formData, sportConfigs: newConfigs });
                                              }}
                                            >
                                              <option value="regular">Regular</option>
                                              <option value="peak">Peak</option>
                                              <option value="off_peak">Off-peak</option>
                                            </select>
                                          </td>
                                          <td><button type="button" className="pg-btn-ghost flex items-center justify-center" onClick={() => removeSlot(i)}><X size={14} /></button></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <button type="button" className="pg-add-slot" onClick={addSlot}>+ Add Another Slot</button>
                                </div>
                              </>
                            );
                          })()}
                        </>
                      )}

                    </div>
                  )}

                  {currentTab === 2 && (
                    <div>
                      <div className="pg-banner teal flex items-center gap-2"><Shield size={16} className="shrink-0" /> Ground Photos Verification: Upload real photos to pass AI check instantly.</div>
                      <div className="pg-card">
                        <div className="pg-section-title">Ground Photos</div>
                        <ImageUploader
                          images={formData.photos}
                          onChange={(newImages) => setFormData({ ...formData, photos: newImages })}
                          maxImages={10}
                        />
                        <div className="pg-section-desc" style={{ marginTop: 16 }}>Add at least 3 photos (Entrance, Field, Amenities)</div>
                      </div>

                      <div className="pg-banner purple flex items-center gap-2"><Video size={16} className="shrink-0" /> Walkthrough Video: Mandatory for verification of premium grounds.</div>
                      <div className="pg-card">
                        <div className="pg-section-title">Walkthrough Video</div>
                        <div className="pg-upload-zone purple flex flex-col items-center justify-center gap-2" onClick={() => document.getElementById("video-up").click()}>
                          <input id="video-up" type="file" hidden />
                          <Clapperboard size={32} className="text-purple" />
                          <div className="pg-section-title" style={{ fontSize: 16, color: "var(--purple)", margin: 0 }}>Click to upload video</div>
                          <div className="pg-section-desc">Max 60 seconds. Must show the entire field.</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTab === 3 && (
                    <div className="pg-grid" style={{ gridTemplateColumns: "1fr 300px" }}>
                      <div className="pg-card">
                        <div className="pg-banner teal" style={{ marginBottom: 32 }}>Your documents are encrypted and only accessible by verification admins.</div>
                        <div className="pg-section-title">Verification Documents</div>

                        <DocUploadRow
                          label="Property Ownership Proof"
                          desc="Rent Agreement or Sale Deed"
                          required
                          url={formData.docs.propertyProof}
                          onUpload={(e) => handleDocUpload(e, "propertyProof")}
                          error={attemptedSubmit && !formData.docs.propertyProof}
                        />

                        <DocUploadRow
                          label="Government ID (Owner)"
                          desc="Aadhaar or PAN Card"
                          url={formData.docs.govId}
                          onUpload={(e) => handleDocUpload(e, "govId")}
                        />

                        <DocUploadRow
                          label="Municipal Permission"
                          desc="Optional for private turfs"
                          url={formData.docs.municipal}
                          onUpload={(e) => handleDocUpload(e, "municipal")}
                        />

                        <DocUploadRow
                          label="Bank Details"
                          desc="Required for payouts (Cancelled Cheque)"
                          url={formData.docs.bank}
                          onUpload={(e) => handleDocUpload(e, "bank")}
                        />
                      </div>
                      <div className="pg-card" style={{ background: "#fcfdfe", height: "fit-content" }}>
                        <div className="pg-label" style={{ marginBottom: 16 }}>Verification Process</div>
                        {[
                          { step: "1", text: "Submit details & docs" },
                          { step: "2", text: "AI-powered checks" },
                          { step: "3", text: "Manual Admin Review" },
                          { step: "4", text: "Ground is Live!" }
                        ].map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? "var(--teal)" : "var(--border)", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.step}</div>
                            <div style={{ fontSize: 13, color: i === 0 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: 600 }}>{s.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <footer className="pg-footer">
            <button className="pg-btn pg-btn-ghost">Save as Draft</button>
            <div style={{ display: "flex", gap: 12 }}>
              {currentTab > 0 && <button className="pg-btn pg-btn-outline" onClick={handlePrev}>Previous</button>}
              <button
                className="pg-btn pg-btn-teal"
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : (currentTab === 3 ? <span className="flex items-center gap-1.5"><Rocket size={16} /> Submit for Verification</span> : "Next Step")}
              </button>
            </div>
          </footer>
        </div>
      </>
    </ProtectedRoute>
  );
}

function DocUploadRow({ label, desc, required, url, onUpload, error }) {
  const fileInputRef = useRef(null);

  return (
    <div className={`pg-doc-row ${error ? "pg-error" : ""}`}>
      <div>
        <div className="pg-label">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
          {required && <span className="ml-2 text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Required</span>}
          {!required && <span className="ml-2 text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Optional</span>}
        </div>
        <div className="pg-section-desc" style={{ marginBottom: 0 }}>{desc}</div>
        {url && <div className="text-[10px] text-teal-600 font-bold mt-1 truncate max-w-[200px]">File: {url.split('/').pop()}</div>}
      </div>

      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onUpload}
          accept=".pdf,.jpg,.jpeg,.png"
        />

        {url ? (
          <div className="flex items-center gap-3">
            <span className="pg-badge-uploaded flex items-center gap-1"><Check size={12} /> Uploaded</span>
            <button
              onClick={() => fileInputRef.current.click()}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            className="pg-btn pg-btn-outline"
            onClick={() => fileInputRef.current.click()}
            style={{ padding: "8px 20px", fontSize: 12 }}
          >
            Upload
          </button>
        )}
      </div>
    </div>
  );
}
