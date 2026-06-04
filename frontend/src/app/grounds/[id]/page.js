"use client";

import Navbar from "@/components/Navbar";
import SlotPicker from "@/components/SlotPicker";
import { MapPin, Star, Share2, Heart, ShieldCheck, Zap, Info, Trophy, Users, Wind, Lock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { setHours, setMinutes, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

// No mock data needed anymore

export default function GroundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentGround, setCurrentGround] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(searchParams.get("review") === "true");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [isMainImageVertical, setIsMainImageVertical] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const { user, token, login } = useAuth();
  const { showToast } = useToast();

  const currentImageIndex = useMemo(() => {
    if (!currentGround?.images || !mainImage) return 0;
    return currentGround.images.indexOf(mainImage);
  }, [currentGround, mainImage]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (!currentGround?.images?.length) return;
    const len = currentGround.images.length;
    const prevIdx = (currentImageIndex - 1 + len) % len;
    setMainImage(currentGround.images[prevIdx]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (!currentGround?.images?.length) return;
    const len = currentGround.images.length;
    const nextIdx = (currentImageIndex + 1) % len;
    setMainImage(currentGround.images[nextIdx]);
  };

  useEffect(() => {
    const now = new Date();
    if (!selectedDate) {
      setSelectedDate(now);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (currentGround?.images?.length > 0) {
      setMainImage(currentGround.images[0]);
    }
  }, [currentGround]);

  useEffect(() => {
    if (user && currentGround) {
      setIsFavorite(user.favorites?.includes(currentGround.id));
    }
  }, [user, currentGround]);

  useEffect(() => {
    const fetchGroundData = async () => {
      try {
        const [groundRes, reviewsRes] = await Promise.all([
          fetch(`/api/grounds/${id}`),
          fetch(`/api/reviews/${id}`)
        ]);

        if (groundRes.ok) {
          const groundData = await groundRes.json();
          setCurrentGround(groundData);
          setSelectedCourt(groundData.courts[0]);
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsReviewsLoading(false);
      }
    };
    if (id) fetchGroundData();
  }, [id]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedCourt) return;
      try {
        const response = await fetch(`/api/bookings/booked-slots/${selectedCourt.id}`);
        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data);
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err);
      }
    };
    fetchBookedSlots();
  }, [selectedCourt, selectedDate]);

  // Reset selected court when ground changes
  useEffect(() => {
    if (currentGround?.courts) {
      setSelectedCourt(currentGround.courts[0]);
    }
    setSelectedSlots([]);
  }, [currentGround]);

  const allDaySlots = useMemo(() => {
    if (!selectedCourt || !currentGround) return [];

    // Day of the week abbreviation, e.g. "Mon"
    const dayOfWeek = format(selectedDate, "EEE");

    // Find all custom slots for the active sport type and selected day of week
    const activeSport = (selectedCourt.sport_type || "").toLowerCase();
    const customSlots = (currentGround.time_slots || []).filter(slot => {
      const isSportMatch = (slot.sport_type || "").toLowerCase() === activeSport;
      const isDayMatch = (slot.days || []).includes(dayOfWeek);
      return isSportMatch && isDayMatch;
    });

    const slots = [];

    if (customSlots.length > 0) {
      // Use configured time slots
      customSlots.forEach((slot, index) => {
        // Parse start and end hours/minutes
        const [startH, startM] = slot.start_time.split(":").map(Number);
        // Note: 23:59 represents the end of the day, treat as 24:00
        const [endH, endM] = slot.end_time === "23:59" ? [24, 0] : slot.end_time.split(":").map(Number);

        // Generate hourly slots inside the configured slot range
        for (let h = startH; h < endH; h++) {
          let startTime = setHours(selectedDate, h);
          startTime = setMinutes(startTime, 0);
          startTime.setSeconds(0);
          startTime.setMilliseconds(0);

          let endTime = setHours(selectedDate, h + 1);
          endTime = setMinutes(endTime, 0);
          endTime.setSeconds(0);
          endTime.setMilliseconds(0);

          const startTimeISO = startTime.toISOString();
          const endTimeISO = endTime.toISOString();
          const isBooked = bookedSlots.includes(startTimeISO);
          const isPast = startTime < new Date();

          slots.push({
            id: `${selectedCourt.id}-${h}-${index}`,
            start_time: startTimeISO,
            end_time: endTimeISO,
            price: slot.price_per_hour,
            status: isBooked ? "booked" : isPast ? "past" : "available",
            available: !isBooked && !isPast
          });
        }
      });
    } else {
      // Fallback standard behavior: 6:00 to 24:00 at standard court price
      for (let i = 6; i < 24; i++) {
        let startTime = setHours(selectedDate, i);
        startTime = setMinutes(startTime, 0);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);

        const endTime = setHours(selectedDate, i + 1);
        endTime.setMinutes(0);
        endTime.setSeconds(0);
        endTime.setMilliseconds(0);

        const startTimeISO = startTime.toISOString();
        const endTimeISO = endTime.toISOString();
        const isPeak = i >= 18; // Peak hours after 6 PM
        const isBooked = bookedSlots.includes(startTimeISO);
        const isPast = startTime < new Date();

        slots.push({
          id: `${selectedCourt.id}-${i}`,
          start_time: startTimeISO,
          end_time: endTimeISO,
          price: isPeak ? selectedCourt.base_price : Math.round(selectedCourt.base_price * 0.8),
          status: isBooked ? "booked" : isPast ? "past" : "available",
          available: !isBooked && !isPast
        });
      }
    }

    // Sort slots chronologically to keep the list clean and intuitive
    return slots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [selectedCourt, currentGround, bookedSlots, selectedDate]);

  const handleBooking = () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const bookingData = {
      ground: {
        id: currentGround.id,
        name: currentGround.name,
        images: [currentGround.images[0]],
        location: currentGround.location
      },
      court: {
        id: selectedCourt.id,
        name: selectedCourt.name,
        sport_type: selectedCourt.sport_type
      },
      slots: selectedSlots,
      totalPrice: selectedSlots.reduce((sum, s) => sum + s.price, 0)
    };
    try {
      localStorage.setItem("pending_booking", JSON.stringify(bookingData));
      router.push("/checkout");
    } catch (err) {
      localStorage.clear(); // Emergency clear if quota exceeded
      localStorage.setItem("token", token); // Keep the token
      localStorage.setItem("pending_booking", JSON.stringify(bookingData));
      router.push("/checkout");
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      const response = await fetch(`/api/auth/favorites/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update auth context state silently
        login(token, updatedUser);
        setIsFavorite(updatedUser.favorites.includes(id));
        showToast(isFavorite ? "Removed from favorites" : "Added to favorites", "success");
      } else {
        showToast("Failed to update favorites", "error");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showToast("Something went wrong", "error");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  if (isLoading) return <div className="pt-32 text-center outfit text-gray-400">Loading ground details...</div>;
  if (!currentGround) return <div className="pt-32 text-center outfit text-gray-400">Ground not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-20">
      <Navbar />

      <main className="pt-20 md:pt-28 container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-10">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative h-48 sm:h-64 md:h-[500px] w-full rounded-[40px] overflow-hidden bg-slate-950 shadow-2xl shadow-black/5 flex items-center justify-center group">
                {/* Background blurred image fill to prevent blank edges */}
                {mainImage && (
                  <img
                    src={mainImage?.startsWith('http') || mainImage?.startsWith('data:') ? mainImage : `${mainImage}`}
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-35 select-none pointer-events-none"
                    alt=""
                  />
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={mainImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={mainImage?.startsWith('http') || mainImage?.startsWith('data:') ? mainImage : `${mainImage}`}
                    className="w-full h-full object-contain object-center relative z-10"
                    alt="Ground"
                  />
                </AnimatePresence>

                {/* Left Navigation Arrow */}
                {currentGround?.images?.length > 1 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl flex items-center justify-center border border-white/10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Right Navigation Arrow */}
                {currentGround?.images?.length > 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl flex items-center justify-center border border-white/10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                {/* Bottom Dots Indicators */}
                {currentGround?.images?.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 px-4 py-2.5 rounded-full bg-black/35 backdrop-blur-md border border-white/5">
                    {currentGround.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainImage(currentGround.images[idx]);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          currentImageIndex === idx
                            ? "bg-primary scale-125 shadow-md shadow-primary/50"
                            : "bg-white/40 hover:bg-white"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute top-6 left-6 flex gap-2 z-20">
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider text-secondary border border-black/5">
                    Verified Venue
                  </div>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {currentGround.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 smooth-transition border-2 bg-slate-950 flex items-center justify-center ${mainImage === img ? "border-primary scale-95 shadow-lg shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={img.startsWith('http') || img.startsWith('data:') ? img : `${img}`} className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30 select-none pointer-events-none" />
                    <img src={img.startsWith('http') || img.startsWith('data:') ? img : `${img}`} className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold outfit text-secondary mb-3">{currentGround.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{currentGround.location?.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-secondary bg-primary/5 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{currentGround.avg_rating || "N/A"}</span>
                    <span className="text-gray-400 font-medium ml-1">({currentGround.review_count} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-2xl border border-black/5 hover:bg-surface smooth-transition">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
                <button 
                  onClick={toggleFavorite}
                  disabled={isTogglingFavorite}
                  className="p-3 rounded-2xl border border-black/5 hover:bg-surface smooth-transition"
                >
                  <Heart 
                    className={`w-5 h-5 smooth-transition ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} 
                  />
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold outfit text-secondary mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Features & Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(currentGround.amenities || ["Changing Rooms", "Parking", "Water"]).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-black/5 group hover:border-primary/20 smooth-transition">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white smooth-transition">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="pt-10 border-t border-black/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold outfit text-secondary flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" /> Player Reviews
                  </h2>
                  <p className="text-gray-400 text-sm">See what other players have to say about this venue.</p>
                </div>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold text-secondary hover:bg-surface smooth-transition"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-12 p-8 rounded-[32px] bg-amber-50/50 border border-amber-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="text-lg font-bold text-secondary mb-4">Share Your Experience</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Rating</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="smooth-transition hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${newReview.rating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Comment</p>
                      <textarea
                        className="w-full p-4 rounded-2xl bg-white border border-black/5 text-sm outline-none focus:border-primary/30 smooth-transition min-h-[120px]"
                        placeholder="What did you like? How was the turf condition? (optional)"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        disabled={isSubmittingReview}
                        onClick={async () => {
                          setIsSubmittingReview(true);
                          try {
                            const token = localStorage.getItem("token");
                            const bookingId = searchParams.get("booking_id");

                            if (!token) {
                              setShowLoginModal(true);
                              return;
                            }

                            if (!bookingId) {
                              alert("Reviews can only be left for completed bookings. Please navigate via your bookings page.");
                              return;
                            }

                            const res = await fetch("/api/reviews/", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                ground_id: id,
                                booking_id: bookingId,
                                rating: newReview.rating,
                                comment: newReview.comment
                              })
                            });

                            if (res.ok) {
                              const added = await res.json();
                              // Refresh reviews and ground
                              const reviewsRes = await fetch(`/api/reviews/${id}`);
                              if (reviewsRes.ok) setReviews(await reviewsRes.json());

                              const groundRes = await fetch(`/api/grounds/${id}`);
                              if (groundRes.ok) setCurrentGround(await groundRes.json());

                              setShowReviewForm(false);
                              setNewReview({ rating: 5, comment: "" });
                            } else {
                              const err = await res.json();
                              alert(err.detail || "Failed to submit review");
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsSubmittingReview(false);
                          }
                        }}
                        className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-black smooth-transition disabled:opacity-50"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-8 py-3 text-gray-400 font-bold hover:text-secondary smooth-transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-6 rounded-3xl border border-black/5 bg-white hover:shadow-lg hover:shadow-black/5 smooth-transition">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {rev.user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-secondary text-sm">{rev.user_name}</p>
                            <p className="text-[10px] text-gray-400">{format(new Date(rev.created_at), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${rev.rating >= s ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{rev.comment || "Great experience! Loved playing here."}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-surface rounded-3xl border border-dashed border-black/10">
                    <p className="text-gray-400 font-medium italic">No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Booking Widget */}
          <div className="md:col-span-1">
            <div className="glass p-8 rounded-[40px] border border-black/5 shadow-2xl shadow-black/5 md:sticky md:top-24 h-fit">
              {/* Select Court - Now in the Sidebar */}
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 ml-1">Select Court</h3>
                <div className="flex gap-3 overflow-x-auto scroll-x pb-1">
                  {(currentGround.courts || []).map((court) => (
                    <button
                      key={court.id}
                      onClick={() => {
                        setSelectedCourt(court);
                        setSelectedSlots([]);
                      }}
                      className={`shrink-0 whitespace-nowrap p-4 rounded-2xl border smooth-transition text-left ${selectedCourt?.id === court.id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                        : "border-black/5 hover:border-primary/20 bg-white"
                        }`}
                    >
                      <p className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${selectedCourt?.id === court.id ? "text-primary" : "text-gray-400"}`}>
                        {court.sport_type}
                      </p>
                      <p className="font-bold text-secondary text-xs truncate">{court.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8 pt-8 border-t border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-secondary">Book Your Slot</h3>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">
                      {allDaySlots.filter(s => s.available).length} Slots Available
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Pick times for {selectedCourt?.name}</p>
              </div>

              {selectedDate ? (
                <SlotPicker
                  slots={allDaySlots}
                  multiSelect={true}
                  selectedDate={selectedDate}
                  maxDays={currentGround.advance_booking_days}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    setSelectedSlots([]);
                  }}
                  onSelect={(selectedObjects) => {
                    setSelectedSlots(selectedObjects);
                  }}
                />
              ) : (
                <div className="h-[420px] rounded-[32px] bg-surface animate-pulse" />
              )}

              <div className="mt-8 pt-8 border-t border-black/5 space-y-4">
                {selectedSlots.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">{selectedSlots.length} Slots Selected</span>
                    <span className="text-xl font-bold text-secondary">₹{totalAmount}</span>
                  </div>
                )}

                <button
                  disabled={selectedSlots.length === 0}
                  onClick={handleBooking}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-xl ${selectedSlots.length > 0
                    ? "bg-primary hover:bg-primary-dark text-white shadow-primary/20"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-black/5"
                    }`}
                >
                  <Zap className="w-5 h-5" />
                  {selectedSlots.length > 0 ? "Book Now" : "Select Slots to Book"}
                </button>

                <div className="flex items-center gap-2 justify-center py-2 px-4 bg-amber-50 rounded-xl border border-amber-100/50">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Save 20% by booking before 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedSlots.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 px-4 py-3 flex items-center justify-between shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
          <div>
            <p className="text-xs text-gray-500">{selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} · {selectedCourt?.name}</p>
            <p className="text-base font-bold text-secondary">
              ₹{totalAmount}
            </p>
          </div>
          <button
            onClick={handleBooking}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            Book Now →
          </button>
        </div>
      )}

      {/* Login Modal Popup */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full sm:max-w-md mx-0 sm:mx-auto p-10 rounded-none sm:rounded-[40px] border border-white/10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-screen">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white outfit">Login Required</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              You must login to book the slot and secure your match. Join our community of players today!
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-lg shadow-primary/20"
              >
                Login Now <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-4 text-gray-400 hover:text-white font-bold smooth-transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
