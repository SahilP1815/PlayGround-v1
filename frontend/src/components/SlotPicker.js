"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, MapPin, Sun, Sunrise, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { format, addDays, getHours, getMinutes } from "date-fns";

export default function SlotPicker({ court, slots, onSelect, groundLocation, multiSelect = false, selectedDate, onDateChange }) {
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [openSections, setOpenSections] = useState({ morning: true, afternoon: false, evening: false });

  // Reset selection when slots change (e.g., when switching courts or dates)
  useEffect(() => {
    setSelectedSlotIds([]);
  }, [slots]);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // No need to filter by date here anymore as 'slots' prop is already filtered/generated for the specific date in parent
  const filteredSlots = slots;

  // Group slots by time of day
  const groupedSlots = {
    morning: filteredSlots.filter(s => {
      const h = getHours(new Date(s.start_time));
      return h >= 6 && h < 12;
    }),
    afternoon: filteredSlots.filter(s => {
      const h = getHours(new Date(s.start_time));
      return h >= 12 && h < 17;
    }),
    evening: filteredSlots.filter(s => {
      const h = getHours(new Date(s.start_time));
      return h >= 17 || h < 2;
    })
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSlotClick = (slot) => {
    const isAvailable = slot.status === "available" || slot.available === true;
    if (!isAvailable) return;

    let newSelected;
    if (multiSelect) {
      if (selectedSlotIds.includes(slot.id)) {
        newSelected = selectedSlotIds.filter(id => id !== slot.id);
      } else {
        newSelected = [...selectedSlotIds, slot.id];
      }
    } else {
      newSelected = [slot.id];
    }

    setSelectedSlotIds(newSelected);
    const selectedObjects = filteredSlots.filter(s => newSelected.includes(s.id));
    onSelect(selectedObjects);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Date Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {dates.map((date) => (
          <button
            key={date.toString()}
            onClick={() => {
              onDateChange(date);
              setSelectedSlotIds([]);
              onSelect([]);
            }}
            className={`flex flex-col items-center min-w-[70px] py-4 rounded-2xl border smooth-transition ${
              format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                : "bg-white border-black/5 text-gray-500 hover:border-primary/20"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
              {format(date, "EEE")}
            </span>
            <span className="text-lg font-bold outfit">
              {format(date, "d")}
            </span>
          </button>
        ))}
      </div>

      {/* Collapsible Slot Sections */}
      <div className="space-y-4">
        <DropdownSlotGroup
          title="Morning"
          subtitle="6:00 AM – 12:00 PM"
          icon={<Sunrise className="w-5 h-5 text-orange-400" />}
          slots={groupedSlots.morning}
          selectedIds={selectedSlotIds}
          onClick={handleSlotClick}
          location={groundLocation}
          isOpen={openSections.morning}
          onToggle={() => toggleSection("morning")}
        />

        <DropdownSlotGroup
          title="Afternoon"
          subtitle="12:00 PM – 5:00 PM"
          icon={<Sun className="w-5 h-5 text-yellow-500" />}
          slots={groupedSlots.afternoon}
          selectedIds={selectedSlotIds}
          onClick={handleSlotClick}
          location={groundLocation}
          isOpen={openSections.afternoon}
          onToggle={() => toggleSection("afternoon")}
        />

        <DropdownSlotGroup
          title="Evening & Night"
          subtitle="5:00 PM – 1:00 AM"
          icon={<Moon className="w-5 h-5 text-purple-500" />}
          slots={groupedSlots.evening}
          selectedIds={selectedSlotIds}
          onClick={handleSlotClick}
          location={groundLocation}
          isOpen={openSections.evening}
          onToggle={() => toggleSection("evening")}
        />
      </div>

      {/* Map View */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-secondary flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location Map
          </h3>
          <a 
            href="https://www.google.com/maps?q=23.0338,72.5134" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-primary font-bold hover:underline"
          >
            Open in Google Maps →
          </a>
        </div>
        <div className="w-full h-48 rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.0!2d72.5134!3d23.0338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAyJzAxLjciTiA3MsKwMzAnNDguMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Location - Satellite, Ahmedabad"
          />
        </div>
        <p className="mt-2 text-[11px] text-gray-500 font-medium px-1">
          📍 {groundLocation || "Satellite, Ahmedabad"}
        </p>
      </div>
    </div>
  );
}

function DropdownSlotGroup({ title, subtitle, icon, slots, selectedIds, onClick, location, isOpen, onToggle }) {
  const selectedCount = slots.filter(s => selectedIds.includes(s.id)).length;

  return (
    <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
      {/* Dropdown Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-surface smooth-transition"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <p className="text-sm font-bold text-secondary">{title}</p>
            <p className="text-[10px] text-gray-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {selectedCount} selected
            </span>
          )}
          <span className="text-xs text-gray-400 font-medium">{slots.filter(s => s.available).length} slots</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Dropdown Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-black/5">
          {slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isAvailable = slot.status === "available" || slot.available === true;
                const isSelected = selectedIds.includes(slot.id);

                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => onClick(slot)}
                    className={`py-3 px-2 rounded-xl border text-center smooth-transition relative ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                        : isAvailable
                        ? "bg-white border-black/5 text-secondary hover:border-primary hover:bg-primary/5"
                        : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className={`text-[11px] font-bold block ${isSelected ? "text-white" : "text-secondary"}`}>
                      {format(new Date(slot.start_time), "hh:mm a")}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className={`text-[10px] font-bold ${
                        isSelected ? "text-white" : isAvailable ? (getHours(new Date(slot.start_time)) < 18 ? "text-green-500" : "text-primary-dark") : "text-gray-300"
                      }`}>
                        ₹{slot.price}
                      </span>
                      {isAvailable && !isSelected && getHours(new Date(slot.start_time)) < 18 && (
                        <span className="text-[8px] bg-green-500/10 text-green-600 px-1 rounded-sm font-bold uppercase tracking-tight">Save 20%</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm py-6">No slots in this period.</p>
          )}
        </div>
      )}
    </div>
  );
}
