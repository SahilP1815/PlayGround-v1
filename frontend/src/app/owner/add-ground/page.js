"use client";

import Navbar from "@/components/Navbar";
import { 
  Building2, 
  MapPin, 
  Upload, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Basic Info", "Courts & Pricing", "Amenities", "Gallery"];

export default function AddGroundPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    amenities: [],
    courts: [{ id: Date.now(), name: "", sport: "cricket", price: "" }]
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm smooth-transition border-4 ${
                  i <= currentStep 
                    ? "bg-primary border-primary text-white" 
                    : "bg-white border-gray-100 text-gray-400"
                }`}
              >
                {i < currentStep ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${i <= currentStep ? "text-secondary" : "text-gray-400"}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass rounded-[40px] border border-black/5 p-10 md:p-16 shadow-2xl shadow-black/5 relative overflow-hidden">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.4 }}
             >
               {currentStep === 0 && <BasicInfoStep />}
               {currentStep === 1 && <CourtsStep courts={formData.courts} />}
               {currentStep === 2 && <AmenitiesStep />}
               {currentStep === 3 && <GalleryStep />}
             </motion.div>
           </AnimatePresence>

           {/* Actions */}
           <div className="flex items-center justify-between mt-16 pt-10 border-t border-black/5">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 font-bold smooth-transition ${
                  currentStep === 0 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-secondary"
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              <button 
                onClick={nextStep}
                className="bg-secondary hover:bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 smooth-transition shadow-lg shadow-black/10"
              >
                {currentStep === steps.length - 1 ? "Finish & List" : "Continue"} 
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}

function BasicInfoStep() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold outfit mb-2">The Basics</h2>
        <p className="text-gray-500">Tell us the name and location of your amazing sports arena.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Venue Name</label>
          <div className="relative group">
            <Trophy className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary smooth-transition" />
            <input 
              type="text" 
              placeholder="e.g. Masterstroke Turf" 
              className="w-full bg-surface border border-black/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Location Address</label>
          <div className="relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary smooth-transition" />
            <input 
              type="text" 
              placeholder="Full address in Ahmedabad..." 
              className="w-full bg-surface border border-black/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
          <textarea 
            rows="4" 
            placeholder="Highlight what makes your venue special (FIFA turf, high-intensity lights, etc.)" 
            className="w-full bg-surface border border-black/5 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
          />
        </div>
      </div>
    </div>
  );
}

function CourtsStep({ courts }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold outfit mb-2">Courts & Pricing</h2>
          <p className="text-gray-500">Add different playing areas and set their hourly rates.</p>
        </div>
        <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/20 smooth-transition">
          <Plus className="w-4 h-4" /> Add Court
        </button>
      </div>

      <div className="space-y-4">
        {courts.map((court, i) => (
          <div key={court.id} className="p-6 bg-surface rounded-3xl border border-black/5 relative group">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-gray-400">Court Name</label>
                 <input type="text" placeholder="Turf 1" className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm focus:outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-gray-400">Sport Type</label>
                 <select className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm focus:outline-none">
                    <option>Cricket</option>
                    <option>Football</option>
                    <option>Badminton</option>
                    <option>Tennis</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-gray-400">Price (₹/hr)</label>
                 <input type="number" placeholder="1200" className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm focus:outline-none" />
               </div>
            </div>
            <button className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full border border-black/5 shadow-md opacity-0 group-hover:opacity-100 smooth-transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmenitiesStep() {
  const list = ["Changing Rooms", "Parking", "Water", "Floodlights", "CCTV", "Canteen", "First Aid", "Showers"];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold outfit mb-2">Amenities</h2>
        <p className="text-gray-500">What facilities do you provide for your players?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {list.map(item => (
          <button key={item} className="p-4 rounded-2xl border border-black/5 bg-surface hover:border-primary/30 hover:bg-white smooth-transition text-sm font-medium flex items-center justify-center text-secondary">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryStep() {
  return (
    <div className="space-y-8 text-center">
      <div>
        <h2 className="text-3xl font-bold outfit mb-2">Gallery</h2>
        <p className="text-gray-500">Upload high-quality photos of your venue to attract more bookings.</p>
      </div>

      <div className="border-4 border-dashed border-gray-100 rounded-[40px] py-20 bg-surface/50 flex flex-col items-center gap-6 group hover:border-primary/20 smooth-transition">
        <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-black/5 group-hover:scale-110 smooth-transition">
          <Upload className="w-12 h-12 text-primary" />
        </div>
        <div>
          <p className="font-bold text-lg">Click or drag images here</p>
          <p className="text-sm text-gray-400">PNG, JPG up to 10MB each</p>
        </div>
        <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold smooth-transition hover:bg-primary-dark">
          Select Files
        </button>
      </div>
    </div>
  );
}
