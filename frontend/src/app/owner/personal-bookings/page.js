"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Calendar,
  Clock,
  Download,
  Share2,
  Navigation,
  X,
  Zap,
  Check,
  Activity,
  Search,
  Star,
  ChevronDown,
  Filter,
  Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, setHours, setMinutes } from "date-fns";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import SportIcon from "@/components/SportIcon";
import { useAuth } from "@/context/AuthContext";
import "../owner.css";

const AMENITIES_LIST = [
  "Floodlights", "Parking", "Changing Room", "Drinking Water", 
  "First Aid", "CCTV", "Cafe", "Power Backup", "Wi-Fi", "Locker"
];

export default function OwnerPersonalBookings() {
  const { token, user } = useAuth();
  const router = useRouter();
  
  // Navigation tabs between Explore view and My Bookings view
  const [currentView, setCurrentView] = useState("explore"); // "explore" or "bookings"
  
  // My Personal Bookings list states
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookingsList, setBookingsList] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Explore & filter states
  const [grounds, setGrounds] = useState([]);
  const [isLoadingExplore, setIsLoadingExplore] = useState(true);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [date, setDate] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isIndoor, setIsIndoor] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  const sports = ["all", "cricket", "football", "badminton", "pickleball", "tennis", "basketball", "volleyball"];

  // Direct Booking Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedGround, setSelectedGround] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [todayStr, setTodayStr] = useState("");
  const [maxBookingDate, setMaxBookingDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch my bookings for the personal bookings tab
  const fetchMyBookings = async (authToken) => {
    setIsLoadingBookings(true);
    try {
      const response = await fetch("/api/bookings/my", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookingsList(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyBookings(token);
    }
  }, [token]);

  useEffect(() => {
    const now = new Date();
    setTodayStr(format(now, "yyyy-MM-dd"));
    if (!selectedDate) {
      setSelectedDate(format(now, "yyyy-MM-dd"));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (todayStr && selectedGround) {
      const now = new Date(todayStr);
      const max = new Date(now);
      max.setDate(max.getDate() + (selectedGround.advance_booking_days || 7));
      setMaxBookingDate(format(max, "yyyy-MM-dd"));
    }
  }, [selectedGround, todayStr]);

  // Fetch grounds list based on search/filter constraints (just like Explore)
  const fetchGrounds = async () => {
    setIsLoadingExplore(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport !== "all") params.append("sport", selectedSport);
      if (search) params.append("search", search);
      if (date) params.append("date", date);
      params.append("min_price", priceRange[0]);
      params.append("max_price", priceRange[1]);
      if (selectedAmenities.length > 0) params.append("amenities", selectedAmenities.join(","));
      if (isIndoor !== null) params.append("is_indoor", isIndoor);
      params.append("sort_by", sortBy);

      const response = await fetch(`/api/grounds/?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGrounds(data);
      }
    } catch (err) {
      console.error("Error fetching grounds:", err);
    } finally {
      setIsLoadingExplore(false);
    }
  };

  useEffect(() => {
    fetchGrounds();
  }, [selectedSport, sortBy, isIndoor, selectedAmenities]);

  const handleApplyFilters = () => {
    fetchGrounds();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedSport("all");
    setDate("");
    setPriceRange([0, 5000]);
    setSelectedAmenities([]);
    setIsIndoor(null);
    setSortBy("newest");
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  // Open booking modal for a ground
  const handleOpenBookingModal = async (ground) => {
    setSelectedGround(ground);
    setSelectedSlots([]);
    setShowBookModal(true);
    
    // Fetch full ground details (with courts)
    try {
      const response = await fetch(`/api/grounds/${ground.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGround(data);
        if (data.courts && data.courts.length > 0) {
          setSelectedCourt(data.courts[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching ground details:", err);
    }
  };

  // Fetch booked slots when court or date changes in the booking modal
  useEffect(() => {
    if (!selectedCourt?.id || !selectedDate) return;
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`/api/bookings/booked-slots/${selectedCourt.id}`);
        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data);
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err);
      }
    };
    fetchBookedSlots();
  }, [selectedCourt?.id, selectedDate]);

  // Generate hourly time slots for the booking modal
  const allDaySlots = useMemo(() => {
    if (!selectedCourt || !selectedGround) return [];
    
    const dateObj = new Date(selectedDate);
    const dayOfWeek = format(dateObj, "EEE");
    
    const activeSport = (selectedCourt.sport_type || "").toLowerCase();
    const customSlots = (selectedGround.time_slots || []).filter(slot => {
      const isSportMatch = (slot.sport_type || "").toLowerCase() === activeSport;
      const isDayMatch = (slot.days || []).includes(dayOfWeek);
      return isSportMatch && isDayMatch;
    });

    const slots = [];

    if (customSlots.length > 0) {
      customSlots.forEach((slot, index) => {
        const [startH, startM] = slot.start_time.split(":").map(Number);
        const [endH, endM] = slot.end_time === "23:59" ? [24, 0] : slot.end_time.split(":").map(Number);

        for (let h = startH; h < endH; h++) {
          let startTime = setHours(dateObj, h);
          startTime = setMinutes(startTime, 0);
          startTime.setSeconds(0);
          startTime.setMilliseconds(0);
          
          let endTime = setHours(dateObj, h + 1);
          endTime = setMinutes(endTime, 0);
          endTime.setSeconds(0);
          endTime.setMilliseconds(0);
          
          const startTimeISO = startTime.toISOString();
          const endTimeISO = endTime.toISOString();
          const isBooked = bookedSlots.includes(startTimeISO);
          const isPast = startTime < new Date();
          
          slots.push({
            id: `${selectedCourt.id}-${h}-${index}`,
            start_time: startTimeISO,
            end_time: endTimeISO,
            price: slot.price_per_hour,
            status: isBooked ? "booked" : isPast ? "past" : "available",
            available: !isBooked && !isPast
          });
        }
      });
    } else {
      for (let i = 6; i < 24; i++) {
        let startTime = setHours(dateObj, i);
        startTime = setMinutes(startTime, 0);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
        
        const endTime = setHours(dateObj, i + 1);
        endTime.setMinutes(0);
        endTime.setSeconds(0);
        endTime.setMilliseconds(0);
        
        const startTimeISO = startTime.toISOString();
        const endTimeISO = endTime.toISOString();
        const isPeak = i >= 18;
        const isBooked = bookedSlots.includes(startTimeISO);
        const isPast = startTime < new Date();
        
        slots.push({
          id: `${selectedCourt.id}-${i}`,
          start_time: startTimeISO,
          end_time: endTimeISO,
          price: isPeak ? selectedCourt.base_price : Math.round(selectedCourt.base_price * 0.8),
          status: isBooked ? "booked" : isPast ? "past" : "available",
          available: !isBooked && !isPast
        });
      }
    }

    return slots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [selectedCourt, selectedGround, bookedSlots, selectedDate]);

  const handleSelectSlot = (slot) => {
    if (!slot.available) return;
    if (selectedSlots.find(s => s.start_time === slot.start_time)) {
      setSelectedSlots(selectedSlots.filter(s => s.start_time !== slot.start_time));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSlots.length === 0) return;
    
    // Check if the ground is owned by this owner
    const isOwnGround = selectedGround.owner_id === user?.id;

    if (isOwnGround) {
      // Direct, free scheduling with no checkout required for their own ground
      setIsSubmitting(true);
      try {
        const currentToken = localStorage.getItem("token") || token;
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`
          },
          body: JSON.stringify({
            ground_id: selectedGround.id,
            court_id: selectedCourt.id,
            slots: selectedSlots.map(s => s.start_time),
            total_price: 0 // Free for owner's own ground scheduling
          })
        });

        if (response.ok) {
          alert("Booking created successfully!");
          setShowBookModal(false);
          // Reset states
          setSelectedGround(null);
          setSelectedCourt(null);
          setSelectedSlots([]);
          // Sync my bookings
          fetchMyBookings(token);
          // Navigate to my bookings tab
          setCurrentView("bookings");
        } else {
          const errData = await response.json();
          alert(errData.detail || "Failed to create booking");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred during booking. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Booking someone else's ground -> Redirect to secure payment checkout flow!
      const bookingData = {
        ground: {
          id: selectedGround.id,
          name: selectedGround.name,
          images: [selectedGround.images?.[0] || ""],
          location: selectedGround.location
        },
        court: {
          id: selectedCourt.id,
          name: selectedCourt.name,
          sport_type: selectedCourt.sport_type
        },
        slots: selectedSlots,
        totalPrice: selectedSlots.reduce((sum, s) => sum + s.price, 0)
      };

      try {
        localStorage.setItem("pending_booking", JSON.stringify(bookingData));
        setShowBookModal(false);
        router.push("/checkout");
      } catch (err) {
        localStorage.clear();
        localStorage.setItem("token", token);
        localStorage.setItem("pending_booking", JSON.stringify(bookingData));
        setShowBookModal(false);
        router.push("/checkout");
      }
    }
  };

  const filteredBookingsList = bookingsList.filter(booking => {
    const isPast = new Date(booking.start_time) < new Date();
    return activeTab === "upcoming" ? !isPast : isPast;
  });

  return (
    <ProtectedRoute role="owner">
      <div className="pg-body">
        <OwnerSidebar />
        
        <main className="pg-main">
          {/* Topbar Context */}
          <div className="pg-topbar">
            <div className="pg-breadcrumb">Owner Panel › <span>Personal Reservations</span></div>
            <div className="pg-topbar-right">
              <div className="pg-status-chip"><div className="pg-pulse" /> Live Catalog</div>
            </div>
          </div>

          <div className="pg-container">
            {/* Header Title and View Switcher Tabs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 20, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Personal Bookings</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Explore verified arenas and reserve slots instantly without leaving the dashboard.</p>
              </div>

              {/* View Selector Tabs */}
              <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 6, borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)", alignItems: "center" }}>
                <button
                  onClick={() => setCurrentView("explore")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    border: "none",
                    background: currentView === "explore" ? "white" : "transparent",
                    color: currentView === "explore" ? "#0f172a" : "#64748b",
                    boxShadow: currentView === "explore" ? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)" : "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                >
                  Explore & Book
                </button>
                <button
                  onClick={() => setCurrentView("bookings")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    border: "none",
                    background: currentView === "bookings" ? "white" : "transparent",
                    color: currentView === "bookings" ? "#0f172a" : "#64748b",
                    boxShadow: currentView === "bookings" ? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)" : "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                >
                  My Bookings ({bookingsList.length})
                </button>
              </div>
            </div>

            {/* TAB VIEW 1: EXPLORE SECTION (Mirroring the user panel /explore page exactly) */}
            {currentView === "explore" && (
              <div style={{ width: "100%" }}>
                {/* Search bar & Sort dropdown */}
                <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                  <div style={{ flexGrow: 1, position: "relative" }}>
                    <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
                    <input 
                      type="text"
                      placeholder="Search by name, city or location..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                      style={{ width: "100%", padding: "16px 20px 16px 48px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 13, fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ position: "relative", minWidth: 180 }}>
                    <select 
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      style={{ width: "100%", appearance: "none", padding: "16px 40px 16px 20px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 800, cursor: "pointer", background: "white" }}
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="rating">Sort: Best Rated</option>
                      <option value="price_asc">Sort: Price Low-High</option>
                      <option value="price_desc">Sort: Price High-Low</option>
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  </div>
                </div>

                <h3 className="pg-section-title" style={{ fontSize: 16, marginBottom: 20 }}>Found {grounds.length} Grounds</h3>

                {isLoadingExplore ? (
                  <div className="pg-grid pg-grounds-grid" style={{ gap: 24 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="pg-card animate-pulse" style={{ height: 340, padding: 0 }}>
                        <div style={{ height: 180, background: "#f1f5f9" }} />
                        <div style={{ padding: 20 }} className="space-y-4">
                          <div className="h-6 w-3/4 bg-slate-200 rounded" />
                          <div className="h-4 w-1/2 bg-slate-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : grounds.length > 0 ? (
                  <div className="pg-grid pg-grounds-grid" style={{ gap: 24 }}>
                    {grounds.map(ground => (
                      <motion.div
                        key={ground.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <OwnerGroundCard ground={ground} onBook={handleOpenBookingModal} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="pg-card" style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ color: "var(--text-muted)", marginBottom: 16 }}><Trophy size={48} /></div>
                    <h3 className="pg-section-title">No grounds found</h3>
                    <p className="pg-section-desc">Try adjusting your search query to explore other arenas.</p>
                    <button onClick={handleClearFilters} className="pg-btn pg-btn-teal" style={{ display: "inline-block", textDecoration: "none", marginTop: 12 }}>Reset Search</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 2: MY BOOKINGS SECTION (Listing the owner's active reservations history) */}
            {currentView === "bookings" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
                  <div className="flex bg-surface p-1 rounded-2xl border border-black/5" style={{ background: "#f1f5f9" }}>
                    <button
                      onClick={() => setActiveTab("upcoming")}
                      className={`px-5 py-2 rounded-xl text-xs font-bold smooth-transition ${activeTab === "upcoming" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"}`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`px-5 py-2 rounded-xl text-xs font-bold smooth-transition ${activeTab === "history" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"}`}
                    >
                      History
                    </button>
                  </div>
                </div>

                {isLoadingBookings ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                    <Activity className="animate-spin text-teal-500" size={36} />
                  </div>
                ) : filteredBookingsList.length > 0 ? (
                  <div className="pg-grid" style={{ gridTemplateColumns: "1fr", gap: 24, marginBottom: 32 }}>
                    {filteredBookingsList.map(booking => (
                      <OwnerBookingDetailCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <div className="pg-card" style={{ textAlign: "center", padding: "80px 20px", borderStyle: "dashed" }}>
                    <div style={{ color: "var(--text-muted)", marginBottom: 16 }}><Building2 size={48} /></div>
                    <h3 className="pg-section-title">No Bookings Found</h3>
                    <p className="pg-section-desc">You haven't scheduled any personal games yet.</p>
                    <button onClick={() => setCurrentView("explore")} className="pg-btn pg-btn-teal" style={{ display: "inline-block", textDecoration: "none" }}>Browse Grounds</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

        {/* Direct Booking Modal (Opens when an owner clicks on any explore card) */}
        <AnimatePresence>
          {showBookModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => {
                  setShowBookModal(false);
                  setSelectedGround(null);
                  setSelectedCourt(null);
                  setSelectedSlots([]);
                }} 
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 200 }} 
              />
              <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none", padding: 24 }}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                  style={{ width: "100%", maxWidth: 650, background: "white", borderRadius: 32, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", pointerEvents: "auto", display: "flex", flexDirection: "column", gap: 24 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 className="pg-section-title" style={{ marginBottom: 4 }}>Book {selectedGround?.name}</h2>
                      <p className="pg-section-desc" style={{ marginBottom: 0 }}>Direct scheduling and venue slot reservation.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowBookModal(false);
                        setSelectedGround(null);
                        setSelectedCourt(null);
                        setSelectedSlots([]);
                      }} 
                      style={{ border: "none", background: "none", cursor: "pointer", padding: 8, borderRadius: "50%", background: "#f8fafc" }}
                    >
                      <X size={20} className="text-secondary" />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {selectedGround && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {/* Select Court */}
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 block ml-1">Select Court</label>
                          <select
                            value={selectedCourt?.id || ""}
                            onChange={(e) => {
                              const c = selectedGround.courts.find(x => x.id === e.target.value);
                              setSelectedCourt(c);
                              setSelectedSlots([]);
                            }}
                            className="w-full p-4 rounded-2xl bg-gray-50 border border-black/5 text-sm font-bold outline-none focus:border-teal-300 smooth-transition"
                            style={{ width: "100%", padding: 16, border: "1px solid var(--border)", borderRadius: 16, outline: "none", fontSize: 13, fontWeight: 700 }}
                          >
                            {selectedGround.courts?.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.sport_type.toUpperCase()})</option>
                            ))}
                          </select>
                        </div>

                        {/* Select Date */}
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 block ml-1">Select Date</label>
                          <input
                            type="date"
                            min={todayStr || undefined}
                            max={maxBookingDate || undefined}
                            value={selectedDate}
                            onChange={(e) => {
                              setSelectedDate(e.target.value);
                              setSelectedSlots([]);
                            }}
                            className="w-full p-4 rounded-2xl bg-gray-50 border border-black/5 text-sm font-bold outline-none focus:border-teal-300 smooth-transition"
                            style={{ width: "100%", padding: 16, border: "1px solid var(--border)", borderRadius: 16, outline: "none", fontSize: 13, fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedCourt && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Pick Time Slots</label>
                          <span style={{ fontSize: 10, background: "#f0fdfa", px: 8, py: 2, border: "1px solid #99f6e4", borderRadius: 6, color: "#0d9488", fontWeight: 700 }}>
                            {allDaySlots.filter(s => s.available).length} AVAILABLE
                          </span>
                        </div>
                        
                        {allDaySlots.length > 0 ? (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                            {allDaySlots.map(slot => {
                              const isSelected = selectedSlots.some(s => s.start_time === slot.start_time);
                              return (
                                <button
                                  key={slot.id}
                                  disabled={!slot.available}
                                  onClick={() => handleSelectSlot(slot)}
                                  style={{
                                    padding: 12,
                                    borderRadius: 12,
                                    border: isSelected ? "1px solid var(--teal)" : "1px solid var(--border)",
                                    background: !slot.available ? "#f8fafc" : isSelected ? "var(--teal)" : "white",
                                    color: !slot.available ? "#cbd5e1" : isSelected ? "white" : "var(--text-primary)",
                                    cursor: !slot.available ? "not-allowed" : "pointer",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 2,
                                    transition: "all 0.2s"
                                  }}
                                >
                                  <span>{format(new Date(slot.start_time), "hh:mm a")}</span>
                                  <span style={{ fontSize: 9, opacity: 0.8 }}>₹{slot.price}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", background: "#f8fafc", borderRadius: 16 }}>No slots available for this day.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedSlots.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdfa", padding: "16px 20px", borderRadius: 16, border: "1px solid #99f6e4" }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", textTransform: "uppercase" }}>Session Subtotal</p>
                        <p style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>{selectedSlots.length} slot(s) selected</p>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 800, color: "#0d9488" }}>₹{selectedSlots.reduce((sum, s) => sum + s.price, 0)}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button 
                      disabled={selectedSlots.length === 0 || isSubmitting}
                      onClick={handleConfirmBooking}
                      className="pg-btn pg-btn-teal"
                      style={{ 
                        flex: 1, 
                        height: 48, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: 8, 
                        opacity: (selectedSlots.length === 0 || isSubmitting) ? 0.5 : 1,
                        cursor: (selectedSlots.length === 0 || isSubmitting) ? "not-allowed" : "pointer"
                      }}
                    >
                      <Zap size={16} />
                      {isSubmitting ? "Processing..." : selectedSlots.length > 0 ? "Book Ground Instantly" : "Select Slots to Book"}
                    </button>
                    <button 
                      onClick={() => {
                        setShowBookModal(false);
                        setSelectedGround(null);
                        setSelectedCourt(null);
                        setSelectedSlots([]);
                      }}
                      className="pg-btn pg-btn-outline"
                      style={{ height: 48 }}
                    >
                      Cancel
                    </button>
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

// Ground card component inside owner personal explore dashboard
function OwnerGroundCard({ ground, onBook }) {
  const imageUrl = ground.images?.[0]
    ? (ground.images[0].startsWith('http') || ground.images[0].startsWith('data:')
        ? ground.images[0]
        : `${ground.images[0]}`)
    : "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop";

  return (
    <div 
      onClick={() => onBook(ground)}
      className="pg-card group"
      style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: 20, transition: "all 0.3s ease" }}
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img 
          src={imageUrl} 
          alt={ground.name} 
          className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
        />
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {ground.status === 'verified' && (
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1 border border-teal-100">
              <Check size={12} /> Verified
            </div>
          )}
        </div>
        
        <div className="absolute bottom-4 right-4 z-20 bg-primary text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20">
          From ₹{ground.min_price || 0}/hr
        </div>
      </div>
      
      <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <h3 className="text-lg font-extrabold text-secondary line-clamp-1" style={{ margin: 0 }}>{ground.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-700">{ground.avg_rating?.toFixed(1) || "5.0"}</span>
            <span className="text-[10px] text-yellow-600/60 font-medium">({ground.review_count || 0})</span>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", marginBottom: 16 }}>
          <MapPin className="w-3.5 h-3.5 text-primary" style={{ shrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ground.location?.city}, {ground.location?.address}
          </span>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {ground.sports?.map(sport => (
              <span key={sport} title={sport} style={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <SportIcon sport={sport} size={18} />
              </span>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#0d9488", textTransform: "uppercase", background: "rgba(13,148,136,0.08)", padding: "6px 12px", borderRadius: 8, letterSpacing: "0.05em" }}>
            {ground.is_indoor ? 'Indoor' : 'Outdoor'}
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerBookingDetailCard({ booking }) {
  const startTime = new Date(booking.start_time);

  return (
    <div className="pg-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "row" }}>
      {/* Left: Image & Quick Info */}
      <div style={{ width: "30%", position: "relative", minHeight: 220, backgroundColor: "#0f172a" }}>
        <img 
          src={booking.ground_image || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400"} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
        <div style={{ position: "absolute", inset: 0, bg: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-teal-500 text-white">{booking.status}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>{booking.booking_id}</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{booking.ground_name}</h3>
        </div>
      </div>

      {/* Right: Details & Actions */}
      <div style={{ width: "70%", padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Main Info */}
          <div>
            <p style={{ fontSize: 9, color: "var(--text-muted)", uppercase: true, fontWeight: 700, trackingWidest: 0.1, marginBottom: 12 }}>Time & Arena</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ padding: 10, background: "#f8fafc", borderRadius: 12, border: "1px solid var(--border)", color: "var(--teal)" }}>
                <Clock size={20} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{format(startTime, "EEE, do MMM")}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {format(startTime, "hh:mm a")}
                  {booking.end_time && ` - ${format(new Date(booking.end_time), "hh:mm a")}`}
                </p>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", margin: "4px 0 0" }}>
                  {booking.court_name}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <p style={{ fontSize: 9, color: "var(--text-muted)", uppercase: true, fontWeight: 700, trackingWidest: 0.1, marginBottom: 12 }}>Location</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ padding: 10, background: "#f8fafc", borderRadius: 12, border: "1px solid var(--border)", color: "#3b82f6" }}>
                <MapPin size={20} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{booking.ground_address}</p>
                <button 
                  onClick={() => alert(`Directions to: ${booking.ground_address}`)}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#3b82f6", marginTop: 4, padding: 0 }}
                >
                  <Navigation size={12} /> Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 20, borderTop: "1px solid var(--border)", marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
             Price Paid: <span style={{ color: "var(--teal)" }}>₹{booking.total_price}</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="pg-btn pg-btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 12 }}>
              <Download size={14} /> Receipt
            </button>
            <button className="pg-btn pg-btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 12 }}>
              <Share2 size={14} /> Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
