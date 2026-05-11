import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Trophy, Zap, Clock, Shield, ArrowRight, MapPin } from "lucide-react";

const sports = [
  { name: "Cricket", icon: "🏏", count: 42 },
  { name: "Football", icon: "⚽", count: 28 },
  { name: "Badminton", icon: "🏸", count: 35 },
  { name: "Pickleball", icon: "🏓", count: 12 },
  { name: "Volleyball", icon: "🏐", count: 8 },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Hero />

      {/* Sports Categories */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold outfit mb-4 text-secondary">Choose Your Sport</h2>
            <p className="text-gray-600">Whatever you play, we have the perfect arena for you.</p>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 group hover:gap-3 smooth-transition">
            View All Sports <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {sports.map((sport) => (
            <div key={sport.name} className="glass-card p-6 rounded-3xl flex flex-col items-center text-center hover:scale-[1.02] active:scale-95 smooth-transition cursor-pointer">
              <span className="text-4xl mb-4">{sport.icon}</span>
              <h3 className="font-bold text-lg text-secondary">{sport.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{sport.count} Grounds</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Arenas */}
      <section className="py-24 container mx-auto px-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold outfit mb-4 text-secondary">Trending Arenas</h2>
            <p className="text-gray-600">Top-rated venues with premium facilities in Ahmedabad.</p>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 group hover:gap-3 smooth-transition">
            Explore All Venues <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Slideshow / Desktop Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
          <div className="min-w-[85vw] md:min-w-0 snap-center">
            <div className="glass-card rounded-[32px] overflow-hidden group h-full">
              <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 smooth-transition" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-secondary uppercase tracking-wider shadow-sm">
                  Featured
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-1">Elite Sports Arena</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Satellite, Ahmedabad</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">4.8 ★</div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Starting From</p>
                    <p className="text-lg font-bold text-secondary">₹1,200<span className="text-xs text-gray-400 font-medium">/hr</span></p>
                  </div>
                  <button className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary smooth-transition">Book Now</button>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-[85vw] md:min-w-0 snap-center">
            <div className="glass-card rounded-[32px] overflow-hidden group h-full">
              <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 smooth-transition" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-secondary uppercase tracking-wider shadow-sm">
                  Popular
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-1">Victory Turf</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>SG Highway, Ahmedabad</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">4.6 ★</div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Starting From</p>
                    <p className="text-lg font-bold text-secondary">₹1,000<span className="text-xs text-gray-400 font-medium">/hr</span></p>
                  </div>
                  <button className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary smooth-transition">Book Now</button>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-[85vw] md:min-w-0 snap-center">
            <div className="glass-card rounded-[32px] overflow-hidden group h-full">
              <div className="relative h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 smooth-transition" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-secondary uppercase tracking-wider shadow-sm">
                  Top Rated
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-1">Smash Badminton Club</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Prahlad Nagar, Ahmedabad</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">4.9 ★</div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Starting From</p>
                    <p className="text-lg font-bold text-secondary">₹400<span className="text-xs text-gray-400 font-medium">/hr</span></p>
                  </div>
                  <button className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary smooth-transition">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold outfit mb-4 text-secondary">How It Works</h2>
          <p className="text-gray-600">Three simple steps to your next big game.</p>
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
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold outfit mb-4 text-secondary">Why Book With Us?</h2>
            <p className="text-gray-600">We make sports booking seamless, so you can focus on the game.</p>
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
      <footer className="py-12 border-t border-black/5 bg-white">
        <div className="container mx-auto px-6 text-center">
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
