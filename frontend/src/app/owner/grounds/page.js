"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import OwnerSidebar from "@/components/OwnerSidebar";
import { 
  Building2, 
  MapPin, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Users,
  IndianRupee
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MyGrounds() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [grounds, setGrounds] = useState([
    {
      id: 1,
      name: "Masterstroke Turf",
      location: "Ahmedabad, Gujarat",
      courts: 3,
      bookings: 156,
      revenue: "₹85,400",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60",
      status: "Active"
    },
    {
      id: 2,
      name: "Elite Sports Arena",
      location: "Satellite, Ahmedabad",
      courts: 2,
      bookings: 92,
      revenue: "₹42,100",
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=60",
      status: "Active"
    }
  ]);

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
              <h1 className="text-4xl font-bold text-[#0F172A] outfit mb-2">My Grounds</h1>
              <p className="text-gray-400 font-medium text-lg">Manage and monitor your listed venues.</p>
            </div>
            
            <Link 
              href="/owner/add-ground"
              className="bg-secondary hover:bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 smooth-transition shadow-lg shadow-black/10"
            >
              <Plus className="w-5 h-5" /> Add New Ground
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {grounds.map((ground) => (
              <motion.div 
                key={ground.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl smooth-transition group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={ground.image} 
                    alt={ground.name} 
                    className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-primary shadow-sm">
                      {ground.status}
                    </span>
                  </div>
                  <div className="absolute top-6 right-6">
                    <button className="bg-white/90 backdrop-blur-md p-2 rounded-xl text-gray-400 hover:text-red-500 smooth-transition shadow-sm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#0F172A] outfit mb-1">{ground.name}</h3>
                      <p className="text-gray-400 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" /> {ground.location}
                      </p>
                    </div>
                    <button className="p-3 bg-gray-50 rounded-2xl text-secondary hover:bg-secondary hover:text-white smooth-transition">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-6 bg-[#F8FAFC] rounded-3xl">
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary mx-auto mb-2 shadow-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Courts</p>
                      <p className="font-bold text-[#0F172A]">{ground.courts}</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-secondary mx-auto mb-2 shadow-sm">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bookings</p>
                      <p className="font-bold text-[#0F172A]">{ground.bookings}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#10B981] mx-auto mb-2 shadow-sm">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
                      <p className="font-bold text-[#0F172A]">{ground.revenue}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                    <button className="text-sm font-bold text-gray-400 hover:text-primary smooth-transition flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> View Public Page
                    </button>
                    <button className="text-sm font-bold text-secondary hover:underline">
                      Manage Slots
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {grounds.length === 0 && (
              <div className="lg:col-span-2 py-32 text-center bg-white rounded-[40px] border border-gray-100 border-dashed">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                  <Building2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No Grounds Listed Yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">Start by adding your first sports ground to begin accepting bookings.</p>
                <Link 
                  href="/owner/add-ground"
                  className="bg-secondary hover:bg-primary text-white px-10 py-4 rounded-2xl font-bold smooth-transition inline-block"
                >
                  List Your Ground
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
