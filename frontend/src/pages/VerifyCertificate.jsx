import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
const logo = "/logo.png";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaAward,
  FaFilePdf,
  FaArrowLeft,
  FaShieldAlt,
  FaSearch,
  FaGraduationCap,
  FaCalendarAlt,
  FaUserGraduate,
  FaExternalLinkAlt,
} from "react-icons/fa";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

export default function VerifyCertificate() {
  const { code: urlCode } = useParams();
  const [searchCode, setSearchCode] = useState(urlCode || "");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(Boolean(urlCode));
  const [error, setError] = useState(null);

  const fetchCertificate = async (codeToVerify) => {
    if (!codeToVerify || !codeToVerify.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setCertificate(null);

      const res = await api.get(`/api/certificates/verify/${codeToVerify.trim()}`);
      if (res.data?.certificate) {
        setCertificate(res.data.certificate);
      } else {
        setError("Certificate not found or invalid certificate code.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid certificate verification code. No record found in TSG database."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) {
      fetchCertificate(urlCode);
    }
  }, [urlCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      fetchCertificate(searchCode.trim());
    }
  };

  return (
    <div className="law-site min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 1. STICKY HEADER */}
      <BatchesHeader brandName="Legal Factory" />

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full flex flex-col items-center">
        {/* HEADING */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#D4A017]/10 border border-[#D4A017] text-[#D4A017] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <FaShieldAlt />
            <span>Cryptographic Credential Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Verify Authentic TSG Certificate
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter the certificate verification code printed on the official PDF to verify student credential authenticity against our permanent database.
          </p>
        </div>

        {/* SEARCH FORM */}
        <form onSubmit={handleSearch} className="w-full max-w-xl flex gap-3 mb-10">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-3.5 text-slate-500 text-sm" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="e.g. TSG-CERT-123456-7890"
              className="w-full bg-[#1E293B] border border-slate-700 focus:border-[#D4A017] rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono placeholder:text-slate-500 outline-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#D4A017] hover:bg-[#b58710] text-[#0B1220] font-black text-sm px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <span>Verify</span>
          </button>
        </form>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">
            Verifying credential against registry...
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="w-full max-w-2xl bg-red-950/40 border-2 border-red-500/60 rounded-2xl p-6 text-center shadow-xl animate-in fade-in">
            <FaTimesCircle className="text-4xl text-red-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-red-200">
              Verification Failed
            </h3>
            <p className="text-xs text-red-300 mt-1 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {/* SUCCESSFUL VERIFIED CERTIFICATE CARD */}
        {certificate && !loading && (
          <div className="w-full max-w-2xl bg-white text-slate-900 border-4 border-[#D4A017] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* CARD TOP BANNER */}
            <div className="bg-[#0B1220] text-white p-6 sm:p-8 text-center border-b-4 border-[#D4A017] relative">
              <div className="inline-flex items-center gap-2 bg-emerald-500 text-[#0B1220] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider mb-3 shadow">
                <FaCheckCircle className="text-sm" />
                <span>Officially Verified & Authentic</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Certificate of Completion
              </h2>
              <p className="text-xs text-amber-300 mt-1 font-semibold uppercase tracking-widest">
                A Mission for Vikshit Bharat 2047 • TSG LMS
              </p>
            </div>

            {/* CARD BODY */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* STUDENT NAME */}
              <div className="text-center border-b border-slate-200 pb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  This is proudly certified to
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0B1220]">
                  {certificate.student_name}
                </h3>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-500">
                  <span>
                    Roll ID: <strong className="font-mono text-[#7C2D12]">{certificate.student_code}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Grade: <strong className="text-emerald-700">{certificate.grade || "Grade A+"}</strong>
                  </span>
                </div>
              </div>

              {/* COURSE DETAILS */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Program Title:</span>
                  <span className="font-bold text-[#0B1220] text-right max-w-xs sm:max-w-sm">
                    {certificate.course_title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Duration:</span>
                  <span className="font-semibold text-slate-700">
                    {certificate.course_duration || "4 Months"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Issued Date:</span>
                  <span className="font-semibold text-slate-700">
                    {certificate.issue_date
                      ? new Date(certificate.issue_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Verified"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Verification Code:</span>
                  <span className="font-mono font-bold text-[#7C2D12] text-xs">
                    {certificate.certificate_code}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Issuing Authority:</span>
                  <span className="font-semibold text-slate-700">
                    {certificate.issued_by || "Legal Factory Administration"}
                  </span>
                </div>
              </div>

              {/* DOWNLOAD PDF ACTION */}
              {certificate.pdf_url ? (
                <div className="pt-2 text-center">
                  <a
                    href={certificate.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    download={`Legal_Factory_Certificate_${certificate.student_name}.pdf`}
                    className="inline-flex items-center gap-2 bg-[#0B1220] hover:bg-[#5A4BFF] text-white border-2 border-amber-400 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition cursor-pointer"
                  >
                    <FaFilePdf className="text-red-400 text-base" />
                    <span>Download Official Certificate PDF</span>
                  </a>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Verified digital copy certified by Legal Factory Administration.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800 font-semibold">
                  This certificate has been verified on record. The physical PDF file is being prepared by the administration.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <BatchesFooter brandName="Legal Factory" />
    </div>
  );
}
