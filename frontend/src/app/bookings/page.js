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
  AlertCircle,
  X,
  CreditCard,
  User,
  CheckCircle2,
  Trophy
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookingsList, setBookingsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Customer");
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/bookings/my", {
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

  const filteredBookings = bookingsList.filter(booking => {
    const isPast = new Date(booking.start_time) < new Date();
    return activeTab === "upcoming" ? !isPast : isPast;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="pt-20 md:pt-32 pb-20 container mx-auto px-4 sm:px-6 max-w-5xl w-full flex-1">
        <div className="flex flex-col gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold outfit mb-2">My Bookings</h1>
            <p className="text-gray-400">Manage your games and upcoming sports sessions.</p>
          </div>

          <div className="flex bg-surface p-1.5 rounded-2xl border border-black/5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold smooth-transition ${activeTab === "upcoming" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
                }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold smooth-transition ${activeTab === "history" ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-secondary"
                }`}
            >
              History
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6 w-full">
            {[1, 2].map(i => (
              <div key={i} className="h-48 sm:h-64 bg-surface animate-pulse rounded-3xl w-full" />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-8">
            {filteredBookings.map(booking => (
              <BookingDetailCard key={booking.id} booking={booking} onShowReceipt={() => setSelectedReceipt(booking)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24 glass rounded-[40px] border border-black/5 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-secondary mb-2">No bookings found</h3>
            <p className="text-sm sm:text-base text-gray-400 max-w-xs mx-auto">You haven't booked any matches yet. Time to hit the turf!</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptModal key="receipt-modal" booking={selectedReceipt} userName={userName} onClose={() => setSelectedReceipt(null)} />
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt, #print-receipt * {
            visibility: visible;
          }
          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

function ReceiptModal({ booking, userName, onClose }) {
  const startTime = new Date(booking.start_time);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        id="print-receipt"
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.95, y: 20 }} 
        className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
      >
          {/* Header */}
          <div className="bg-primary p-6 text-white text-center relative shrink-0">
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center smooth-transition print-hide"
            >
              <X size={16} />
            </button>

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mt-1 mb-4">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Trophy className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight outfit text-white">
                Play<span className="text-white/70">Ground</span>
              </span>
            </div>

            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold outfit">Payment Receipt</h2>
            <p className="text-white/80 text-sm mt-1 mb-3">Booking Confirmed</p>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto">
            <div className="text-center mb-8">
              <p className="text-4xl font-extrabold text-secondary tracking-tight">₹{booking.total_price}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Total Amount Paid</p>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-sm font-semibold text-gray-500">Customer Name</span>
                <span className="text-sm font-bold text-secondary text-right">{userName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-sm font-semibold text-gray-500">Booking ID</span>
                <span className="text-sm font-bold text-secondary font-mono bg-surface px-2 py-1 rounded-lg">{booking.booking_id}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-sm font-semibold text-gray-500">Venue</span>
                <span className="text-sm font-bold text-secondary text-right">{booking.ground_name}</span>
              </div>

              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-sm font-semibold text-gray-500">Court/Arena</span>
                <span className="text-sm font-bold text-secondary text-right">{booking.court_name}</span>
              </div>

              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-sm font-semibold text-gray-500">Date</span>
                <span className="text-sm font-bold text-secondary text-right">{format(startTime, "MMM d, yyyy")}</span>
              </div>

              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <span className="text-sm font-semibold text-gray-500">Time</span>
                <span className="text-sm font-bold text-secondary text-right">
                  {format(startTime, "hh:mm a")} {booking.end_time && `- ${format(new Date(booking.end_time), "hh:mm a")}`}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2">
                <span className="text-sm font-semibold text-gray-500">Status</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-surface border-t border-black/5 shrink-0 flex gap-4 print-hide">
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-white border border-black/10 hover:border-primary/30 text-secondary font-bold py-3 rounded-2xl smooth-transition shadow-sm"
            >
              Print
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-primary text-white font-bold py-3 rounded-2xl hover:bg-primary-dark smooth-transition shadow-lg shadow-primary/20"
            >
              Done
            </button>
          </div>
        </motion.div>
    </motion.div>
  );
}

function BookingDetailCard({ booking, onShowReceipt }) {
  const startTime = new Date(booking.start_time);
  
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-black/5 overflow-hidden group hover:shadow-xl hover:shadow-black/5 smooth-transition p-4 sm:p-6">
      {/* Top row: Thumbnail + Ground Name + Status */}
      <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <img 
          src={booking.ground_image || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400"} 
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0" 
          alt={booking.ground_name} 
        />
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-bold outfit text-secondary truncate">{booking.ground_name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate mt-0.5">Booking ID: {booking.booking_id}</p>
          </div>
          <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Middle row: Date/Time + Court + Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-surface/50 p-4 rounded-2xl border border-black/5">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-black/5 shrink-0">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-secondary truncate">{format(startTime, "EEE, do MMM")}</p>
            <p className="text-xs text-gray-500 truncate">
              {format(startTime, "hh:mm a")}
              {booking.end_time && ` - ${format(new Date(booking.end_time), "hh:mm a")}`}
              <span className="mx-1">•</span>
              <span className="font-bold text-primary">{booking.court_name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-black/5 shrink-0">
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-secondary truncate">{booking.ground_address}</p>
            <button className="text-xs text-blue-500 font-bold flex items-center gap-1 mt-0.5 hover:underline">
              <Navigation className="w-3 h-3" /> Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Price + Actions */}
      <div className="flex flex-row items-center justify-between pt-4 border-t border-black/5 gap-4">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total Paid</p>
          <p className="text-lg sm:text-xl font-extrabold text-secondary">₹{booking.total_price}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={onShowReceipt}
            className="flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-xl bg-surface border border-black/5 text-gray-600 hover:bg-white hover:border-black/10 hover:shadow-sm smooth-transition"
            title="Download Receipt"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-bold">Receipt</span>
          </button>
          <button 
            className="flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-xl bg-surface border border-black/5 text-gray-600 hover:bg-white hover:border-black/10 hover:shadow-sm smooth-transition"
            title="Share Details"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-bold">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
