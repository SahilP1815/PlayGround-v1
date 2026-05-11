"use client";

import Navbar from "@/components/Navbar";
import SlotPicker from "@/components/SlotPicker";
import { MapPin, Star, Share2, Heart, ShieldCheck, Zap, Info, Trophy, Users, Wind, Lock, ArrowRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { setHours, setMinutes, format } from "date-fns";

const mockGrounds = [
  {
    id: "1",
    name: "Elite Sports Arena",
    rating: 4.8,
    reviews: 124,
    location: { address: "Satellite, Ahmedabad", city: "Ahmedabad" },
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200",
      "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=1200"
    ],
    amenities: [
      { icon: <Wind className="w-4 h-4" />, name: "Floodlights" },
      { icon: <ShieldCheck className="w-4 h-4" />, name: "First Aid" },
      { icon: <Users className="w-4 h-4" />, name: "Changing Rooms" },
      { icon: <Trophy className="w-4 h-4" />, name: "Canteen" }
    ],
    courts: [
      { id: "c1", name: "Champions Turf (7v7)", sport_type: "football", base_price: 1500 },
      { id: "c2", name: "Premier Box (6v6)", sport_type: "cricket", base_price: 1200 }
    ]
  },
  {
    id: "2",
    name: "Victory Turf",
    rating: 4.6,
    reviews: 89,
    location: { address: "SG Highway, Ahmedabad", city: "Ahmedabad" },
    images: [
      "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=1200",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200"
    ],
    amenities: [
      { icon: <Wind className="w-4 h-4" />, name: "Floodlights" },
      { icon: <ShieldCheck className="w-4 h-4" />, name: "First Aid" },
      { icon: <Users className="w-4 h-4" />, name: "Changing Rooms" }
    ],
    courts: [
      { id: "c3", name: "Victory Main (6v6)", sport_type: "cricket", base_price: 1000 }
    ]
  },
  {
    id: "3",
    name: "Smash Badminton Club",
    rating: 4.9,
    reviews: 256,
    location: { address: "Prahlad Nagar, Ahmedabad", city: "Ahmedabad" },
    images: [
      "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=1200",
      "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=1200"
    ],
    amenities: [
      { icon: <Wind className="w-4 h-4" />, name: "AC" },
      { icon: <ShieldCheck className="w-4 h-4" />, name: "Pro Shop" },
      { icon: <Users className="w-4 h-4" />, name: "Coaching" }
    ],
    courts: [
      { id: "c4", name: "Court 1 (Wood)", sport_type: "badminton", base_price: 400 },
      { id: "c5", name: "Court 2 (Synthetic)", sport_type: "badminton", base_price: 450 }
    ]
  }
];

export default function GroundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const currentGround = useMemo(() => {
    return mockGrounds.find(g => g.id === id) || mockGrounds[0];
  }, [id]);

  const [selectedCourt, setSelectedCourt] = useState(currentGround.courts[0]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Reset selected court when ground changes
  useEffect(() => {
    setSelectedCourt(currentGround.courts[0]);
    setSelectedSlots([]);
  }, [currentGround]);

  const allDaySlots = useMemo(() => {
    const slots = [];
    for (let i = 6; i < 24; i++) {
      const startTime = setMinutes(setHours(new Date(), i), 0);
      const isPeak = i >= 18; // Peak hours after 6 PM
      slots.push({
        id: `${selectedCourt.id}-${i}`,
        start_time: startTime.toISOString(),
        price: isPeak ? selectedCourt.base_price : Math.round(selectedCourt.base_price * 0.8),
        status: "available",
        available: true
      });
    }
    return slots;
  }, [selectedCourt]);

  const handleBooking = () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const bookingData = {
      ground: currentGround,
      court: selectedCourt,
      slots: selectedSlots,
      totalBasePrice: selectedSlots.reduce((sum, s) => sum + s.price, 0)
    };
    localStorage.setItem("pending_booking", JSON.stringify(bookingData));
    router.push("/checkout");
  };

  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-28 container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-4 h-[400px]">
              <div className="rounded-[40px] overflow-hidden">
                <img src={currentGround.images[0]} className="w-full h-full object-cover" alt="Ground" />
              </div>
              <div className="rounded-[40px] overflow-hidden">
                <img src={currentGround.images[1]} className="w-full h-full object-cover" alt="Ground" />
              </div>
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold outfit text-secondary mb-3">{currentGround.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{currentGround.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-secondary bg-primary/5 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{currentGround.rating}</span>
                    <span className="text-gray-400 font-medium">({currentGround.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-2xl border border-black/5 hover:bg-surface smooth-transition">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-3 rounded-2xl border border-black/5 hover:bg-surface smooth-transition">
                  <Heart className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold outfit text-secondary mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Features & Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentGround.amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-black/5 group hover:border-primary/20 smooth-transition">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white smooth-transition">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection */}
            <div>
              <h2 className="text-xl font-bold outfit text-secondary mb-6">Select Court</h2>
              <div className="flex gap-4">
                {currentGround.courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => {
                      setSelectedCourt(court);
                      setSelectedSlots([]);
                    }}
                    className={`px-6 py-4 rounded-2xl border smooth-transition text-left min-w-[200px] ${selectedCourt.id === court.id
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                      : "border-black/5 hover:border-primary/20 bg-white"
                      }`}
                  >
                    <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${selectedCourt.id === court.id ? "text-primary" : "text-gray-400"}`}>
                      {court.sport_type}
                    </p>
                    <p className="font-bold text-secondary">{court.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="glass p-8 rounded-[40px] border border-black/5 shadow-2xl shadow-black/5 sticky top-28">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-secondary">Book Your Slot</h3>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">18 Slots Available</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Choose time slots for {selectedCourt.name}</p>
              </div>

              <SlotPicker
                slots={allDaySlots}
                multiSelect={true}
                onSelect={(selectedObjects) => {
                  setSelectedSlots(selectedObjects);
                }}
              />

              <div className="mt-8 pt-8 border-t border-black/5 space-y-4">
                {selectedSlots.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">{selectedSlots.length} Slots Selected</span>
                    <span className="text-xl font-bold text-secondary">₹{totalAmount}</span>
                  </div>
                )}

                <button
                  disabled={selectedSlots.length === 0}
                  onClick={handleBooking}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-xl ${selectedSlots.length > 0
                    ? "bg-primary hover:bg-primary-dark text-white shadow-primary/20"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-black/5"
                    }`}
                >
                  <Zap className="w-5 h-5" />
                  {selectedSlots.length > 0 ? "Book Now" : "Select Slots to Book"}
                </button>

                <div className="flex items-center gap-2 justify-center py-2 px-4 bg-amber-50 rounded-xl border border-amber-100/50">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Save 20% by booking before 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login Modal Popup */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass max-w-sm w-full p-10 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white outfit">Login Required</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              You must login to book the slot and secure your match. Join our community of players today!
            </p>
            <div className="pt-4 space-y-3">
              <button 
                onClick={() => router.push("/login")}
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-lg shadow-primary/20"
              >
                Login Now <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full py-4 text-gray-400 hover:text-white font-bold smooth-transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
