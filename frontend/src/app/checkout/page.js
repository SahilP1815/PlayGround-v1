"use client";

import Navbar from "@/components/Navbar";
import { CreditCard, Wallet, Smartphone, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("pending_booking");
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      router.push("/");
    }
  }, [router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // 1. Call Backend to create real booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ground_id: bookingData.ground.id,
          court_id: bookingData.court.id,
          slots: bookingData.slots.map(s => s.start_time),
          total_price: bookingData.totalPrice
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Payment processing failed");
      }

      // 2. Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 3. Success
      try {
        localStorage.setItem("last_booking", JSON.stringify(bookingData));
      } catch (err) {
        localStorage.removeItem("pending_booking"); // Clear pending first to make room
      }
      localStorage.removeItem("pending_booking");
      showToast("Booking confirmed successfully!", "success");
      router.push("/booking-confirmation");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) return null;

  const serviceFee = Math.round(bookingData.totalPrice * 0.03);
  const finalTotal = bookingData.totalPrice + serviceFee;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-[1200px] mx-auto pt-20 md:pt-32 pb-20 px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8 sm:mb-10 tracking-tight">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Column: Summary */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-teal-600" />
              Booking Summary
            </h2>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/5 shadow-xl shadow-black/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                  <img 
                    src={
                      bookingData.ground.images?.[0]
                        ? (bookingData.ground.images[0].startsWith("http") || bookingData.ground.images[0].startsWith("data:")
                            ? bookingData.ground.images[0]
                            : `${bookingData.ground.images[0]}`)
                        : "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=200"
                    } 
                    className="w-full h-full object-cover"
                    alt={bookingData.ground.name}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate mb-1">{bookingData.ground.name}</h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 truncate">{bookingData.court.name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-5 border-t border-black/5">
                <div className="flex justify-between text-sm items-center gap-4">
                  <span className="text-slate-500 font-medium shrink-0">Date</span>
                  <span className="font-bold text-slate-900 truncate text-right">{format(new Date(bookingData.slots[0].start_time), "EEEE, do MMM")}</span>
                </div>
                <div className="flex justify-between text-sm items-center gap-4">
                  <span className="text-slate-500 font-medium shrink-0">Time Slots</span>
                  <span className="font-bold text-slate-900 truncate text-right min-w-0">
                    {bookingData.slots.map(s => format(new Date(s.start_time), "hh:mm a")).join(", ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center gap-4">
                  <span className="text-slate-500 font-medium shrink-0">Base Price</span>
                  <span className="font-bold text-slate-900 shrink-0">₹{bookingData.totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm items-center gap-4">
                  <span className="text-slate-500 font-medium shrink-0">Service Fee</span>
                  <span className="font-bold text-slate-900 shrink-0">₹{serviceFee}</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-black/5 flex justify-between items-center gap-4">
                <span className="font-extrabold text-base text-slate-900 shrink-0">Total Amount</span>
                <span className="text-2xl font-black text-teal-600 shrink-0">₹{finalTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100 text-center sm:text-left text-teal-600">
              <ShieldCheck className="w-5 h-5 shrink-0 hidden sm:block" />
              <p className="text-xs font-bold leading-relaxed w-full">
                Secure SSL encrypted payment. Cancel up to 12 hours before for a full refund.
              </p>
            </div>
          </div>

          {/* Right Column: Payment */}
          <div className="flex flex-col gap-6 mt-4 md:mt-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Payment Method</h2>

            <div className="flex flex-col gap-3 sm:gap-4">
              <PaymentOption
                id="upi"
                icon={<Smartphone className="w-5 h-5" />}
                title="UPI (PhonePe, GPay, Paytm)"
                active={paymentMethod === "upi"}
                onClick={() => setPaymentMethod("upi")}
              />
              <PaymentOption
                id="card"
                icon={<CreditCard className="w-5 h-5" />}
                title="Credit / Debit Card"
                active={paymentMethod === "card"}
                onClick={() => setPaymentMethod("card")}
              />
              <PaymentOption
                id="wallet"
                icon={<Wallet className="w-5 h-5" />}
                title="Net Banking / Wallets"
                active={paymentMethod === "wallet"}
                onClick={() => setPaymentMethod("wallet")}
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full min-h-[56px] px-6 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all mt-4 ${
                isProcessing 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 cursor-pointer"
              }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Pay ₹{finalTotal} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function PaymentOption({ icon, title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[60px] p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4 text-left transition-all ${
        active 
          ? "border-2 border-teal-600 bg-teal-50/50 shadow-md shadow-teal-600/5" 
          : "border border-black/5 bg-white hover:border-black/10"
      }`}
    >
      <div className={`flex items-center shrink-0 ${active ? "text-teal-600" : "text-slate-400"}`}>
        {icon}
      </div>
      <span className={`text-sm sm:text-base font-bold truncate min-w-0 ${active ? "text-slate-900" : "text-slate-500"}`}>
        {title}
      </span>
      <div className={`ml-auto shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        active ? "border-teal-600 bg-teal-600" : "border-black/10 bg-transparent"
      }`}>
        {active && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}
