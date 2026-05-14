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
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookingsList, setBookingsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:8000/api/bookings/my", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setBookingsList(data);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

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
              className={`px-6 py-2.5 rounded-xl text-sm font-bold smooth-transition ${activeTab === "upcoming" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
                }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold smooth-transition ${activeTab === "history" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
                }`}
            >
              History
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-surface animate-pulse rounded-[40px]" />
            ))}
          </div>
        ) : bookingsList.length > 0 ? (
          <div className="space-y-8">
            {bookingsList.map(booking => (
              <BookingDetailCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[40px] border border-black/5">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">No bookings found</h3>
            <p className="text-gray-400">You haven't booked any matches yet. Time to hit the turf!</p>
          </div>
        )}
      </main>
    </div>
  );
}

function BookingDetailCard({ booking }) {
  const startTime = new Date(booking.start_time);

  return (
    <div className="glass rounded-[40px] border border-black/5 overflow-hidden group hover:shadow-2xl hover:shadow-black/5 smooth-transition">
      <div className="flex flex-col lg:flex-row">
        {/* Left: Image & Quick Info */}
        <div className="lg:w-1/3 relative h-64 lg:h-auto">
          <img src={booking.ground_image || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{booking.status}</span>
              <span className="text-[10px] font-medium text-white/80">{booking.booking_id}</span>
            </div>
            <h3 className="text-2xl font-bold outfit">{booking.ground_name}</h3>
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
                    <p className="font-bold">{format(startTime, "EEE, do MMM")}</p>
                    <p className="text-sm text-gray-500">
                      {format(startTime, "hh:mm a")}
                      {booking.end_time && ` - ${format(new Date(booking.end_time), "hh:mm a")}`}
                    </p>
                    <p className="mt-1 text-xs font-bold text-primary uppercase tracking-tighter">
                      {booking.court_name}
                    </p>
                  </div>
                </div>
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
                    <p className="font-bold">{booking.ground_address}</p>
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
            <div className="flex gap-2 text-secondary font-bold">
               Price Paid: ₹{booking.total_price}
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold hover:bg-surface smooth-transition">
                <Download className="w-4 h-4 text-gray-500" /> Receipt
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold hover:bg-surface smooth-transition">
                <Share2 className="w-4 h-4 text-gray-500" /> Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
