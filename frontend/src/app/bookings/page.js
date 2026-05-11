"use client";

import Navbar from "@/components/Navbar";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Download, 
  Share2, 
  CloudRain, 
  Navigation,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

const bookings = [
  {
    id: "BK-7294X01",
    ground: "Elite Sports Arena",
    court: "Champions Turf (7v7)",
    date: "Sun, 12th Oct",
    time: "06:00 PM - 07:00 PM",
    location: "Satellite, Ahmedabad",
    price: 1545,
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400",
    weather: "Clear Skies (28°C)",
    cancellationLimit: "12 hours before"
  },
  {
    id: "BK-8102Y05",
    ground: "Victory Turf",
    court: "Power Play Box",
    date: "Wed, 15th Oct",
    time: "08:00 PM - 09:00 PM",
    location: "SG Highway, Ahmedabad",
    price: 1000,
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=400",
    weather: "Chance of Rain (24°C)",
    cancellationLimit: "6 hours before"
  }
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-32 pb-20 container mx-auto px-6 max-w-5xl flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold outfit mb-2">My Bookings</h1>
            <p className="text-gray-400">Manage your games and upcoming sports sessions.</p>
          </div>
          
          <div className="flex bg-surface p-1.5 rounded-2xl border border-black/5">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold smooth-transition ${
                activeTab === "upcoming" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold smooth-transition ${
                activeTab === "history" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === "upcoming" ? (
          <div className="space-y-8">
            {bookings.map(booking => (
              <BookingDetailCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[40px] border border-black/5">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">No past history</h3>
            <p className="text-gray-400">You haven't played any matches yet. Time to hit the turf!</p>
          </div>
        )}
      </main>
    </div>
  );
}

function BookingDetailCard({ booking }) {
  return (
    <div className="glass rounded-[40px] border border-black/5 overflow-hidden group hover:shadow-2xl hover:shadow-black/5 smooth-transition">
      <div className="flex flex-col lg:flex-row">
        {/* Left: Image & Quick Info */}
        <div className="lg:w-1/3 relative h-64 lg:h-auto">
          <img src={booking.image} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Confirmed</span>
               <span className="text-[10px] font-medium text-white/80">{booking.id}</span>
            </div>
            <h3 className="text-2xl font-bold outfit">{booking.ground}</h3>
          </div>
        </div>

        {/* Right: Details & Actions */}
        <div className="lg:w-2/3 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Main Info */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3">Time & Arena</p>
                <div className="flex items-center gap-4 text-secondary">
                  <div className="bg-surface p-2.5 rounded-xl border border-black/5">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{booking.date}</p>
                    <p className="text-sm text-gray-500">{booking.time}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-primary-dark ml-14">{booking.court}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3">Location</p>
                <div className="flex items-center gap-4 text-secondary">
                  <div className="bg-surface p-2.5 rounded-xl border border-black/5">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold">{booking.location}</p>
                    <button className="text-sm text-blue-500 font-bold flex items-center gap-1 mt-1 hover:underline">
                      <Navigation className="w-3 h-3" /> Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-black/5">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold hover:bg-surface smooth-transition">
                <Download className="w-4 h-4 text-gray-500" /> Receipt
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold hover:bg-surface smooth-transition">
                <Share2 className="w-4 h-4 text-gray-500" /> Invite
              </button>
            </div>
            <button className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-primary smooth-transition shadow-lg shadow-black/5">
              View Booking <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
