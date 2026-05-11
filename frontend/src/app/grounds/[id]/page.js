"use client";

import Navbar from "@/components/Navbar";
import SlotPicker from "@/components/SlotPicker";
import { MapPin, Star, Share2, Heart, ShieldCheck, Zap, Info, Trophy, Users, Wind } from "lucide-react";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { setHours, setMinutes, format } from "date-fns";

const ground = {
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
};

export default function GroundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedCourt, setSelectedCourt] = useState(ground.courts[0]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const allDaySlots = useMemo(() => {
    const slots = [];
    for (let i = 6; i < 24; i++) {
      const startTime = setMinutes(setHours(new Date(), i), 0);
      const isPeak = i >= 18; // Peak hours after 6 PM
      slots.push({
        id: `${selectedCourt.id}-${i}`,
        start_time: startTime.toISOString(),
        price: isPeak ? selectedCourt.base_price : Math.round(selectedCourt.base_price * 0.8),
        available: true
      });
    }
    return slots;
  }, [selectedCourt]);

  const handleBooking = () => {
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
                <img src={ground.images[0]} className="w-full h-full object-cover" alt="Ground" />
              </div>
              <div className="rounded-[40px] overflow-hidden">
                <img src={ground.images[1]} className="w-full h-full object-cover" alt="Ground" />
              </div>
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold outfit text-secondary mb-3">{ground.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{ground.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-secondary bg-primary/5 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{ground.rating}</span>
                    <span className="text-gray-400 font-medium">({ground.reviews} reviews)</span>
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
                {ground.amenities.map((item, i) => (
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
                {ground.courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => {
                      setSelectedCourt(court);
                      setSelectedSlots([]);
                    }}
                    className={`px-6 py-4 rounded-2xl border smooth-transition text-left min-w-[200px] ${
                      selectedCourt.id === court.id
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
                onSlotSelect={(slot) => {
                  setSelectedSlots(prev => 
                    prev.find(s => s.id === slot.id)
                      ? prev.filter(s => s.id !== slot.id)
                      : [...prev, slot]
                  )
                }}
                selectedSlots={selectedSlots}
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
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-xl ${
                    selectedSlots.length > 0
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
    </div>
  );
}
