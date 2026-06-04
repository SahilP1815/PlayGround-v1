"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronLeft,
  Loader2,
  XCircle,
  ArrowRight,
  Check,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import OwnerSidebar from "@/components/OwnerSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/context/ToastContext";
import "../../../owner.css";

export default function GroundStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const groundId = params.id;

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroundStatus();
  }, [groundId]);

  const fetchGroundStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/grounds/${groundId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGround(data);
      } else {
        showToast("Failed to load ground status", "error");
        router.push("/owner/grounds");
      }
    } catch (err) {
      showToast("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/grounds/${groundId}/submit-for-review`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const updated = await res.json();
        setGround(updated);
        showToast("Ground submitted for verification!", "success");
      } else {
        const err = await res.json();
        showToast(err.detail || "Submission failed", "error");
      }
    } catch (err) {
      showToast("Submission error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const steps = [
    { id: "draft", label: "Draft", desc: "Basic details & photos" },
    { id: "pending", label: "Submitted", desc: "Awaiting admin review" },
    { id: "review", label: "Verifying", desc: "Document validation" },
    { id: "verified", label: "Verified", desc: "Ground is now live!" }
  ];

  const getStepStatus = (stepId, index) => {
    const statusOrder = ["draft", "pending", "review", "verified"];
    const currentStatusIndex = statusOrder.indexOf(ground.status === "rejected" ? "review" : ground.status);
    
    if (ground.status === "verified") return "completed";
    if (ground.status === "rejected" && stepId === "review") return "rejected";
    if (index < currentStatusIndex) return "completed";
    if (index === currentStatusIndex) return "active";
    return "upcoming";
  };

  const canSubmit = ground.status === "draft" && ground.verification_docs?.property_proof;

  return (
    <ProtectedRoute role="owner">
      <div className="pg-body">
        <OwnerSidebar />
      <main className="pg-main">
        <div className="pg-topbar">
          <button onClick={() => router.push("/owner/grounds")} className="pg-breadcrumb flex items-center gap-2 hover:text-primary smooth-transition">
            <ChevronLeft size={16} /> My Grounds › <span>Verification Status</span>
          </button>
        </div>

        <div className="pg-container max-w-4xl">
          <div className="mb-12">
            <h1 className="text-3xl font-extrabold outfit text-secondary mb-2">Ground Status: {ground.name}</h1>
            <p className="text-gray-500">Track your venue's journey to becoming a verified partner.</p>
          </div>

          {/* Stepper */}
          <div className="pg-card mb-8">
            <div className="flex flex-col md:flex-row justify-between relative gap-8 md:gap-0">
              {/* Stepper Line (Desktop) */}
              <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-gray-100 z-0">
                <div 
                  className="h-full bg-primary smooth-transition" 
                  style={{ width: `${(Math.max(0, ["draft", "pending", "review", "verified"].indexOf(ground.status)) / 3) * 100}%` }}
                />
              </div>

              {steps.map((step, i) => {
                const status = getStepStatus(step.id, i);
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center md:w-1/4 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 smooth-transition ${
                      status === "completed" ? "bg-primary text-white shadow-lg shadow-primary/20" :
                      status === "active" ? "bg-white border-4 border-primary text-primary" :
                      status === "rejected" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" :
                      "bg-white border-2 border-gray-100 text-gray-300"
                    }`}>
                      {status === "completed" ? <CheckCircle2 size={24} /> : 
                       status === "rejected" ? <XCircle size={24} /> : 
                       <span className="font-bold">{i + 1}</span>}
                    </div>
                    <h3 className={`font-bold text-sm mb-1 ${status === "upcoming" ? "text-gray-300" : "text-secondary"}`}>{step.label}</h3>
                    <p className="text-[10px] text-gray-400 font-medium px-4">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {ground.status === "rejected" && (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-8 flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-2">Verification Rejected</h3>
                <p className="text-sm text-red-500/80 leading-relaxed mb-4">
                  {ground.rejection_reason || "Your documents did not meet our verification standards. Please review the comments below and re-upload the necessary files."}
                </p>
                <button 
                  onClick={() => router.push(`/owner/grounds/edit/${groundId}`)}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 smooth-transition"
                >
                  Edit & Re-submit
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Documents Checklist */}
            <div className="pg-card h-full">
              <h2 className="text-xl font-bold outfit text-secondary mb-6 flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                Documents Checklist
              </h2>
              <div className="space-y-4">
                <StatusItem label="Property Proof" uploaded={!!ground.verification_docs?.property_proof} required />
                <StatusItem label="Government ID" uploaded={!!ground.verification_docs?.gov_id} />
                <StatusItem label="Municipal Permission" uploaded={!!ground.verification_docs?.municipal_permission} />
                <StatusItem label="Bank Details" uploaded={!!ground.verification_docs?.bank_details} />
              </div>
            </div>

            {/* Next Action */}
            <div className="pg-card h-full bg-surface">
              <h2 className="text-xl font-bold outfit text-secondary mb-6 flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                Required Action
              </h2>
              
              {ground.status === "draft" ? (
                <div className="space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Once you've uploaded all required documents and details, submit your ground for our team to review.
                  </p>
                  <div className="p-4 bg-white rounded-2xl border border-black/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Submission Readiness</p>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={`flex items-center gap-1 ${ground.verification_docs?.property_proof ? "text-primary" : "text-gray-400"}`}>
                        {ground.verification_docs?.property_proof ? <Check size={14} /> : <X size={14} />}
                        Property Proof {ground.verification_docs?.property_proof ? "Uploaded" : "Missing"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitForReview}
                    disabled={!canSubmit || submitting}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 smooth-transition ${
                      canSubmit && !submitting ? "bg-secondary text-white hover:bg-primary shadow-lg shadow-secondary/20" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit for Review"} <ArrowRight size={18} />
                  </button>
                </div>
              ) : ground.status === "pending" || ground.status === "review" ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="text-orange-500 animate-spin" size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-secondary mb-2 uppercase tracking-wider">Review in Progress</p>
                    <p className="text-sm text-gray-500 px-4">
                      Our team is currently validating your documents. This usually takes <strong>2-3 business days</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-green-500" size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-secondary mb-2 uppercase tracking-wider text-green-600">Verification Complete</p>
                    <p className="text-sm text-gray-500 px-4">
                      Your ground is verified and live! You can now accept bookings from players.
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push("/owner/dashboard")}
                    className="w-full bg-white border border-black/5 text-secondary py-4 rounded-2xl font-bold hover:bg-surface smooth-transition"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}

function StatusItem({ label, uploaded, required }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5">
      <div>
        <p className="text-sm font-bold text-secondary">{label}</p>
        <p className="text-[10px] text-gray-400">{required ? "Required Document" : "Optional Document"}</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
        uploaded ? "bg-green-50 text-green-500" : "bg-gray-50 text-gray-300"
      }`}>
        {uploaded ? <><Check size={10} /> Uploaded</> : "Missing"}
      </div>
    </div>
  );
}
