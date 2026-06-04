"use client";

import Navbar from "@/components/Navbar";
import { User, Calendar, History, Settings, LogOut, ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-32 pb-20 container mx-auto px-6 max-w-6xl flex-1">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="glass rounded-[32px] border border-white/10 p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-4xl font-bold mb-6 border-4 border-background shadow-2xl">
                R
              </div>
              <h2 className="text-xl font-bold outfit mb-1">Rahul Sharma</h2>
              <p className="text-sm text-gray-500 mb-8">+91 98765 43210</p>
              
              <div className="w-full space-y-2 text-left">
                <DashboardNavItem 
                  icon={<Calendar className="w-5 h-5" />} 
                  label="Upcoming" 
                  active={activeTab === "bookings"}
                  onClick={() => setActiveTab("bookings")}
                />
                <DashboardNavItem 
                  icon={<History className="w-5 h-5" />} 
                  label="Past History" 
                  active={activeTab === "history"}
                  onClick={() => setActiveTab("history")}
                />
                <DashboardNavItem 
                  icon={<Settings className="w-5 h-5" />} 
                  label="Account Settings" 
                  active={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                />
                <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 smooth-transition font-medium">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-3xl font-bold outfit">
                {activeTab === "bookings" ? "Upcoming Games" : activeTab === "history" ? "Past History" : "Settings"}
              </h1>
              {activeTab === "bookings" && (
                <span className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-lg">
                  2 Bookings
                </span>
              )}
            </div>

            {activeTab === "bookings" && (
              <div className="space-y-6">
                <UpcomingBooking 
                  ground="Elite Sports Arena"
                  court="Champions Turf (7v7)"
                  date="Sun, 12th Oct"
                  time="06:00 PM - 07:00 PM"
                  location="Satellite, Ahmedabad"
                  id="BK-7294X01"
                />
                <UpcomingBooking 
                  ground="Victory Turf"
                  court="Power Play Box"
                  date="Wed, 15th Oct"
                  time="08:00 PM - 09:00 PM"
                  location="SG Highway, Ahmedabad"
                  id="BK-8102Y05"
                />
              </div>
            )}

            {activeTab === "history" && (
              <div className="glass rounded-[32px] border border-white/10 p-8 text-center py-20">
                <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium">No past bookings found. Start playing!</p>
                <button className="mt-8 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold smooth-transition">
                  Explore Grounds
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardNavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl smooth-transition font-medium ${
        active 
          ? "bg-primary text-white" 
          : "text-gray-400 hover:text-white hover:bg-surface"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function UpcomingBooking({ ground, court, date, time, location, id }) {
  return (
    <div className="glass p-8 rounded-[32px] border border-white/10 group hover:border-primary/30 smooth-transition overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] smooth-transition">
        <Calendar className="w-32 h-32" />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{id}</span>
            <div className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Confirmed</span>
          </div>
          <h3 className="text-2xl font-bold outfit mb-2 group-hover:text-primary smooth-transition">{ground}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-surface/50 px-4 py-2 rounded-xl border border-white/5 flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Date</span>
              <span className="text-sm font-bold">{date}</span>
            </div>
            <div className="bg-surface/50 px-4 py-2 rounded-xl border border-white/5 flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Time</span>
              <span className="text-sm font-bold">{time}</span>
            </div>
            <div className="bg-surface/50 px-4 py-2 rounded-xl border border-white/5 flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Arena</span>
              <span className="text-sm font-bold">{court}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end gap-6">
          <div className="bg-white p-2 rounded-xl">
             {/* Mini QR Mock */}
             <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center p-1">
               <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                 {Array.from({ length: 16 }).map((_, i) => (
                   <div
                     key={i}
                     className={`rounded-[1px] ${i % 3 === 0 || i % 5 === 0 ? "bg-black" : "bg-transparent"}`}
                   />
                 ))}
               </div>
             </div>
          </div>
          <button className="text-sm font-bold flex items-center gap-2 text-primary group-hover:gap-3 smooth-transition">
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
