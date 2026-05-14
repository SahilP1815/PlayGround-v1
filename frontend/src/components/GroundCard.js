"use client";

import { Star, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GroundCard({ ground }) {
  return (
    <Link href={`/grounds/${ground.id}`} className="glass-card rounded-3xl overflow-hidden group block hover:scale-[1.01] smooth-transition">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={ground.images[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop"} 
          alt={ground.name} 
          className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-black/5 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-secondary">4.8</span>
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Available Now
          </div>
          <div className="flex gap-2">
            {[...new Set(ground.courts.map(c => c.sport_type))].slice(0, 2).map(sport => (
              <span key={sport} className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                {sport}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold outfit mb-2 text-secondary group-hover:text-primary smooth-transition">
          {ground.name}
        </h3>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="truncate">{ground.location.address}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Starts from</p>
            <p className="text-lg font-bold text-secondary">₹{Math.min(...ground.courts.map(c => c.base_price))}<span className="text-xs text-gray-400 font-normal">/hr</span></p>
          </div>
          <div className="bg-surface group-hover:bg-primary text-secondary group-hover:text-white p-2.5 rounded-xl smooth-transition border border-black/5">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
