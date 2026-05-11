"use client";

import Navbar from "@/components/Navbar";
import GroundCard from "@/components/GroundCard";
import { Search, Filter, MapPin } from "lucide-react";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Mock data for UI development
const mockGrounds = [
  {
    id: "1",
    name: "Elite Sports Arena",
    location: { address: "Satellite, Ahmedabad" },
    images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800"],
    courts: [
      { id: "c1", sport_type: "cricket", base_price: 1200 },
      { id: "c2", sport_type: "football", base_price: 1500 }
    ]
  },
  {
    id: "2",
    name: "Victory Turf",
    location: { address: "SG Highway, Ahmedabad" },
    images: ["https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=800"],
    courts: [
      { id: "c3", sport_type: "cricket", base_price: 1000 }
    ]
  },
  {
    id: "3",
    name: "Smash Badminton Club",
    location: { address: "Prahlad Nagar, Ahmedabad" },
    images: ["https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=800"],
    courts: [
      { id: "c4", sport_type: "badminton", base_price: 400 }
    ]
  }
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get("sport") || "All Sports";
  
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState(initialSport);

  useEffect(() => {
    const sportParam = searchParams.get("sport");
    if (sportParam) {
      setSelectedSport(sportParam);
    }
  }, [searchParams]);

  const filteredGrounds = useMemo(() => {
    return mockGrounds.filter(ground => {
      const matchesSearch = ground.name.toLowerCase().includes(search.toLowerCase()) || 
                           ground.location.address.toLowerCase().includes(search.toLowerCase());
      
      const matchesSport = selectedSport === "All Sports" || 
                          ground.courts.some(c => c.sport_type.toLowerCase() === selectedSport.toLowerCase());
      
      return matchesSearch && matchesSport;
    });
  }, [search, selectedSport]);

  const sportsTags = ["All Sports", "Cricket", "Football", "Badminton", "Pickleball", "Volleyball"];

  return (
    <main className="pt-28 pb-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold outfit mb-2">Explore Grounds</h1>
          <p className="text-gray-400">Discover 150+ arenas in Ahmedabad</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3 min-w-[300px]">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name or area..." 
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="glass p-2.5 rounded-xl border border-white/10 hover:border-primary smooth-transition">
            <Filter className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
        {sportsTags.map((tag) => (
          <button 
            key={tag} 
            onClick={() => setSelectedSport(tag)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap smooth-transition border ${
              selectedSport === tag ? "bg-primary border-primary text-white" : "glass border-white/5 text-gray-400 hover:border-white/20"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredGrounds.length > 0 ? (
          filteredGrounds.map(ground => (
            <GroundCard key={ground.id} ground={ground} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-500">No grounds found for your selection.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<div className="pt-28 text-center text-gray-400">Loading arenas...</div>}>
        <ExploreContent />
      </Suspense>
    </div>
  );
}
