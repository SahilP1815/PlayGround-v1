"use client";

import Navbar from "@/components/Navbar";
import { LayoutDashboard, Plus, Building2, IndianRupee, Users, ArrowUpRight, Settings, Calendar } from "lucide-react";
import { useState } from "react";

export default function OwnerPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-white/5 pt-28 pb-8 px-6 flex flex-col fixed h-full">
        <div className="space-y-2 flex-1">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem 
            icon={<Building2 className="w-5 h-5" />} 
            label="My Grounds" 
            active={activeTab === "grounds"}
            onClick={() => setActiveTab("grounds")}
          />
          <SidebarItem 
            icon={<Calendar className="w-5 h-5" />} 
            label="Bookings" 
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
          />
          <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Settings" 
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
        
        <div className="mt-auto">
          <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition">
            <Plus className="w-5 h-5" />
            Add New Ground
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-72">
        <Navbar />
        
        <main className="pt-32 pb-20 px-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold outfit">Owner Dashboard</h1>
              <p className="text-gray-400">Welcome back, Elite Sports Admin</p>
            </div>
            <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium">Business is Live</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard 
              icon={<IndianRupee className="w-6 h-6 text-primary" />}
              label="Total Earnings"
              value="₹48,250"
              trend="+12% from last month"
            />
            <StatCard 
              icon={<Users className="w-6 h-6 text-blue-500" />}
              label="Active Bookings"
              value="24"
              trend="8 for today"
            />
            <StatCard 
              icon={<Building2 className="w-6 h-6 text-purple-500" />}
              label="Total Grounds"
              value="02"
              trend="05 courts active"
            />
          </div>

          {/* Content Area */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Bookings Table */}
            <div className="lg:col-span-2 glass rounded-[32px] border border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold outfit">Recent Bookings</h2>
                <button className="text-primary text-sm font-bold flex items-center gap-1 group">
                  View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 smooth-transition" />
                </button>
              </div>

              <div className="space-y-4">
                <BookingRow 
                  user="Rahul Sharma" 
                  ground="Elite Sports Arena" 
                  court="Turf 1" 
                  time="06:00 PM - 07:00 PM" 
                  amount="₹1,500"
                  status="Paid"
                />
                <BookingRow 
                  user="Amit Patel" 
                  ground="Elite Sports Arena" 
                  court="Box Cricket" 
                  time="08:00 PM - 09:00 PM" 
                  amount="₹1,200"
                  status="Paid"
                />
                <BookingRow 
                  user="Vikram Singh" 
                  ground="Elite Sports Arena" 
                  court="Turf 1" 
                  time="10:00 PM - 11:00 PM" 
                  amount="₹1,800"
                  status="Pending"
                />
              </div>
            </div>

            {/* Quick Actions / Activity */}
            <div className="lg:col-span-1 glass rounded-[32px] border border-white/10 p-8">
              <h2 className="text-xl font-bold outfit mb-8">Quick Actions</h2>
              <div className="space-y-4">
                <button className="w-full text-left p-4 rounded-2xl bg-surface/50 border border-white/5 hover:border-primary/20 smooth-transition">
                  <p className="font-bold text-sm">Update Slot Pricing</p>
                  <p className="text-xs text-gray-500">Peak hour adjustments</p>
                </button>
                <button className="w-full text-left p-4 rounded-2xl bg-surface/50 border border-white/5 hover:border-primary/20 smooth-transition">
                  <p className="font-bold text-sm">Block Courts</p>
                  <p className="text-xs text-gray-500">Maintenance or Private event</p>
                </button>
                <button className="w-full text-left p-4 rounded-2xl bg-surface/50 border border-white/5 hover:border-primary/20 smooth-transition">
                  <p className="font-bold text-sm">Download Reports</p>
                  <p className="text-xs text-gray-500">Monthly earnings summary</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl smooth-transition font-medium ${
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-gray-400 hover:text-white hover:bg-surface"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="glass p-8 rounded-[32px] border border-white/10">
      <div className="bg-surface p-3 rounded-2xl border border-white/5 w-fit mb-6">
        {icon}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-4xl font-bold outfit mb-2">{value}</h3>
      <p className="text-xs text-primary font-bold">{trend}</p>
    </div>
  );
}

function BookingRow({ user, ground, court, time, amount, status }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface/50 border border-transparent hover:border-white/5 smooth-transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center font-bold text-xs">
          {user.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm">{user}</p>
          <p className="text-[10px] text-gray-500">{court} • {time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm">{amount}</p>
        <p className={`text-[10px] font-bold uppercase ${status === "Paid" ? "text-primary" : "text-yellow-500"}`}>
          {status}
        </p>
      </div>
    </div>
  );
}
