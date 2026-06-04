"use client";

import { Search, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
    alt: "Cricket Stadium"
  },
  {
    url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    alt: "Football Pitch"
  },
  {
    url: "https://images.unsplash.com/photo-1626225967045-2c390255979d?q=80&w=1200&auto=format&fit=crop",
    alt: "Tennis Court"
  },
  {
    url: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200&auto=format&fit=crop",
    alt: "Basketball Court"
  }
];

export default function Hero() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sport.trim()) params.append("sport", sport.trim());
    if (location.trim()) params.append("search", location.trim());
    router.push(`/explore?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 md:pt-20 pb-8 md:pb-0 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/30 blur-[120px] -z-10 rounded-full" />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold outfit leading-tight mb-6 text-secondary">
            Find Your <span className="text-gradient">Arena</span>,<br /> 
            Own the Game.
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-xl max-w-2xl mb-6 md:mb-10 leading-relaxed">
            Discover premium sports venues in Ahmedabad. From box cricket to pickleball, 
            book your slot in seconds and play with your squad.
          </p>

          {/* Search Box */}
          <div className="glass p-2 rounded-2xl border border-black/5 flex flex-col md:flex-row gap-2 max-w-2xl w-full shadow-xl shadow-black/5">
            <div className="flex-1 flex items-center min-h-[52px] px-4 gap-3 py-3 md:py-0 border-b md:border-b-0 md:border-r border-black/5">
              <Search className="text-primary w-5 h-5" />
              <input 
                type="text" 
                placeholder="Which sport?" 
                suppressHydrationWarning
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-transparent border-none outline-none text-secondary w-full text-sm"
              />
            </div>
            <div className="flex-1 flex items-center min-h-[52px] px-4 gap-3 py-3 md:py-0 border-b md:border-b-0 md:border-r border-black/5">
              <MapPin className="text-primary w-5 h-5" />
              <input 
                type="text" 
                placeholder="Location" 
                suppressHydrationWarning
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-transparent border-none outline-none text-secondary w-full text-sm"
              />
            </div>
            <button 
              onClick={handleSearch}
              suppressHydrationWarning
              className="bg-primary w-full md:w-auto hover:bg-primary-dark text-white min-h-[52px] px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 smooth-transition"
            >
              Search <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              150+ Venues
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Instant Booking
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="block md:relative mt-8 md:mt-0"
        >
          <div className="relative z-10 rounded-2xl md:rounded-3xl overflow-hidden border border-black/5 shadow-2xl h-[200px] md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide}
                src={slides[currentSlide].url}
                alt={slides[currentSlide].alt}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            
            {/* Slide indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 rounded-full smooth-transition ${
                    index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
