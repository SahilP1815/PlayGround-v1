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
  IndianRupee,
  AlertTriangle,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";


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

  const router = useRouter();
  const [grounds, setGrounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyGrounds = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:8000/api/grounds/my", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch your grounds");
        }

        const data = await response.json();
        setGrounds(data);
      } catch (err) {
        console.error("Error fetching grounds:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyGrounds();
  }, [router]);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, groundId: null, groundName: "" });

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, groundId: id, groundName: name });
  };

  const confirmDelete = async () => {
    const { groundId } = deleteModal;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/grounds/${groundId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete ground");
      }

      setGrounds(grounds.filter(g => g.id !== groundId));
      setDeleteModal({ isOpen: false, groundId: null, groundName: "" });
    } catch (err) {
      console.error("Error deleting ground:", err);
      alert(err.message);
    }
  };

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

          {/* Stats Bar */}
          {!isLoading && !error && grounds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Grounds</p>
                  <p className="text-2xl font-bold text-[#0F172A]">{grounds.length.toString().padStart(2, '0')}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-2xl text-secondary">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Courts</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {grounds.reduce((acc, g) => acc + (g.courts?.length || 0), 0).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          )}


          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-[40px] h-96 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-8 rounded-[40px] text-center">
              <p className="font-bold">Error loading grounds</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 text-white px-6 py-2 rounded-xl font-bold"
              >
                Retry
              </button>
            </div>
          ) : (
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
                    src={ground.images?.[0] || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60"} 
                    alt={ground.name} 
                    className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-primary shadow-sm">
                      Active
                    </span>
                  </div>
                  <div className="absolute top-6 right-6">
                    <button 
                      onClick={() => handleDeleteClick(ground.id, ground.name)}
                      className="bg-white/90 backdrop-blur-md p-2 rounded-xl text-gray-400 hover:text-red-500 smooth-transition shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#0F172A] outfit mb-1">{ground.name}</h3>
                      <p className="text-gray-400 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" /> {ground.location?.address || "No address provided"}
                      </p>
                    </div>
                    <Link 
                      href={`/owner/grounds/edit/${ground.id}`}
                      className="p-3 bg-gray-50 rounded-2xl text-secondary hover:bg-secondary hover:text-white smooth-transition"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-6 bg-[#F8FAFC] rounded-3xl">
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary mx-auto mb-2 shadow-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Courts</p>
                      <p className="font-bold text-[#0F172A]">{ground.courts?.length || 0}</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-secondary mx-auto mb-2 shadow-sm">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bookings</p>
                      <p className="font-bold text-[#0F172A]">0</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#10B981] mx-auto mb-2 shadow-sm">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
                      <p className="font-bold text-[#0F172A]">₹0</p>
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
          )}

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, groundId: null, groundName: "" })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setDeleteModal({ isOpen: false, groundId: null, groundName: "" })}
                className="absolute top-8 right-8 text-gray-400 hover:text-secondary smooth-transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-bold text-[#0F172A] outfit mb-2">Are you sure?</h3>
                <p className="text-gray-400 font-medium mb-10">
                  You are about to delete <span className="text-secondary font-bold">"{deleteModal.groundName}"</span>. This action is permanent and cannot be undone.
                </p>

                <div className="flex flex-col w-full gap-4">
                  <button 
                    onClick={confirmDelete}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-5 rounded-2xl font-bold smooth-transition shadow-lg shadow-red-200"
                  >
                    Yes, Delete Ground
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: false, groundId: null, groundName: "" })}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 py-5 rounded-2xl font-bold smooth-transition"
                  >
                    No, Keep it
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
