"use client";

import Navbar from "@/components/Navbar";
import OwnerSidebar from "@/components/OwnerSidebar";
import { 
  Building2, 
  MapPin, 
  Upload, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const steps = ["Basic Info", "Courts & Pricing", "Amenities", "Gallery"];

export default function AddGroundPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    amenities: [],
    courts: [{ id: Date.now(), name: "", sport: "cricket", price: "" }],
    images: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      handleFinalSubmit();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      // Map formData to backend schema
      const payload = {
        name: formData.name,
        description: formData.description,
        location: {
          lat: 23.0225, // Ahmedabad lat
          lng: 72.5714, // Ahmedabad lng
          address: formData.address
        },
        images: formData.images,
        courts: formData.courts.map(court => ({
          name: court.name,
          sport_type: court.sport.toLowerCase(), // Ensure lowercase to match Enum
          base_price: parseFloat(court.price) || 0
        }))
      };

      console.log("Submitting payload:", payload);

      const response = await fetch("http://localhost:8000/api/grounds/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error details:", data);
        const errorMessage = typeof data.detail === 'string' 
          ? data.detail 
          : (Array.isArray(data.detail) ? data.detail.map(d => d.msg).join(", ") : "Failed to list ground");
        throw new Error(errorMessage);
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting ground:", error);
      alert(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
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
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold outfit mb-2">Ground Listed Successfully!</h2>
                <p className="text-gray-500 mb-8">Your venue is now live and ready to accept bookings.</p>
                <Link href="/owner/dashboard" className="bg-secondary hover:bg-primary text-white px-10 py-4 rounded-2xl font-bold smooth-transition shadow-lg shadow-black/10">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {currentStep === 0 && (
                      <BasicInfoStep 
                        data={formData} 
                        onChange={(update) => setFormData({ ...formData, ...update })} 
                      />
                    )}
                    {currentStep === 1 && (
                      <CourtsStep 
                        courts={formData.courts} 
                        onChange={(courts) => setFormData({ ...formData, courts })} 
                      />
                    )}
                    {currentStep === 2 && (
                      <AmenitiesStep 
                        selected={formData.amenities} 
                        onChange={(amenities) => setFormData({ ...formData, amenities })} 
                      />
                    )}
                    {currentStep === 3 && (
                      <GalleryStep 
                        images={formData.images} 
                        onChange={(images) => setFormData({ ...formData, images })} 
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center justify-between mt-16 pt-10 border-t border-black/5">
                  <button 
                    onClick={prevStep}
                    disabled={currentStep === 0 || isSubmitting}
                    className={`flex items-center gap-2 font-bold smooth-transition ${
                      currentStep === 0 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-secondary"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  
                  <button 
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="bg-secondary hover:bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 smooth-transition shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {currentStep === steps.length - 1 ? "Finish & List" : "Continue"} 
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
        </div>
      </main>
    </div>
  </div>
  );
}

function BasicInfoStep({ data, onChange }) {
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
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
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
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Full address in Ahmedabad..." 
              className="w-full bg-surface border border-black/5 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Description</label>
          <textarea 
            rows="4" 
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Highlight what makes your venue special (FIFA turf, high-intensity lights, etc.)" 
            className="w-full bg-surface border border-black/5 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 smooth-transition"
          />
        </div>
      </div>
    </div>
  );
}

function CourtsStep({ courts, onChange }) {
  const addCourt = () => {
    onChange([...courts, { id: Date.now(), name: "", sport: "cricket", price: "" }]);
  };

  const removeCourt = (id) => {
    if (courts.length > 1) {
      onChange(courts.filter(c => c.id !== id));
    }
  };

  const updateCourt = (id, field, value) => {
    onChange(courts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold outfit mb-2">Courts & Pricing</h2>
          <p className="text-gray-500">Add different playing areas and set their hourly rates.</p>
        </div>
        <button 
          onClick={addCourt}
          className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/20 smooth-transition"
        >
          <Plus className="w-4 h-4" /> Add Court
        </button>
      </div>

      <div className="space-y-4">
        {courts.map((court, i) => (
          <div key={court.id} className="p-6 bg-surface rounded-3xl border border-black/5 relative group">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-gray-400">Court Name</label>
                 <input 
                  type="text" 
                  value={court.name}
                  onChange={(e) => updateCourt(court.id, "name", e.target.value)}
                  placeholder="Turf 1" 
                  className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm focus:outline-none" 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-gray-400">Sport Type</label>
                 <select 
                  value={court.sport}
                  onChange={(e) => updateCourt(court.id, "sport", e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm focus:outline-none"
                 >
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="badminton">Badminton</option>
                    <option value="tennis">Tennis</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-gray-400">Price (INR/hr)</label>
                 <input 
                  type="number" 
                  value={court.price}
                  onChange={(e) => updateCourt(court.id, "price", e.target.value)}
                  placeholder="1200" 
                  className="w-full bg-white border border-black/5 rounded-xl p-3 text-sm focus:outline-none" 
                 />
               </div>
            </div>
            {courts.length > 1 && (
              <button 
                onClick={() => removeCourt(court.id)}
                className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full border border-black/5 shadow-md opacity-0 group-hover:opacity-100 smooth-transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AmenitiesStep({ selected, onChange }) {
  const list = ["Changing Rooms", "Parking", "Water", "Floodlights", "CCTV", "Canteen", "First Aid", "Showers"];
  
  const toggleAmenity = (item) => {
    if (selected.includes(item)) {
      onChange(selected.filter(a => a !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold outfit mb-2">Amenities</h2>
        <p className="text-gray-500">What facilities do you provide for your players?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {list.map(item => {
          const isSelected = selected.includes(item);
          return (
            <button 
              key={item} 
              onClick={() => toggleAmenity(item)}
              className={`p-4 rounded-2xl border smooth-transition text-sm font-bold flex items-center justify-center ${
                isSelected 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "border-black/5 bg-surface text-secondary hover:border-primary/30 hover:bg-white"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GalleryStep({ images, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create preview URLs for the new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    onChange([...images, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-8 text-center">
      <div>
        <h2 className="text-3xl font-bold outfit mb-2">Gallery</h2>
        <p className="text-gray-500">Upload high-quality photos of your venue to attract more bookings.</p>
      </div>

      <div 
        onClick={() => fileInputRef.current.click()}
        className="border-4 border-dashed border-gray-100 rounded-[40px] py-16 bg-surface/50 flex flex-col items-center gap-6 group hover:border-primary/20 smooth-transition cursor-pointer"
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
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

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-black/5 shadow-sm">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 smooth-transition flex items-center justify-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-500 smooth-transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


