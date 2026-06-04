"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Trophy, Zap, Clock, Shield, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import SportIcon from "@/components/SportIcon";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const cachedRole = localStorage.getItem("userRole");
    if (cachedRole === "owner") {
      setIsRedirecting(true);
      router.replace("/owner/dashboard");
      return;
    } else if (cachedRole === "admin") {
      setIsRedirecting(true);
      router.replace("/admin");
      return;
    }

    if (!authLoading && user) {
      if (user.role === "owner") {
        setIsRedirecting(true);
        router.replace("/owner/dashboard");
      } else if (user.role === "admin") {
        setIsRedirecting(true);
        router.replace("/admin");
      }
    }
  }, [user, authLoading, router]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${img}`;
  };

  const [grounds, setGrounds] = useState([]);
  const [allGrounds, setAllGrounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const response = await fetch("/api/grounds/");
        if (response.ok) {
          const data = await response.json();
          setAllGrounds(data);
          // Sort or filter for "Trending" (for now just take first few)
          setGrounds(data.slice(0, 6));
        }
      } catch (err) {
        console.error("Error fetching grounds:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrounds();
  }, []);

  const sports = [
    { name: "Cricket", icon: "cricket", key: "cricket" },
    { name: "Football", icon: "football", key: "football" },
    { name: "Badminton", icon: "badminton", key: "badminton" },
    { name: "Pickleball", icon: "pickleball", key: "pickleball" },
    { name: "Volleyball", icon: "volleyball", key: "volleyball" },
  ].map(sport => {
    const count = allGrounds.filter(g => 
      g.sports && g.sports.some(s => s.toLowerCase() === sport.key)
    ).length;
    return { ...sport, count };
  });

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center outfit text-gray-400">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <Hero />

      {/* Sports Categories */}
      <section className="py-12 md:py-24 container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold outfit mb-2 sm:mb-4 text-secondary">Choose Your Sport</h2>
            <p className="text-sm sm:text-base text-gray-600">Whatever you play, we have the perfect arena for you.</p>
          </div>
          <Link href="/explore" className="text-sm sm:text-base text-primary font-bold flex items-center gap-2 group hover:gap-3 smooth-transition">
            View All Sports <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {sports.map((sport) => (
            <Link
              key={sport.name}
              href={`/explore?sport=${sport.name}`}
              className="glass-card p-3 sm:p-6 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center text-center hover:scale-[1.02] active:scale-95 smooth-transition cursor-pointer"
            >
              <div className="scale-75 sm:scale-100 mb-1 sm:mb-4">
                <SportIcon sport={sport.icon} size={40} className="text-primary" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm md:text-lg text-secondary line-clamp-1">{sport.name}</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{sport.count} Grounds</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Arenas */}
      <section className="py-12 md:py-24 container mx-auto px-4 sm:px-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold outfit mb-2 sm:mb-4 text-secondary">Trending Arenas</h2>
            <p className="text-sm sm:text-base text-gray-600">Top-rated venues with premium facilities in Ahmedabad.</p>
          </div>
          <Link href="/explore" className="text-sm sm:text-base text-primary font-bold flex items-center gap-2 group hover:gap-3 smooth-transition">
            Explore All Venues <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>

        {/* Mobile Slideshow / Desktop Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="min-w-[85vw] md:min-w-0 h-96 bg-surface animate-pulse rounded-[32px]" />
            ))
          ) : grounds.length > 0 ? (
            grounds.map((ground) => (
              <div key={ground.id} className="min-w-[85vw] md:min-w-0 snap-center">
                <div className="glass-card rounded-[32px] overflow-hidden group h-full flex flex-col">
                  <Link href={`/grounds/${ground.id}`} className="relative h-64 overflow-hidden block">
                    <img
                      src={
                        ground.images?.[0]
                          ? getImageUrl(ground.images[0])
                          : "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800"
                      }
                      className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-secondary uppercase tracking-wider shadow-sm">
                      Trending
                    </div>
                  </Link>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-secondary mb-1">{ground.name}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{ground.location?.address || "Ahmedabad"}</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">New</div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Starting From</p>
                        <p className="text-lg font-bold text-secondary">
                          ₹{ground.courts?.[0]?.base_price || 0}
                          <span className="text-xs text-gray-400 font-medium">/hr</span>
                        </p>
                      </div>
                      <Link href={`/grounds/${ground.id}`} className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary smooth-transition">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400">
              No venues listed yet. Be the first to list!
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 md:py-24 container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold outfit mb-2 sm:mb-4 text-secondary">How It Works</h2>
          <p className="text-sm sm:text-base text-gray-600">Three simple steps to your next big game.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -z-10" />

          <StepCard
            number="01"
            title="Discover"
            description="Browse through 150+ premium venues in Ahmedabad and filter by your favorite sport."
          />
          <StepCard
            number="02"
            title="Book"
            description="Pick your preferred slot, enjoy dynamic pricing discounts, and pay securely in seconds."
          />
          <StepCard
            number="03"
            title="Play"
            description="Receive your digital ticket instantly and hit the arena with your squad."
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold outfit mb-2 sm:mb-4 text-secondary">Why Book With Us?</h2>
            <p className="text-sm sm:text-base text-gray-600">We make sports booking seamless, so you can focus on the game.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Instant Confirmation"
              description="No more waiting for calls. Book your slot and get instant confirmation."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="Dynamic Pricing"
              description="Save big with smart pricing. Get automated discounts on off-peak hours and last-minute deals."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-purple-500" />}
              title="Verified Venues"
              description="Every ground on our platform is verified for quality, safety, and amenities."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-black/5 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Trophy className="text-primary w-6 h-6" />
            <span className="text-xl font-bold tracking-tight outfit text-secondary">
              Play<span className="text-primary">Ground</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 PlayGround. All rights reserved. Made for champions.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-20 h-20 rounded-[32px] bg-white border border-black/5 shadow-xl shadow-black/5 flex items-center justify-center text-2xl font-bold outfit text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white smooth-transition">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-4 text-secondary">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed px-4">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-black/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 smooth-transition">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4 text-secondary">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
