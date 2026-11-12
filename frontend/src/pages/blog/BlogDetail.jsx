import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaClock,
  FaEye,
  FaCalendarAlt,
  FaChevronRight,
  FaShareAlt,
  FaWhatsapp,
  FaLinkedin,
  FaTwitter,
  FaLink,
  FaCheck,
  FaBookOpen,
  FaListUl,
  FaQuestionCircle,
  FaChevronDown,
  FaArrowLeft,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // first FAQ opened by default
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const [leadMessage, setLeadMessage] = useState("");
  const [doubt, setDoubt] = useState({ name: "", email: "", body: "" });
  const [doubtMessage, setDoubtMessage] = useState("");

  const contentRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/blogs/slug/${slug}`);
      if (res.data?.success && res.data?.blog) {
        setBlog(res.data.blog);
      } else {
        setError("Article not found.");
      }
    } catch (err) {
      console.error("Error loading blog details:", err);
      setError("Failed to load article.");
    } finally {
      setLoading(false);
    }
  };

  // Inject Schema.org JSON-LD dynamically into <head>
  useEffect(() => {
    if (!blog?.schema?.combined) return;

    const existingScript = document.getElementById("blog-schema-jsonld");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = "blog-schema-jsonld";
    script.type = "application/ld+json";
    script.text = JSON.stringify(blog.schema.combined);
    document.head.appendChild(script);

    // Update document title and meta description
    if (blog.meta_title) {
      document.title = blog.meta_title;
    } else if (blog.title) {
      document.title = `${blog.title} | Dizital Adda`;
    }

    return () => {
      const el = document.getElementById("blog-schema-jsonld");
      if (el) el.remove();
    };
  }, [blog]);

  useEffect(() => {
    if (!blog?.id) return undefined;
    const startedAt = Date.now();
    api.post("/api/blogs/analytics", { blog_id: blog.id, event: "view" }).catch(() => {});
    return () => {
      const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      api.post("/api/blogs/analytics", { blog_id: blog.id, event: "time_on_page", value: seconds }).catch(() => {});
    };
  }, [blog?.id]);

  // Dynamic Heading ID injection and intersection observer for active TOC highlighting
  useEffect(() => {
    if (!contentRef.current || !blog) return;

    const headings = contentRef.current.querySelectorAll("h2, h3");
    let index = 1;

    headings.forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
        heading.id = `section-${index++}-${text.slice(0, 25)}`;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [blog]);

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveHeadingId(id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const submitLead = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/blogs/leads", { ...lead, blog_id: blog.id });
      setLeadMessage("Thanks. We’ll contact you with the study resource.");
      setLead({ name: "", phone: "", email: "" });
    } catch (submitError) {
      setLeadMessage(submitError.response?.data?.message || "Could not submit your request. Please try again.");
    }
  };

  const submitDoubt = async (event) => {
    event.preventDefault();
    try {
      const result = await api.post("/api/blogs/comments", { ...doubt, blog_id: blog.id });
      setDoubtMessage(result.data?.message || "Your question was submitted for review.");
      setDoubt({ name: "", email: "", body: "" });
    } catch (submitError) {
      setDoubtMessage(submitError.response?.data?.message || "Could not submit your question. Please try again.");
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blog?.title || "Dizital Adda Tech Roadmap");
  const trackBlogEvent = (event) => api.post("/api/blogs/analytics", { blog_id: blog?.id, event }).catch(() => {});

  if (loading) {
    return (
      <div className="law-site min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-[#0B1220] rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium text-sm">Preparing comprehensive guide...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="law-site min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-slate-800">Article Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm max-w-md">
          The requested guide could not be located or may have been updated.
        </p>
        <Link
          to="/blogs"
          className="mt-6 inline-flex items-center gap-2 bg-[#0B1220] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#7C2D12] transition"
        >
          <FaArrowLeft /> Back to All Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="law-site min-h-screen bg-[#F8FAFC] text-slate-800">
      {/* 1. STICKY HEADER */}
      <BatchesHeader brandName="Legal Factory" />

      {/* ========================================================= */}
      {/* 1. TOP BREADCRUMB STRIP */}
      {/* ========================================================= */}
      <nav aria-label="Breadcrumb" className="bg-[#0B1220] text-slate-300 text-xs py-3 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link to="/" className="hover:text-amber-400 transition">Home</Link>
          <FaChevronRight className="text-[9px] text-slate-500" />
          <Link to="/blogs" className="hover:text-amber-400 transition">Blogs</Link>
          <FaChevronRight className="text-[9px] text-slate-500" />
          <Link
            to={`/blogs?category=${encodeURIComponent(blog.category)}`}
            className="hover:text-amber-400 text-amber-300 font-medium transition"
          >
            {blog.category}
          </Link>
          <FaChevronRight className="text-[9px] text-slate-500" />
          <span className="text-slate-400 truncate max-w-[280px] sm:max-w-md">
            {blog.title}
          </span>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 2. ARTICLE HEADER SECTION */}
      {/* ========================================================= */}
      <header className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Category Pill */}
          <div className="inline-block bg-[#0B1220] text-amber-300 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#D4A017]/30 mb-4">
            {blog.category}
          </div>

          {/* H1 EQUIVALENT TITLE (Under 65 chars or full title) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1220] tracking-tight leading-tight">
            {blog.title}
          </h1>

          {/* Author & Meta Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              {blog.author_photo ? <img src={blog.author_photo} alt={blog.author_name || "Article author"} width="48" height="48" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-300/40" /> : <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-300 font-black text-base flex items-center justify-center ring-2 ring-amber-300/40">{blog.author_name ? blog.author_name[0] : "C"}</div>}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {blog.author_name}
                </div>
                <div className="text-xs text-slate-500">
                  {blog.author_role || "Dizital Adda Faculty"}
                </div>
              </div>
            </div>

            {/* Read Time, Date, Views */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-slate-400" />
                {new Date(blog.published_at || blog.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <FaClock />
                {blog.read_time}
              </span>
              {blog.updated_at && blog.updated_at !== blog.created_at && <span className="text-[11px]">Updated {new Date(blog.updated_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FaEye className="text-slate-400" />
                {(blog.views || 1).toLocaleString()} Reads
              </span>
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1.5">
              <FaShareAlt className="text-xs" /> Share:
            </span>
            <a
              href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition"
              title="Share on WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram" className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-white flex items-center justify-center transition">TG</a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white flex items-center justify-center transition"
              title="Share on LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white flex items-center justify-center transition"
              title="Share on X"
            >
              <FaTwitter />
            </a>
            <button
              onClick={handleCopyLink}
              className="h-9 px-3.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Copy URL"
            >
              {copiedLink ? <FaCheck className="text-emerald-600" /> : <FaLink />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. HERO BANNER IMAGE */}
      {/* ========================================================= */}
      {blog.featured_image && (
        <div className="max-w-5xl mx-auto px-6 -mt-6">
          <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
            <img
              src={blog.featured_image}
              alt={blog.featured_image_alt || blog.title}
              width="1200"
              height="514"
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MAIN ARTICLE CONTENT + STICKY AUTO-TOC LAYOUT */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* LEFT / CENTER: ARTICLE BODY */}
          <main className="lg:col-span-8">
            <article
              ref={contentRef}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm blog-prose-content"
            >
              <div
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>

            <section aria-labelledby="resource-title" className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
              <h2 id="resource-title" className="text-xl font-black text-slate-900">Get free CA &amp; CS study resources</h2>
              <p className="mt-2 text-sm text-slate-600">Request notes and exam preparation updates from our academic team.</p>
              <form onSubmit={submitLead} className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Request study resources">
                <label className="text-xs font-bold">Name<input required autoComplete="name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal" /></label>
                <label className="text-xs font-bold">Phone<input required type="tel" autoComplete="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal" /></label>
                <label className="text-xs font-bold">Email<input required type="email" autoComplete="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal" /></label>
                <button className="sm:col-span-3 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-amber-700">Request free resources</button>
              </form>
              {leadMessage && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{leadMessage}</p>}
            </section>

            <section aria-labelledby="doubt-title" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 id="doubt-title" className="text-xl font-black text-slate-900">Ask a doubt</h2>
              <p className="mt-1 text-sm text-slate-600">Questions are reviewed before they appear publicly.</p>
              <form onSubmit={submitDoubt} className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold">Name<input required value={doubt.name} onChange={(e) => setDoubt({ ...doubt, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" /></label>
                <label className="text-xs font-bold">Email<input required type="email" value={doubt.email} onChange={(e) => setDoubt({ ...doubt, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" /></label>
                <label className="text-xs font-bold sm:col-span-2">Your question<textarea required rows={3} value={doubt.body} onChange={(e) => setDoubt({ ...doubt, body: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" /></label>
                <button className="sm:col-span-2 justify-self-start rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white">Submit question</button>
              </form>
              {doubtMessage && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{doubtMessage}</p>}
            </section>
            {(blog.previousPost || blog.nextPost) && <nav aria-label="Post navigation" className="mt-8 grid gap-3 sm:grid-cols-2">
              {blog.previousPost ? <Link to={`/blog/${blog.previousPost.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-amber-400"><span className="block text-xs text-slate-500">Previous post</span><strong>{blog.previousPost.title}</strong></Link> : <span />}
              {blog.nextPost && <Link to={`/blog/${blog.nextPost.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 text-right hover:border-amber-400"><span className="block text-xs text-slate-500">Next post</span><strong>{blog.nextPost.title}</strong></Link>}
            </nav>}

            {/* AUTHOR BIO CARD */}
            <div className="mt-10 bg-slate-900 rounded-3xl p-8 text-white border-2 border-[#D4A017] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {blog.author_photo ? <img src={blog.author_photo} alt={blog.author_name || "Article author"} width="80" height="80" className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-4 ring-white/10" /> : <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 font-black text-3xl flex items-center justify-center shrink-0 ring-4 ring-white/10">{blog.author_name ? blog.author_name[0] : "C"}</div>}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  Article Author{blog.reviewer_name ? ` · Reviewed by ${blog.reviewer_name}${blog.reviewer_credentials ? `, ${blog.reviewer_credentials}` : ""}` : " & Faculty Mentor"}
                </span>
                <h3 className="text-xl font-black text-white mt-2">
                  {blog.author_name}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {blog.author_role || "Dizital Adda Master Faculty"}
                </p>
                <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  {blog.author_bio || "Faculty member supporting CA and CS learners with practical, exam-focused guidance."}
                </p>
              </div>
            </div>

            {/* INTERACTIVE FAQS ACCORDION (If present) */}
            {blog.faqs && blog.faqs.length > 0 && (
              <section className="mt-12 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-bold">
                    <FaQuestionCircle />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1220]">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-slate-500 text-xs">
                      Instant answers to common queries regarding this roadmap & certifications
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {blog.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left px-5 py-4 font-bold text-sm sm:text-base text-slate-800 hover:text-amber-700 flex items-center justify-between gap-4 bg-slate-50/70"
                        >
                          <span>{faq.question}</span>
                          <FaChevronDown
                            className={`text-xs text-slate-400 transition-transform duration-200 shrink-0 ${
                              isOpen ? "rotate-180 text-amber-600" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </main>

          {/* RIGHT COLUMN: STICKY SIDEBAR WITH AUTO-TOC & PROMOTIONAL CARD */}
          <aside className="lg:col-span-4 space-y-8">
            {/* 1. AUTO TABLE OF CONTENTS (AUTO-TOC) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-16">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                <FaListUl className="text-amber-600" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Table of Contents
                </h3>
              </div>

              {blog.headings && blog.headings.length > 0 ? (
                <ul className="space-y-1 text-xs max-h-[60vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {blog.headings.map((h, i) => {
                    const isActive = activeHeadingId.includes(h.id) || activeHeadingId.includes(h.text.slice(0, 15).toLowerCase());
                    return (
                      <li
                        key={i}
                        className={h.level === 3 ? "pl-4 text-slate-500" : "text-slate-700 font-bold"}
                      >
                        <button
                          onClick={() => scrollToHeading(h.id)}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-150 leading-relaxed block ${
                            isActive
                              ? "bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-500 pl-3"
                              : "hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {h.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-slate-400 text-xs">Table of Contents generated automatically from headings.</p>
              )}

              {/* 2. MATCHING COURSE CROSS-SELL CTA WIDGET */}
              {blog.crossSellCourse && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="p-5 bg-[#0F172A] rounded-2xl text-white shadow-md border border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      {blog.crossSellCourse.badge}
                    </span>
                    <h4 className="text-sm font-black text-white mt-2 leading-snug">
                      {blog.crossSellCourse.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      {blog.crossSellCourse.blurb}
                    </p>
                    <Link
                      to={blog.crossSellCourse.link}
                      onClick={() => trackBlogEvent("cta_click")}
                      className="mt-4 w-full bg-[#D4A017] hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md"
                    >
                      <span>Explore Cohort</span>
                      <FaArrowRight className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              )}

              {/* 3. FREE CAREER COUNSELING CTA */}
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <FaGraduationCap className="text-amber-700" />
                  <span>Confused about your tech path?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Speak directly with a senior industry mentor at Dizital Adda for personalized 1-on-1 career guidance.
                </p>
                <a
                  href="tel:+918810606010"
                  className="mt-2.5 inline-block text-[11px] font-extrabold text-amber-800 hover:text-amber-950 underline"
                >
                  Call Counselor: +91-8810606010
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* ========================================================= */}
        {/* 5. RELATED ARTICLES / NEXT READS */}
        {/* ========================================================= */}
        {blog.related && blog.related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  Continue Reading
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0B1220] mt-1">
                  Related Career Guides & Playbooks
                </h3>
              </div>
              <Link
                to="/blogs"
                className="text-xs font-bold text-[#0B1220] hover:text-[#7C2D12] inline-flex items-center gap-1.5"
              >
                <span>View All Articles</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {blog.related.map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  to={`/blog/${rel.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-amber-400 transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100 relative">
                      <img
                        src={rel.featured_image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-[#0B1220]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {rel.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
                        <FaClock className="text-amber-500" />
                        <span>{rel.read_time}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-sm sm:text-base leading-snug line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2 text-[11px] font-bold text-[#0B1220] flex items-center justify-between border-t border-slate-50">
                    <span>Read Guide</span>
                    <FaArrowRight className="text-[9px] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0B1220] p-3 shadow-2xl border-t border-amber-400/40 flex gap-2">
        <Link to="/ca/batches" onClick={() => trackBlogEvent("cta_click")} className="flex-1 text-center rounded-lg bg-amber-400 text-slate-950 py-3 text-xs font-extrabold">Explore CA Courses</Link>
        <Link to="/cs/batches" onClick={() => trackBlogEvent("cta_click")} className="flex-1 text-center rounded-lg border border-white/30 text-white py-3 text-xs font-extrabold">Explore CS Courses</Link>
      </div>
      <BatchesFooter brandName="Legal Factory" />

      {/* INJECTED BLOG STYLES FOR RICH PROSE & TABLES */}
      <style>{`
        .blog-prose-content h2 {
          font-family: 'Fredoka', 'Segoe UI', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #0B1220;
          margin-top: 2.25rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          border-bottom: 2px solid #F1F5F9;
          padding-bottom: 0.5rem;
          scroll-margin-top: 100px;
        }
        .blog-prose-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1E293B;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          scroll-margin-top: 100px;
        }
        .blog-prose-content p {
          color: #334155;
          font-size: 1rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .blog-prose-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .blog-prose-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .blog-prose-content li {
          margin-bottom: 0.6rem;
        }
        .blog-prose-content strong {
          color: #0F172A;
          font-weight: 700;
        }
        .blog-prose-content figure {
          margin: 2rem 0;
          text-align: center;
        }
        .blog-prose-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1.25rem;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
        }
        .blog-prose-content figcaption {
          font-size: 0.8rem;
          color: #64748B;
          margin-top: 0.5rem;
          font-style: italic;
        }
        .blog-prose-content blockquote {
          border-left: 4px solid #D4A017;
          background: #F8FAFC;
          padding: 1rem 1.5rem;
          margin: 1.75rem 0;
          border-radius: 0 1rem 1rem 0;
          color: #475569;
          font-style: italic;
        }
        .blog-prose-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }
        .blog-prose-content th {
          background-color: #0B1220;
          color: #ffffff;
          padding: 0.75rem 1rem;
          text-align: left;
        }
        .blog-prose-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #E2E8F0;
        }
      `}</style>
    </div>
  );
}
