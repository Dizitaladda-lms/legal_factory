import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaClock,
  FaArrowRight,
  FaBookOpen,
  FaFire,
  FaTag,
  FaGraduationCap,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";

const CATEGORIES = [
  "All",
  "AI & Prompt Engineering",
  "Digital Marketing",
  "Data Analytics & Science",
  "Cyber Security",
  "Career & Placement Guides",
];

export default function BlogListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/api/blogs", { params });
      if (res.data?.success) {
        setBlogs(res.data.blogs || []);
      }
    } catch (err) {
      console.error("Error loading blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  // Extract featured post (first one or highest views)
  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const remainingPosts = blogs.length > 1 ? blogs.slice(1) : [];

  return (
    <div className="law-site min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between">
      {/* 1. STICKY HEADER */}
      <BatchesHeader brandName="Lawyer Factory" />

      {/* ========================================================= */}
      {/* 1. HERO HEADER */}
      {/* ========================================================= */}
      <header className="bg-[#0F172A] text-white pt-16 pb-16 px-6 border-b-4 border-[#5A4BFF] relative">

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <FaBookOpen className="text-amber-400" />
            <span>Lawyer Factory Learning Resources</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Industry Roadmaps, AI Playbooks & Career Blueprints
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            In-depth technical guides, proven performance marketing systems, and high-growth tech career strategies written by practitioners.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-200"
          >
            <div className="pl-4 text-slate-400">
              <FaSearch />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by topic, framework, skill (e.g. Prompt Engineering, SEO, Power BI)..."
              className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-[#0B1220] hover:bg-[#7C2D12] text-white px-6 py-3 rounded-xl font-bold text-sm transition duration-200 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                  selectedCategory === cat
                    ? "bg-[#D4A017] text-slate-950 border-[#D4A017] shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN BLOG CONTENT */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-6 py-14 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-[#0B1220] rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading authoritative articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-200">
              <FaBookOpen />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Articles Coming Soon</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              New industry guides, career roadmaps, and tech playbooks are being prepared. Stay tuned or check back shortly!
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/admin/blogs"
                className="inline-flex items-center gap-2 bg-[#0B1220] hover:bg-[#7C2D12] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
              >
                + Write First Article (Admin)
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* FEATURED STORY HERO (Top post when on 'All' and no search) */}
            {selectedCategory === "All" && !searchQuery && featuredPost && (
              <section className="mb-14">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 grid lg:grid-cols-12 group">
                  <div className="lg:col-span-7 relative overflow-hidden min-h-[320px] lg:min-h-[420px]">
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                      <FaFire />
                      <span>Featured Insight</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-3">
                        <span className="text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-extrabold">
                          {featuredPost.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-slate-400" />
                          {featuredPost.read_time}
                        </span>
                      </div>

                      <Link to={`/blog/${featuredPost.slug}`}>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] leading-snug hover:text-amber-600 transition-colors">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="text-slate-600 text-sm mt-4 leading-relaxed line-clamp-4">
                        {featuredPost.summary}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-300 font-black text-sm flex items-center justify-center ring-2 ring-amber-300/40">
                          {featuredPost.author_name ? featuredPost.author_name[0] : "D"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {featuredPost.author_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {featuredPost.author_role || "Dizital Adda Faculty"}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 bg-[#0B1220] hover:bg-[#7C2D12] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200 shadow-sm"
                      >
                        <span>Read Story</span>
                        <FaArrowRight className="text-[10px]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ARTICLES GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === "All" && !searchQuery ? remainingPosts : blogs).map((blog) => (
                <article
                  key={blog.id || blog.slug}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <Link to={`/blog/${blog.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={blog.featured_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-[#0B1220]/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                        {blog.category}
                      </div>
                    </Link>

                    {/* Content Body */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-amber-500" />
                          {blog.read_time}
                        </span>
                        <span>{new Date(blog.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>

                      <Link to={`/blog/${blog.slug}`}>
                        <h3 className="text-xl font-bold text-[#0B1220] leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>

                      <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed line-clamp-3">
                        {blog.summary || blog.meta_description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-300 font-bold text-xs flex items-center justify-center">
                        {blog.author_name ? blog.author_name[0] : "D"}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                        {blog.author_name}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-xs font-bold text-[#0B1220] hover:text-[#7C2D12] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Read Article</span>
                      <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* 3. NEWSLETTER / CAREER GUIDE LEAD CAPTURE */}
        {/* ========================================================= */}
        <section className="mt-20 bg-[#0F172A] rounded-2xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative">

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold uppercase tracking-wider mb-4">
              <FaGraduationCap />
              <span>Weekly Executive Tech Briefing</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Get 2026 AI Frameworks & Career Roadmaps Sent Directly to Your Inbox
            </h3>

            <p className="text-slate-300 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Every Tuesday, we deliver zero-fluff breakdowns of generative AI tools, digital marketing playbooks, and tech placement opportunities.
            </p>

            {subscribed ? (
              <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-6 py-3 rounded-2xl text-sm font-bold">
                <FaCheckCircle className="text-emerald-400" />
                <span>You're subscribed! Check your inbox for our flagship 2026 Tech Roadmap.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your work or student email..."
                  className="px-5 py-3.5 rounded-xl bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 flex-1 shadow-inner"
                />
                <button
                  type="submit"
                  className="bg-[#D4A017] hover:bg-amber-400 text-slate-950 px-6 py-3.5 rounded-xl font-bold text-sm transition duration-200 shrink-0 shadow-lg shadow-amber-500/20"
                >
                  Join 15,000+ Readers
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <BatchesFooter brandName="Lawyer Factory" />
    </div>
  );
}
