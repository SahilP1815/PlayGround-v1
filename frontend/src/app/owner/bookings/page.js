"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import OwnerSidebar from "@/components/OwnerSidebar";
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  X,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OwnerBookings() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bookings = [
    {
      id: "BK-7214",
      customer: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 98765 43210",
      ground: "Masterstroke Turf",
      court: "Main Turf A",
      sport: "Football",
      date: "May 15, 2024",
      time: "06:00 PM - 07:00 PM",
      amount: "₹1,500",
      status: "Confirmed",
      payment: "Paid",
      bookedAt: "May 12, 10:30 AM"
    },
    {
      id: "BK-8392",
      customer: "Amit Patel",
      email: "amit@example.com",
      phone: "+91 99887 76655",
      ground: "Masterstroke Turf",
      court: "Box Cricket 1",
      sport: "Cricket",
      date: "May 15, 2024",
      time: "08:00 PM - 10:00 PM",
      amount: "₹2,400",
      status: "Confirmed",
      payment: "Paid",
      bookedAt: "May 13, 04:15 PM"
    },
    {
      id: "BK-9012",
      customer: "Vikram Singh",
      email: "vikram@example.com",
      phone: "+91 91234 56789",
      ground: "Masterstroke Turf",
      court: "Main Turf A",
      sport: "Football",
      date: "May 16, 2024",
      time: "07:00 AM - 08:00 AM",
      amount: "₹1,200",
      status: "Pending",
      payment: "Unpaid",
      bookedAt: "May 14, 09:00 PM"
    }
  ];

  const filteredBookings = bookings.filter(b => 
    b.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-x-hidden relative">
      <OwnerSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        hidden={isScrolled}
      />

      <div className={`flex-1 smooth-transition ${isScrolled ? "ml-0" : (sidebarCollapsed ? "ml-[78px]" : "ml-[272px]")}`}>
        <Navbar />
        
        <main className="pt-32 pb-20 max-w-6xl mx-auto px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[#0F172A] outfit mb-2">Bookings</h1>
              <p className="text-gray-400 font-medium text-lg">Manage all your ground reservations here.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary smooth-transition" />
                <input 
                  type="text" 
                  placeholder="Search by ID or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 smooth-transition shadow-sm"
                />
              </div>
              <button className="bg-white p-3 rounded-2xl border border-gray-100 text-gray-400 hover:text-primary smooth-transition shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-gray-50">
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Booking ID</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Customer</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Date & Slot</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Amount</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-gray-50/50 smooth-transition cursor-pointer group"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-8 py-6">
                        <span className="font-bold text-[#0F172A]">{booking.id}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{booking.bookedAt}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {booking.customer.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A]">{booking.customer}</p>
                            <p className="text-xs text-gray-400">{booking.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#0F172A]">{booking.date}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {booking.time}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-secondary">{booking.amount}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider ${
                          booking.status === 'Confirmed' 
                            ? 'bg-[#10B981]/10 text-[#10B981]' 
                            : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button className="p-2 text-gray-400 hover:text-primary smooth-transition group-hover:scale-110">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredBookings.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-medium">No bookings found matching your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl z-[101] overflow-hidden"
            >
              <div className="relative p-10">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute right-8 top-8 p-2 hover:bg-gray-100 rounded-full smooth-transition"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>

                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#0F172A] outfit">Booking Details</h2>
                    <p className="text-primary font-bold tracking-wider">{selectedBooking.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <DetailItem icon={<User />} label="Customer Info">
                      <p className="font-bold text-[#0F172A]">{selectedBooking.customer}</p>
                      <p className="text-sm text-gray-400">{selectedBooking.email}</p>
                      <p className="text-sm text-gray-400">{selectedBooking.phone}</p>
                    </DetailItem>

                    <DetailItem icon={<Clock />} label="Date & Time Slot">
                      <p className="font-bold text-[#0F172A]">{selectedBooking.date}</p>
                      <p className="text-sm text-gray-500 font-medium">{selectedBooking.time}</p>
                    </DetailItem>
                  </div>

                  <div className="space-y-8">
                    <DetailItem icon={<CreditCard />} label="Payment & Amount">
                      <p className="text-2xl font-bold text-secondary mb-1">{selectedBooking.amount}</p>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${
                        selectedBooking.payment === 'Paid' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-100 text-red-500'
                      }`}>
                        {selectedBooking.payment.toUpperCase()}
                      </span>
                    </DetailItem>

                    <DetailItem icon={<Calendar />} label="Venue Details">
                      <p className="font-bold text-[#0F172A]">{selectedBooking.ground}</p>
                      <p className="text-sm text-gray-500 font-medium">{selectedBooking.court} ({selectedBooking.sport})</p>
                    </DetailItem>
                  </div>
                </div>

                <div className="mt-12 flex items-center gap-4">
                  <button className="flex-1 bg-secondary hover:bg-primary text-white py-4 rounded-2xl font-bold smooth-transition shadow-lg shadow-black/5">
                    Update Status
                  </button>
                  <button className="flex-1 border border-gray-100 hover:bg-gray-50 text-secondary py-4 rounded-2xl font-bold smooth-transition">
                    Print Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon, label, children }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
        <div className="space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

