"use client";

import Navbar from "@/components/Navbar";
import { CreditCard, Wallet, Smartphone, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function CheckoutPage() {
  const router = useRouter();
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
      const response = await fetch("http://localhost:8000/api/bookings/", {
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
      router.push("/booking-confirmation");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) return null;

  const serviceFee = Math.round(bookingData.totalPrice * 0.03);
  const finalTotal = bookingData.totalPrice + serviceFee;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold outfit mb-12 text-secondary">Secure Checkout</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Summary */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl font-bold outfit mb-6 flex items-center gap-2 text-secondary">
              <Info className="w-5 h-5 text-primary" />
              Booking Summary
            </h2>

            <div className="glass p-6 rounded-3xl border border-black/5 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img src={bookingData.ground.images[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=100"} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">{bookingData.ground.name}</h3>
                  <p className="text-xs text-gray-400">{bookingData.court.name}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-black/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Date</span>
                  <span className="font-bold text-secondary">{format(new Date(bookingData.slots[0].start_time), "EEEE, do MMM")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Time Slots</span>
                  <span className="font-bold text-secondary text-right">
                    {bookingData.slots.map(s => format(new Date(s.start_time), "hh:mm a")).join(", ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Base Price</span>
                  <span className="font-bold text-secondary">₹{bookingData.totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Service Fee</span>
                  <span className="font-bold text-secondary">₹{serviceFee}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-black/5 flex justify-between items-center">
                <span className="font-bold text-lg text-secondary">Total Amount</span>
                <span className="text-2xl font-bold text-primary outfit">₹{finalTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-xs text-gray-500 font-medium">
                Secure SSL encrypted payment. Cancel up to 12 hours before for a full refund.
              </p>
            </div>
          </div>

          {/* Right: Payment */}
          <div className="order-1 md:order-2">
            <h2 className="text-xl font-bold outfit mb-6 text-secondary">Payment Method</h2>

            <div className="space-y-4 mb-12">
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
              className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-lg shadow-primary/20 ${isProcessing ? "bg-surface text-gray-400" : "bg-secondary hover:bg-primary text-white"
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
      className={`w-full p-5 rounded-2xl border text-left flex items-center gap-4 smooth-transition ${active
        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
        : "bg-surface border-black/5 hover:border-black/10"
        }`}
    >
      <div className={`${active ? "text-primary" : "text-gray-400"}`}>{icon}</div>
      <span className={`text-sm font-bold ${active ? "text-secondary" : "text-gray-400"}`}>{title}</span>
      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-black/10"}`}>
        {active && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}
