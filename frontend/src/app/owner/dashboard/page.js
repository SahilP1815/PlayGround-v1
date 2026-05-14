"use client";

import Navbar from "@/components/Navbar";
import OwnerSidebar from "@/components/OwnerSidebar";
import { 
  Plus, 
  Building2, 
  IndianRupee, 
  Users, 
  ArrowUpRight, 
} from "lucide-react";
import { useState, useEffect } from "react";

import Link from "next/link";

export default function OwnerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


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
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-[#0F172A] outfit mb-2">Owner Dashboard</h1>
            <p className="text-gray-400 font-medium text-lg">Welcome back, Elite Sports Admin</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-sm font-bold text-[#0F172A]">Business is Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard 
            icon={<IndianRupee className="w-6 h-6 text-[#10B981]" />}
            iconBg="bg-[#10B981]/10"
            label="Total Earnings"
            value="INR 48,250"
            trend="+12% from last month"
            trendColor="text-[#10B981]"
          />
          <Link href="/owner/bookings" className="block">
            <StatCard 
              icon={<Users className="w-6 h-6 text-[#3B82F6]" />}
              iconBg="bg-[#3B82F6]/10"
              label="Active Bookings"
              value="24"
              trend="8 for today"
              trendColor="text-[#10B981]"
            />
          </Link>
          <Link href="/owner/grounds" className="block">
            <StatCard 
              icon={<Building2 className="w-6 h-6 text-[#A855F7]" />}
              iconBg="bg-[#A855F7]/10"
              label="Total Grounds"
              value="02"
              trend="05 courts active"
              trendColor="text-[#10B981]"
            />
          </Link>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-[#0F172A] outfit">Recent Bookings</h2>
              <button className="text-[#10B981] text-sm font-bold flex items-center gap-1 group">
                View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 smooth-transition" />
              </button>
            </div>

            <div className="space-y-6">
              <Link href="/owner/bookings" className="block">
                <BookingRow 
                  user="Rahul Sharma" 
                  court="Turf 1 | 06:00 PM - 07:00 PM" 
                  amount="INR 1,500"
                  status="PAID"
                  color="bg-[#00A3C4]"
                />
              </Link>
              <Link href="/owner/bookings" className="block">
                <BookingRow 
                  user="Amit Patel" 
                  court="Box Cricket | 08:00 PM - 09:00 PM" 
                  amount="INR 1,200"
                  status="PAID"
                  color="bg-[#00A3C4]"
                />
              </Link>
              <Link href="/owner/bookings" className="block">
                <BookingRow 
                  user="Vikram Singh" 
                  court="Turf 1 | 10:00 PM - 11:00 PM" 
                  amount="INR 1,800"
                  status="PENDING"
                  color="bg-[#00A3C4]"
                />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0F172A] outfit mb-8">Quick Actions</h2>
              <div className="space-y-4">
                <QuickActionButton 
                  title="Update Slot Pricing" 
                  desc="Peak hour adjustments" 
                />
                <QuickActionButton 
                  title="Block Courts" 
                  desc="Maintenance or Private event" 
                />
                <QuickActionButton 
                  title="Download Reports" 
                  desc="Monthly earnings summary" 
                />
              </div>
            </div>
            
            <button className="w-full bg-[#0F172A] hover:bg-[#10B981] text-white py-6 rounded-[32px] font-bold flex items-center justify-center gap-3 smooth-transition shadow-xl shadow-black/10">
              <Plus className="w-6 h-6" />
              Add New Ground
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
  );
}



function StatCard({ icon, iconBg, label, value, trend, trendColor }) {
  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md smooth-transition">
      <div className={`${iconBg} p-4 rounded-2xl w-fit mb-8`}>
        {icon}
      </div>
      <p className="text-gray-500 font-medium mb-2">{label}</p>
      <h3 className="text-5xl font-bold text-[#0F172A] outfit mb-4">{value}</h3>
      <p className={`text-sm font-bold ${trendColor}`}>{trend}</p>
    </div>
  );
}

function BookingRow({ user, court, amount, status, color }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
          {user.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-[#0F172A]">{user}</p>
          <p className="text-xs text-gray-400 font-medium">{court}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#0F172A] text-lg">{amount}</p>
        <p className={`text-[10px] font-bold ${status === "PAID" ? "text-[#10B981]" : "text-[#F59E0B]"} tracking-wider`}>
          {status}
        </p>
      </div>
    </div>
  );
}

function QuickActionButton({ title, desc }) {
  return (
    <button className="w-full text-left p-6 rounded-3xl bg-[#F8FAFC] border border-transparent hover:border-[#10B981]/20 hover:bg-white hover:shadow-md smooth-transition">
      <p className="font-bold text-[#0F172A] mb-1">{title}</p>
      <p className="text-xs text-gray-400 font-medium">{desc}</p>
    </button>
  );
}
