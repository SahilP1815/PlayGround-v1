"use client";

import { useState, useEffect } from "react";
import { Trophy, Heart } from "lucide-react";
import { motion } from "framer-motion";
import GroundCard from "@/components/GroundCard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/grounds/favorites/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setGrounds(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  if (authLoading) {
    return <div className="pt-32 text-center outfit text-gray-400">Loading...</div>;
  }

  return (
    <ProtectedRoute role="user">
      <div className="min-h-screen bg-[#FDFDFF]">
        <Navbar />
        
        <div className="max-w-[1400px] mx-auto px-6 py-10 pt-32">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary fill-primary" /> My Favorites
              </p>
              <h2 className="text-3xl font-extrabold text-secondary">Saved Venues</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[40px] h-[360px] animate-pulse border border-black/5 overflow-hidden">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-8 space-y-4">
                    <div className="h-6 w-3/4 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded-lg" />
                    <div className="flex gap-2 pt-4">
                      <div className="h-8 w-8 bg-gray-100 rounded-full" />
                      <div className="h-8 w-8 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : grounds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {grounds.map(ground => (
                <motion.div
                  key={ground.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <GroundCard ground={ground} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-black/5 rounded-[40px] shadow-sm">
              <div className="w-24 h-24 bg-primary/5 rounded-[40px] flex items-center justify-center mb-6 text-primary">
                <Heart size={48} className="opacity-50" />
              </div>
              <h3 className="text-xl font-extrabold text-secondary mb-2">No favorites yet</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Explore grounds and tap the heart icon to save your favorite venues here.</p>
              <button 
                onClick={() => router.push("/explore")}
                className="mt-8 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 smooth-transition hover:bg-primary-dark"
              >
                Explore Venues
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
