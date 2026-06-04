"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Search, MapPin, SlidersHorizontal, X, ChevronDown, Calendar, Star, Building2, Filter, Layers, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GroundCard from "@/components/GroundCard";
import Navbar from "@/components/Navbar";
import { useSearchParams, useRouter } from "next/navigation";

const AMENITIES_LIST = [
  "Floodlights", "Parking", "Changing Room", "Drinking Water", 
  "First Aid", "CCTV", "Cafe", "Power Backup", "Wi-Fi", "Locker"
];

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMoreAmenities, setShowMoreAmenities] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [date, setDate] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isIndoor, setIsIndoor] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  const sports = ["all", "cricket", "football", "badminton", "pickleball", "tennis", "basketball", "volleyball"];
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toLocaleDateString('en-CA');

  // Sync search parameters from URL on mount and whenever URL change occurs
  useEffect(() => {
    const searchVal = searchParams.get("search") || "";
    const sportVal = searchParams.get("sport") || "all";
    const dateVal = searchParams.get("date") || "";
    const minPriceVal = Number(searchParams.get("min_price")) || 0;
    const maxPriceVal = Number(searchParams.get("max_price")) || 5000;
    const indoorVal = searchParams.get("is_indoor");
    const sortVal = searchParams.get("sort_by") || "newest";
    
    setSearch(searchVal);
    setSelectedSport(sportVal.toLowerCase());
    setDate(dateVal);
    setPriceRange([minPriceVal, maxPriceVal]);
    if (indoorVal !== null && indoorVal !== undefined && indoorVal !== "") {
      setIsIndoor(indoorVal === "true" ? true : indoorVal === "false" ? false : null);
    }
    setSortBy(sortVal);
    
    // Explicitly fetch using these fresh values to avoid stale states on URL search updates
    const fetchWithParams = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (sportVal !== "all") params.append("sport", sportVal.toLowerCase());
        if (searchVal) params.append("search", searchVal);
        if (dateVal) params.append("date", dateVal);
        params.append("min_price", minPriceVal);
        params.append("max_price", maxPriceVal);
        if (selectedAmenities.length > 0) params.append("amenities", selectedAmenities.join(","));
        if (indoorVal !== null && indoorVal !== undefined && indoorVal !== "") {
          params.append("is_indoor", indoorVal);
        }
        params.append("sort_by", sortVal);

        const response = await fetch(`/api/grounds/?${params.toString()}`);
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
    
    fetchWithParams();
  }, [searchParams]);

  const fetchGrounds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport !== "all") params.append("sport", selectedSport);
      if (search) params.append("search", search);
      if (date) params.append("date", date);
      params.append("min_price", priceRange[0]);
      params.append("max_price", priceRange[1]);
      if (selectedAmenities.length > 0) params.append("amenities", selectedAmenities.join(","));
      if (isIndoor !== null) params.append("is_indoor", isIndoor);
      params.append("sort_by", sortBy);

      const response = await fetch(`/api/grounds/?${params.toString()}`);
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

  useEffect(() => {
    // Only run if not initial loading / searchParams sync since searchParams effect handles that
    if (!loading) {
      fetchGrounds();
    }
  }, [selectedSport, sortBy]);

  const handleApplyFilters = () => {
    fetchGrounds();
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedSport("all");
    setDate("");
    setPriceRange([0, 5000]);
    setSelectedAmenities([]);
    setIsIndoor(null);
    setSortBy("newest");
    router.push("/explore");

    const fetchCleared = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/grounds/?sort_by=newest&min_price=0&max_price=5000");
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
    fetchCleared();
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const activeFilterCount = (selectedSport !== 'all' ? 1 : 0) + 
                             (date ? 1 : 0) + 
                             (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0) + 
                             (selectedAmenities.length > 0 ? 1 : 0) + 
                             (isIndoor !== null ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-8 pb-10">
      {/* Sport Selector */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Activity</h4>
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-x">
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSport(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold capitalize smooth-transition whitespace-nowrap ${
                selectedSport === s
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface text-gray-600 hover:border-primary border border-black/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Match Date</h4>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input 
            type="date"
            min={todayStr}
            max={maxDateStr}
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-surface border border-black/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-secondary focus:border-primary/50 outline-none smooth-transition"
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Amenities</h4>
        <div className="space-y-2">
          {AMENITIES_LIST.slice(0, showMoreAmenities ? AMENITIES_LIST.length : 4).map(a => (
            <label key={a} className="flex items-center gap-3 group cursor-pointer">
              <div 
                onClick={() => toggleAmenity(a)}
                className={`w-5 h-5 rounded-md border-2 smooth-transition flex items-center justify-center ${
                  selectedAmenities.includes(a) ? "bg-primary border-primary" : "bg-white border-black/10 group-hover:border-primary/30"
                }`}
              >
                {selectedAmenities.includes(a) && <X className="w-3 h-3 text-white rotate-45" />}
              </div>
              <span className="text-sm font-bold text-secondary/80 group-hover:text-secondary smooth-transition">{a}</span>
            </label>
          ))}
          <button 
            onClick={() => setShowMoreAmenities(!showMoreAmenities)}
            className="text-[11px] font-extrabold text-primary pt-1 flex items-center gap-1"
          >
            {showMoreAmenities ? "Show Less" : "Show More"} <ChevronDown className={`w-3 h-3 smooth-transition ${showMoreAmenities ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Indoor/Outdoor */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Venue Type</h4>
        <div className="flex gap-2">
          {[
            { label: 'Any', value: null },
            { label: 'Indoor', value: true },
            { label: 'Outdoor', value: false }
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setIsIndoor(opt.value)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest smooth-transition ${
                isIndoor === opt.value ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface border border-black/5 text-secondary hover:border-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 space-y-3">
        <button 
          onClick={handleApplyFilters}
          className="w-full bg-primary text-white py-4 rounded-3xl font-extrabold text-sm shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 smooth-transition"
        >
          Apply Filters
        </button>
        <button 
          onClick={handleClearFilters}
          className="w-full text-center text-xs font-bold text-gray-400 hover:text-primary smooth-transition"
        >
          Clear All
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-white border-b border-black/5 py-6 pt-20 md:pt-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-0">
          <div className="relative flex-grow max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input 
              type="text"
              placeholder="Search by name, city or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
              className="w-full min-h-[48px] bg-surface rounded-[32px] py-4 pl-16 pr-6 text-sm font-bold text-secondary focus:bg-white focus:shadow-2xl focus:shadow-primary/5 smooth-transition outline-none"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex-grow bg-primary/10 text-primary px-6 py-4 rounded-3xl flex items-center justify-center gap-3 font-extrabold text-sm border border-primary/20"
            >
              <Filter className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="bg-primary text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            
            <div className="relative group min-w-[180px]">
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full appearance-none bg-surface border border-black/5 px-6 py-4 rounded-3xl text-sm font-extrabold text-secondary focus:border-primary/50 outline-none cursor-pointer smooth-transition pr-12"
              >
                <option value="newest">Sort: Newest</option>
                <option value="rating">Sort: Best Rated</option>
                <option value="price_asc">Sort: Price Low-High</option>
                <option value="price_desc">Sort: Price High-Low</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-primary pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex gap-10">
          {/* Desktop Filter Panel */}
          <aside className="hidden md:block w-[280px] shrink-0 sticky top-28 h-fit max-h-[85vh] overflow-y-auto pr-4 scrollbar-hide">
            <FilterPanel />
          </aside>

          {/* Results Area */}
          <div className="flex-grow">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Explore</p>
                <h2 className="text-lg sm:text-2xl font-extrabold text-secondary">Found {grounds.length} Grounds</h2>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                {[1,2,3,4,5,6].map(i => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                {grounds.map(ground => (
                  <motion.div
                    key={ground.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <GroundCard ground={ground} selectedDate={date} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 sm:py-20 text-center px-4 w-full">
                <div className="w-24 h-24 bg-primary/5 rounded-[40px] flex items-center justify-center mb-6 text-primary animate-bounce">
                  <Trophy size={48} />
                </div>
                <h3 className="text-xl font-extrabold text-secondary mb-2">No grounds found</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find available venues.</p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-8 text-primary font-bold border-b-2 border-primary/20 hover:border-primary smooth-transition"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[100] max-h-[85vh] overflow-y-auto px-8 pt-4 pb-12 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-extrabold text-secondary">Filters</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary active:scale-90 smooth-transition"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center outfit text-gray-400">Loading explore...</div>}>
      <ExplorePageContent />
    </Suspense>
  );
}
