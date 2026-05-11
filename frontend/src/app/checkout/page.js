"use client";

import Navbar from "@/components/Navbar";
import { CreditCard, Wallet, Smartphone, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push("/booking-confirmation");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold outfit mb-12">Secure Checkout</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Summary */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl font-bold outfit mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Booking Summary
            </h2>

            <div className="glass p-6 rounded-3xl border border-white/10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=100" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold">Elite Sports Arena</h3>
                  <p className="text-xs text-gray-400">Champions Turf (7v7)</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date</span>
                  <span className="font-medium text-white">Sunday, 12th Oct</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time</span>
                  <span className="font-medium text-white">06:00 PM - 07:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Base Price</span>
                  <span className="font-medium text-white">₹1,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Service Fee</span>
                  <span className="font-medium text-white">₹45</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="text-2xl font-bold text-primary outfit">₹1,545</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-xs text-gray-400">
                Your booking is protected. Cancel up to 12 hours before for a full refund.
              </p>
            </div>
          </div>

          {/* Right: Payment */}
          <div className="order-1 md:order-2">
            <h2 className="text-xl font-bold outfit mb-6">Payment Method</h2>

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
              className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition shadow-lg shadow-primary/20 ${isProcessing ? "bg-surface text-gray-500" : "bg-primary hover:bg-primary-dark text-white"
                }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Pay ₹1,545 <ArrowRight className="w-5 h-5" /></>
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
        ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
        : "glass border-white/5 hover:border-white/20"
        }`}
    >
      <div className={`${active ? "text-primary" : "text-gray-400"}`}>{icon}</div>
      <span className={`text-sm font-bold ${active ? "text-white" : "text-gray-400"}`}>{title}</span>
      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-white/10"}`}>
        {active && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}
