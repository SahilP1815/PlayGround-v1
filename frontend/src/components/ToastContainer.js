"use client";
import React from "react";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-[#1abc9c]" />,
  error: <AlertCircle className="w-5 h-5 text-[#e74c3c]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[#e67e22]" />,
  info: <Info className="w-5 h-5 text-[#3498db]" />
};

const styles = {
  success: "border-[#1abc9c] bg-[#e8f8f4]/30",
  error: "border-[#e74c3c] bg-[#fdeaea]/30",
  warning: "border-[#e67e22] bg-[#fef5e7]/30",
  info: "border-[#3498db] bg-[#ebf5fb]/30"
};

const progressColors = {
  success: "bg-[#1abc9c]",
  error: "bg-[#e74c3c]",
  warning: "bg-[#e67e22]",
  info: "bg-[#3498db]"
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-4 w-full max-w-xs pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative flex items-center gap-4 p-4 bg-white rounded-2xl border-l-[4px] shadow-2xl shadow-black/10 overflow-hidden ${styles[toast.type]}`}
          >
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
              {icons[toast.type]}
            </div>
            
            <div className="flex-grow">
              <p className="text-sm font-extrabold text-secondary leading-tight">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-lg smooth-transition text-gray-400 hover:text-secondary"
            >
              <X size={14} />
            </button>

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: toast.duration / 1000, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-[3px] ${progressColors[toast.type]}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
