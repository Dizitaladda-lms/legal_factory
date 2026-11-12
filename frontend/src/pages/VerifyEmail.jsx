import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck, Mail, RefreshCw, LogIn } from "lucide-react";
import api from "../lib/api";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get("token");
  const statusParam = searchParams.get("status");
  const emailParam = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(!statusParam && Boolean(tokenParam));
  const [isSuccess, setIsSuccess] = useState(statusParam === "success");
  const [errorMessage, setErrorMessage] = useState(
    statusParam === "expired"
      ? "This verification link has expired. Please request a new verification link below."
      : statusParam === "invalid"
      ? "Invalid verification link. Please check your email or request a new one."
      : ""
  );
  const [verifiedEmail, setVerifiedEmail] = useState(emailParam || "");
  const [resendEmail, setResendEmail] = useState(emailParam || "");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // If status=success is already present from backend redirect
    if (statusParam === "success") {
      setIsSuccess(true);
      setIsLoading(false);
      const targetEmail = emailParam || "";
      setTimeout(() => {
        navigate(`/checkout?verified=true${targetEmail ? `&email=${encodeURIComponent(targetEmail)}` : ""}`);
      }, 1000);
      return;
    }

    // If token is present, verify via API
    if (tokenParam) {
      setIsLoading(true);
      api
        .post("/api/auth/verify-email", { token: tokenParam })
        .then((res) => {
          if (res.data?.success) {
            setIsSuccess(true);
            const targetEmail = res.data.email || emailParam || "";
            if (targetEmail) setVerifiedEmail(targetEmail);
            setTimeout(() => {
              navigate(`/checkout?verified=true${targetEmail ? `&email=${encodeURIComponent(targetEmail)}` : ""}`);
            }, 1000);
          }
        })
        .catch((err) => {
          console.error("Verification failed:", err);
          setErrorMessage(
            err.response?.data?.message ||
              "Unable to verify your email address. The link may have expired or is invalid."
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [tokenParam, statusParam, emailParam, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes("@")) return;

    try {
      setResendLoading(true);
      setErrorMessage("");
      const res = await api.post("/api/auth/send-verification-email", {
        email: resendEmail.trim().toLowerCase(),
      });
      if (res.data?.success) {
        setResendSuccess(true);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to resend verification link.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="law-site min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* 1. STICKY HEADER */}
      <BatchesHeader brandName="Legal Factory" />

      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Main Container Card */}
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10">
          {/* Header Ribbon */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-center border-b-4 border-[#5A4BFF]">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 inline-flex items-center gap-1 mb-1">
              <ShieldCheck size={14} /> Legal Factory Account Verification
            </span>
            <h2 className="text-2xl font-black text-white">Student Email Verification</h2>
          </div>

        {/* Content Box */}
        <div className="p-8 sm:p-10 text-center">
          {isLoading ? (
            <div className="py-8 space-y-4">
              <RefreshCw size={48} className="text-[#D4A017] animate-spin mx-auto" />
              <h3 className="text-xl font-bold text-slate-800">Verifying Your Email...</h3>
              <p className="text-sm text-slate-500">
                Please wait while we secure your account in our student registry.
              </p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-300 animate-bounce">
                <CheckCircle2 size={46} />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                  Verification Confirmed
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  Email Verified! 🎉
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {verifiedEmail ? (
                    <>
                      <strong>{verifiedEmail}</strong> has been successfully authenticated.
                    </>
                  ) : (
                    "Your email address has been verified successfully."
                  )}
                  <br />
                  You can now return to checkout to complete your course admission or access your student portal.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-gradient-to-r from-[#7C2D12] to-[#b88a10] hover:from-[#60230e] hover:to-[#9c750d] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                >
                  Return to Checkout & Complete Admission <ArrowRight size={16} />
                </button>

                <Link
                  to="/login"
                  className="w-full bg-slate-900 hover:bg-black text-white py-3 px-6 rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2 transition hover:scale-[1.02]"
                >
                  <LogIn size={16} /> Log In to Student Portal
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-2 border-red-300">
                <XCircle size={46} />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Verification Incomplete
                </h3>
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mt-3 leading-relaxed">
                  {errorMessage || "The verification link is invalid or has already been used."}
                </p>
              </div>

              {resendSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-800 text-xs font-semibold">
                  A fresh verification link has been dispatched to <strong>{resendEmail}</strong>! Please check your inbox and spam folder.
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3 pt-2">
                  <div className="text-left">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Resend Link to Email:
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C2D12]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full bg-[#0B1220] hover:bg-[#7C2D12] text-white py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      "Send New Verification Link ✉️"
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2">
                <Link
                  to="/checkout"
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline transition"
                >
                  &larr; Back to Checkout Page
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-xs text-slate-500">
          Need help? Call Admissions at <a href="tel:+919876543210" className="font-bold text-slate-700">+91 98765 43210</a>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <BatchesFooter brandName="Legal Factory" />
  </div>
  );
}
