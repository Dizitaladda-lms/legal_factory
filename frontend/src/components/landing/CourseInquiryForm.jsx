import React, { useState } from "react";
import api from "../../lib/api";

const courses = ["CLAT UG", "Judiciary", "CLAT PG", "Not sure yet"];

export default function CourseInquiryForm({ source = "homepage", compact = false }) {
  const [form, setForm] = useState({ name: "", phone: "", course_interest: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await api.post("/api/blogs/inquiries", { ...form, source });
      setStatus({ type: "success", message: "Thanks! Our counsellor will contact you shortly." });
      setForm({ name: "", phone: "", course_interest: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.message || "We couldn’t send your enquiry. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
      <label className="grid gap-1.5 text-sm font-semibold text-[#3d3d3d]">
        Your name
        <input required autoComplete="name" maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter your name" className="min-h-12 rounded-xl border border-[#e5d9da] bg-white px-4 font-normal outline-none transition placeholder:text-[#999] focus:border-[#a32131] focus:ring-2 focus:ring-[#a32131]/15" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-[#3d3d3d]">
        Phone number
        <input required type="tel" autoComplete="tel" inputMode="tel" maxLength={20} pattern="[+0-9 ()-]{7,20}" title="Enter a valid phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Enter your phone number" className="min-h-12 rounded-xl border border-[#e5d9da] bg-white px-4 font-normal outline-none transition placeholder:text-[#999] focus:border-[#a32131] focus:ring-2 focus:ring-[#a32131]/15" />
      </label>
      <label className={`grid gap-1.5 text-sm font-semibold text-[#3d3d3d] ${compact ? "" : "sm:col-span-2"}`}>
        Course you’re interested in
        <select required value={form.course_interest} onChange={(event) => setForm({ ...form, course_interest: event.target.value })} className="min-h-12 rounded-xl border border-[#e5d9da] bg-white px-4 font-normal text-[#3d3d3d] outline-none transition focus:border-[#a32131] focus:ring-2 focus:ring-[#a32131]/15">
          <option value="" disabled>Select a course</option>
          {courses.map((course) => <option key={course} value={course}>{course}</option>)}
        </select>
      </label>
      <button type="submit" disabled={submitting} className={`${compact ? "" : "sm:col-span-2"} inline-flex min-h-12 items-center justify-center rounded-full bg-[#a32131] px-6 text-sm font-bold text-white transition hover:bg-[#841927] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a32131] disabled:cursor-wait disabled:opacity-70`}>
        {submitting ? "Sending…" : "Request a call back"}
      </button>
      {status.message && <p role="status" aria-live="polite" className={`${compact ? "" : "sm:col-span-2"} text-sm font-medium ${status.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{status.message}</p>}
    </form>
  );
}
