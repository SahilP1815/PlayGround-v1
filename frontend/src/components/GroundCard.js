"use client";
import Link from "next/link";
import { useState } from "react";
import { Star, MapPin, Trophy, Clock, CheckCircle2 } from "lucide-react";
import SportIcon from "@/components/SportIcon";

export default function GroundCard({ ground, selectedDate }) {
  const imageUrl = ground.images?.[0]
    ? (ground.images[0].startsWith('http') || ground.images[0].startsWith('data:')
        ? ground.images[0]
        : `${ground.images[0]}`)
    : "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop";

  return (
    <Link href={`/grounds/${ground.id}${selectedDate ? `?date=${selectedDate}` : ''}`} className="glass-card rounded-3xl overflow-hidden group block sm:hover:scale-[1.01] smooth-transition active:scale-[0.98] h-full flex flex-col">
      <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-950">
        <img 
          src={imageUrl} 
          alt={ground.name} 
          className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
        />
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {ground.status === 'verified' && (
            <div className="bg-white/90 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1 border border-teal-100">
              <CheckCircle2 size={12} /> Verified
            </div>
          )}
          {selectedDate && (
             <div className="bg-green-500 text-white px-1.5 sm:px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-green-500/20">
               Available {selectedDate}
             </div>
          )}
        </div>
        
        <div className="absolute bottom-4 right-4 z-20 bg-primary text-white px-3 py-1.5 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-primary/20">
          From ₹{ground.min_price || 0}/hr
        </div>
      </div>
      
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base sm:text-xl font-extrabold text-secondary line-clamp-1">{ground.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-700">{ground.avg_rating?.toFixed(1) || "5.0"}</span>
            <span className="text-[10px] text-yellow-600/60 font-medium">({ground.review_count || 0})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs sm:text-sm font-semibold truncate">{ground.location.city}, {ground.location.address}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
          <div className="flex gap-1.5 items-center">
            {ground.sports?.map(sport => (
              <span key={sport} title={sport} className="text-gray-400 hover:text-primary smooth-transition cursor-default flex items-center">
                <SportIcon sport={sport} size={18} />
              </span>
            ))}
          </div>
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg">
            {ground.is_indoor ? 'Indoor' : 'Outdoor'}
          </div>
        </div>
      </div>
    </Link>
  );
}
