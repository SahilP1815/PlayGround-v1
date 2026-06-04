"use client";

import Navbar from "@/components/Navbar";
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Download, 
  ArrowRight,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

export default function BookingConfirmationPage() {
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("last_booking");
    if (data) {
      setBooking(JSON.parse(data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {user?.role !== "owner" ? (
        <Navbar />
      ) : (
        <div className="absolute top-8 left-8">
          <Link href="/owner/personal-bookings" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-secondary smooth-transition bg-white px-4 py-2 rounded-xl border border-black/5 shadow-sm">
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Explore
          </Link>
        </div>
      )}

      <main className={`${user?.role !== "owner" ? "pt-32" : "pt-24"} pb-20 container mx-auto px-6 flex flex-col items-center text-secondary`}>
        {/* Success Animation */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative"
        >
          <CheckCircle2 className="w-12 h-12 text-primary" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-primary/30 rounded-full"
          />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold outfit mb-4 text-center">Booking Confirmed!</h1>
        <p className="text-gray-400 text-lg mb-12 text-center max-w-md">
          Your slot is secured. Get ready to play! You can find your booking details below.
        </p>

        {/* Ticket Card */}
        {booking && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl w-full glass rounded-[48px] border border-black/5 overflow-hidden shadow-2xl shadow-black/10"
          >
            {/* Top Section */}
            <div className="bg-secondary p-10 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Trophy className="w-32 h-32" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Venue Secured</p>
              <h2 className="text-3xl font-bold outfit mb-1">{booking.ground.name}</h2>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{booking.ground.location.address}</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date</p>
                  <div className="flex items-center gap-2 text-secondary font-bold">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(new Date(booking.slots[0].start_time), "EEEE, do MMM")}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Time</p>
                  <div className="flex items-center gap-2 text-secondary font-bold">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{booking.slots.map(s => format(new Date(s.start_time), "hh:mm a")).join(", ")}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Arena & Court</p>
                <p className="font-bold text-secondary">{booking.court.name} • {booking.court.sport_type}</p>
              </div>

              {/* Separator dots */}
              <div className="flex items-center gap-2">
                <div className="h-px bg-black/5 flex-1" />
                <div className="w-2 h-2 rounded-full bg-black/10" />
                <div className="h-px bg-black/5 flex-1" />
              </div>

              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  <Download className="w-4 h-4" /> Download Receipt
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  <Share2 className="w-4 h-4" /> Share with Squad
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <div className="mt-16 flex flex-col md:flex-row gap-4">
          <Link 
            href={user?.role === "owner" ? "/owner/personal-bookings" : "/bookings"}
            className="px-10 py-4 rounded-2xl bg-white border border-black/5 font-bold text-secondary hover:bg-surface smooth-transition flex items-center justify-center gap-2"
          >
            Manage Bookings
          </Link>
          <Link 
            href={user?.role === "owner" ? "/owner/dashboard" : "/"}
            className="px-10 py-4 rounded-2xl bg-secondary text-white font-bold hover:bg-primary smooth-transition flex items-center justify-center gap-2 shadow-xl shadow-black/10"
          >
            {user?.role === "owner" ? "Back to Dashboard" : "Back to Home"} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
