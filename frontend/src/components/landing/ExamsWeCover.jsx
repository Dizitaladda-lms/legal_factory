import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

const exams = [
  { slug: "clat-ug", title: "CLAT UG", badge: "CLAT UG", category: "after-12th", description: "Structured preparation for NLUs and leading law colleges across all five CLAT UG sections.", image: "/images/clat-ug.webp" },
  { slug: "ailet", title: "AILET", badge: "AILET", category: "after-12th", description: "Focused preparation for the NLU Delhi entrance exam with pattern-based practice.", image: "/images/ailet.webp" },
  { slug: "lsat-india", title: "LSAT India", badge: "LSAT INDIA", category: "after-12th", description: "Analytical, logical and reading comprehension training for LSAT India accepting universities.", image: "/images/lsat-india.webp" },
  { slug: "slat", title: "SLAT", badge: "SLAT", category: "after-12th", description: "Targeted preparation for Symbiosis Law School entrance.", image: "/images/slat.webp" },
  { slug: "mh-cet-law-5-year", title: "MH CET Law (5 Year)", badge: "MH CET LAW", category: "after-12th", description: "Exam-oriented preparation for Maharashtra 5-year law admissions.", image: "/images/mhcet-5.webp" },
  { slug: "cuet-ug-law", title: "CUET UG (Law)", badge: "CUET UG", category: "after-12th", description: "Preparation for law programs at central universities through CUET UG.", image: "/images/cuet-ug.webp" },
  { slug: "state-law-entrance-exams", title: "State Law Entrance Exams", badge: "STATE LAW ENTRANCE", category: "after-12th", description: "Preparation for state-level exams such as TS LAWCET, AP LAWCET and KLEE.", image: "/images/state-lawcet.webp" },
  { slug: "du-llb-entrance", title: "DU LLB Entrance", badge: "DU LLB", category: "after-graduation", description: "Preparation for the 3-year LLB entrance at Delhi University.", image: "/images/du-llb.webp" },
  { slug: "mh-cet-law-3-year", title: "MH CET Law (3 Year)", badge: "MH CET LAW", category: "after-graduation", description: "Targeted practice for Maharashtra 3-year law admissions.", image: "/images/mhcet-3.webp" },
  { slug: "clat-pg", title: "CLAT PG", badge: "CLAT PG", category: "llm", description: "Postgraduate law entrance preparation with subject revision and passage-based practice.", image: "/images/clat-pg.webp" },
  { slug: "ailet-pg", title: "AILET PG", badge: "AILET PG", category: "llm", description: "Preparation for the LLM entrance at NLU Delhi.", image: "/images/ailet-pg.webp" },
  { slug: "cuet-pg-law", title: "CUET PG (Law)", badge: "CUET PG", category: "llm", description: "LLM entrance preparation for central universities through CUET PG.", image: "/images/cuet-pg.webp" },
  { slug: "du-llm-entrance", title: "DU LLM Entrance", badge: "DU LLM", category: "llm", description: "Subject-focused preparation for the LLM entrance at Delhi University.", image: "/images/du-llm.webp" },
  { slug: "judiciary-exams", title: "Judiciary Exams", badge: "JUDICIARY", category: "career", description: "Core legal subjects, legal writing practice and structured preparation for judicial services.", image: "/images/judiciary.webp" },
  { slug: "aibe", title: "AIBE", badge: "AIBE", category: "career", description: "Revision and practice for the All India Bar Examination.", image: "/images/aibe.webp" },
  { slug: "ugc-net-law", title: "UGC NET (Law)", badge: "UGC NET LAW", category: "career", description: "Preparation for teaching and research eligibility in law.", image: "/images/ugc-net-law.webp" },
  { slug: "app-exams", title: "APP Exams", badge: "APP EXAMS", category: "career", description: "Preparation for Assistant Public Prosecutor recruitment exams.", image: "/images/app.webp" },
  { slug: "law-officer-exams", title: "Law Officer Exams", badge: "LAW OFFICER", category: "career", description: "Preparation for legal officer recruitment in PSUs, banks and corporates.", image: "/images/law-officer.webp" },
  { slug: "high-court-exams", title: "High Court Exams", badge: "HIGH COURT", category: "career", description: "Preparation for Law Clerk and Research Associate positions.", image: "/images/high-court.webp" },
];

const categories = [
  { id: "all", label: "All" },
  { id: "after-12th", label: "After 12th (5-Year LLB)" },
  { id: "after-graduation", label: "After Graduation (3-Year LLB)" },
  { id: "llm", label: "LLM" },
  { id: "career", label: "Career Exams" },
];

const fallbackImageFor = (exam) => {
  if (exam.category === "after-12th") return "/course-clat-ug.jpg";
  if (exam.slug === "judiciary-exams") return "/course-judiciary.jpg";
  return "/course-clat-pg.jpg";
};

export default function ExamsWeCover({ showAll = false } = {}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const tabRefs = useRef({});
  const featuredExams = ["clat-ug", "clat-pg", "judiciary-exams"].map((slug) => exams.find((exam) => exam.slug === slug)).filter(Boolean);
  const visibleExams = showAll
    ? (activeCategory === "all" ? exams : exams.filter((exam) => exam.category === activeCategory))
    : featuredExams;

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % categories.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + categories.length) % categories.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = categories.length - 1;
    else return;
    event.preventDefault();
    const nextCategory = categories[nextIndex].id;
    setActiveCategory(nextCategory);
    tabRefs.current[nextCategory]?.focus();
  };

  return (
    <section id={showAll ? "all-exams" : "exams-we-cover"} className="border-y border-[#eee8e8] bg-[#fbf9f9] py-16 sm:py-20">
      <style>{`
        @keyframes exams-grid-fade-in { from { opacity: .35; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .exams-grid-enter { animation: exams-grid-fade-in 260ms ease both; }
        @media (prefers-reduced-motion: reduce) { .exams-grid-enter { animation: none; } }
      `}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#8f1d2c]">Exams we cover</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#292929] sm:text-4xl">Preparation for every stage of your legal career</h2>
          <p className="mt-4 leading-7 text-[#686868]">From law entrance exams to judiciary and bar examinations, find the right program for your goal.</p>
        </div>

        {showAll && <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Filter exams by education stage" aria-orientation="horizontal">
          {categories.map((category, index) => {
            const active = activeCategory === category.id;
            return (
              <button
                key={category.id}
                ref={(element) => { tabRefs.current[category.id] = element; }}
                id={`exams-tab-${category.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="exams-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveCategory(category.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`min-h-10 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c] sm:text-sm ${active ? "border-[#8f1d2c] bg-[#8f1d2c] text-white" : "border-[#e8d9da] bg-white text-[#575052] hover:border-[#8f1d2c] hover:text-[#8f1d2c]"}`}
              >
                {category.label}
              </button>
            );
          })}
        </div>}

        <div id={showAll ? "exams-panel" : undefined} role={showAll ? "tabpanel" : undefined} aria-labelledby={showAll ? `exams-tab-${activeCategory}` : undefined} tabIndex={showAll ? 0 : undefined} className="mt-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f1d2c]">
          <div key={activeCategory} className="exams-grid-enter grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleExams.map((exam) => (
              <article key={exam.slug} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#eee5e6] bg-white transition duration-[400ms] ease-out hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(65,27,30,.12)] motion-reduce:transition-none">
                <div className="relative h-[200px] shrink-0 overflow-hidden bg-[#f5f2f2]">
                  <img
                    src={exam.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    data-fallback={fallbackImageFor(exam)}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.src !== new URL(image.dataset.fallback, window.location.href).href) image.src = image.dataset.fallback;
                    }}
                    className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
                  <span className="absolute bottom-4 left-6 inline-flex rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-[#8f1d2c]">{exam.badge}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl font-semibold leading-snug text-[#292929]">{exam.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#686868]">{exam.description}</p>
                  <div className="mt-4 border-t border-[#eee8e8] pt-4 text-xs text-[#696363]">
                    <p className="font-medium">Admissions open</p>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                    <Link to={`/course/${exam.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#8f1d2c] px-3 text-center text-xs font-bold text-white transition hover:bg-[#741622] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c] sm:text-sm motion-reduce:transition-none">View Details</Link>
                    <Link to="/#admission-inquiry" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#8f1d2c] bg-white px-3 text-center text-xs font-bold text-[#8f1d2c] transition hover:bg-[#8f1d2c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c] sm:text-sm motion-reduce:transition-none">Enquire Now</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        {!showAll && <div className="mt-7 text-center"><p className="text-sm text-[#686868]">Explore all 19 exam pathways on the courses page.</p><Link to="/courses#all-exams" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-[#8f1d2c] px-5 text-sm font-semibold text-white transition hover:bg-[#741622] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c]">View all exams</Link></div>}
      </div>
    </section>
  );
}
