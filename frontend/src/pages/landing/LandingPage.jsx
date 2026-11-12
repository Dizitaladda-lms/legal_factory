import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";

const formatPrice = (amount, currency = "INR") => {
  if (amount == null || amount === "") return "Contact for price";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatDate = (value) => {
  if (!value) return "To be announced";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "To be announced"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const courseType = (course) => {
  const slug = (course.slug || "").toLowerCase();
  if (slug.includes("judiciary")) return "JUDICIARY";
  if (slug.includes("pg")) return "CLAT PG";
  return "CLAT UG";
};

const learningPillars = [
  {
    title: "Learn with structure",
    copy: "Follow a planned course path across your selected law exam subjects.",
  },
  {
    title: "Practice with purpose",
    copy: "Build consistency with questions, sectional practice and mock tests.",
  },
  {
    title: "Get learning support",
    copy: "Use classes and doubt support to clarify concepts as you prepare.",
  },
];

const fallbackNewsThumbnail = "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202305/sc_clear_with_1bird-sixteen_nine.jpg?VersionId=IVPCmYoTLq6B.E_JCWaZKBbrcOYnjJaS";

// Replace the profile text and photo placeholders with verified trainer details.
const trainers = [
  { subject: "CLAT UG", name: "[Trainer name]", qualification: "[Verified qualification]", experience: "[Add relevant teaching experience]" },
  { subject: "Judiciary", name: "[Trainer name]", qualification: "[Verified qualification]", experience: "[Add relevant teaching experience]" },
  { subject: "CLAT PG", name: "[Trainer name]", qualification: "[Verified qualification]", experience: "[Add relevant teaching experience]" },
];

const lawyerRoadmap = [
  { title: "Choose your entry route", detail: "After Class 12: five-year integrated LL.B. After graduation: three-year LL.B. Check university eligibility.", imagePosition: "0% 0%", link: "https://www.barcouncilofindia.org/info/educationa-de7va7%3F", linkText: "BCI eligibility guidance" },
  { title: "Prepare and apply", detail: "Prepare for CLAT UG for participating NLUs. Other universities may use their own admission process.", imagePosition: "50% 0%", link: "https://consortiumofnlus.ac.in/", linkText: "Official CLAT site" },
  { title: "Complete your law degree", detail: "Choose a recognized law program. Build foundations in core subjects, research and legal writing.", imagePosition: "100% 0%" },
  { title: "Build practical experience", detail: "Develop skills through internships, moot courts, drafting exercises and research projects.", imagePosition: "0% 100%" },
  { title: "Complete enrolment steps", detail: "After graduation, review the current requirements with your State Bar Council.", imagePosition: "50% 100%" },
  { title: "Meet practice requirements", detail: "Review current AIBE and Certificate of Practice requirements before legal practice.", imagePosition: "100% 100%", link: "https://www.allindiabarexamination.com/", linkText: "Official AIBE site" },
];

const faqs = [
  {
    q: "Which law entrance courses are available?",
    a: "The current catalog includes CLAT UG, Judiciary and CLAT PG courses. Open Courses to see the published batches and their latest details.",
  },
  {
    q: "Can I study in Hindi and English?",
    a: "Course language is listed on each course card. The current law programs are planned for Hindi + English learning support.",
  },
  {
    q: "How can I see the latest batch date and fee?",
    a: "Open a course card for the current database details. If a date or fee has not been announced yet, the page will say so clearly.",
  },
  {
    q: "Can I attend a demo class?",
    a: "Use the Free Demo Class link on a course page to find the current demo booking details.",
  },
];

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [newsPeriod, setNewsPeriod] = useState("current");
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/api/law-courses")
      .then(({ data }) => {
        if (!active) return;
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const refreshContent = async () => {
      const [newsResult, blogResult] = await Promise.allSettled([
        api.get("/api/news"),
        api.get("/api/blogs", { params: { page: 1, limit: 50 } }),
      ]);
      if (!active) return;

      if (newsResult.status === "fulfilled") {
        const feedNews = newsResult.value.data || {};
        setCurrentAffairs([
          ...(Array.isArray(feedNews.current) ? feedNews.current.map((item) => ({ ...item, newsPeriod: "current" })) : []),
          ...(Array.isArray(feedNews.archive) ? feedNews.archive.map((item) => ({ ...item, newsPeriod: "archive" })) : []),
        ]);
      }
      if (blogResult.status === "fulfilled") {
        const firstPage = Array.isArray(blogResult.value.data?.blogs) ? blogResult.value.data.blogs : [];
        setLatestBlogs(firstPage.slice(0, 3));
      }
      setNewsLoading(false);
    };

    refreshContent();
    const refreshTimer = window.setInterval(refreshContent, 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const formatNewsDate = (value) => {
    if (!value) return "Recently published";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently published" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const visibleNews = currentAffairs.filter((post) => post.newsPeriod === newsPeriod).slice(0, 3);

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="Lawyer Factory" />
      <main>
        {/* Hero and primary course discovery */}
        <section className="hero-section relative overflow-hidden border-b border-[#eee8e8] bg-[#ffffff]">
          <img
            className="hero-section__background"
            src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202305/sc_clear_with_1bird-sixteen_nine.jpg?VersionId=IVPCmYoTLq6B.E_JCWaZKBbrcOYnjJaS"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
          />
          <div className="hero-section__overlay" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full border border-[#f1dfe0]" />
          <div className="pointer-events-none absolute -right-16 -top-24 h-[300px] w-[300px] rounded-full border border-[#f1dfe0]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
            <div className="hero-copy relative z-10">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#edc9cc] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.13em] text-[#bd2531]">
                Law entrance and judiciary preparation
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-.045em] text-[#252525] sm:text-5xl lg:text-[3.7rem]">
                Young Age, Big <span className="text-[#d74752]">Legal Career</span>.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#666] sm:text-lg sm:leading-8">
               Crack CLAT UG, Judiciary or CLAT PG with clear concepts, live classes, regular mock tests and mentors who guide you at every step. Learn in Hindi + English.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d74752] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#b73540]">
                  Explore Courses
                </a>
                <a href="#contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d74752] bg-white px-6 text-sm font-bold text-[#d74752] transition hover:bg-[#f5f5f5]">
                  Book a Free Demo
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#676767]">
                <span>Hindi + English support</span>
                <span>Online learning + Offline learning</span>
              </div>
            </div>

            <div className="hero-visual mx-auto w-full max-w-[520px]" aria-label="Law education at Lawyer Factory">
              <div className="hero-visual__blob" aria-hidden="true" />

              <img
                className="hero-visual__statue"
                src="/lady-justice.png"
                alt="Lady Justice holding the scales of justice"
                loading="lazy"
              />

              {/* Edit tag text or section links here. */}
              <a className="hero-visual__tag hero-visual__tag--clat" href="#courses">CLAT UG</a>
              <a className="hero-visual__tag hero-visual__tag--judiciary" href="#courses">Judiciary</a>
              <a className="hero-visual__tag hero-visual__tag--pg" href="#courses">CLAT PG</a>
              <a className="hero-visual__tag hero-visual__tag--live" href="#courses">Live Classes</a>
              <a className="hero-visual__tag hero-visual__tag--mocks" href="#test-series">Mock Tests</a>
            </div>
          </div>
        </section>

        {/* Exam-track navigation */}
        <section className="border-b border-[#eee8e8] bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-4 py-5 sm:px-6 lg:px-8">
            <span className="mr-2 text-sm font-bold text-[#555]">Explore by goal</span>
            {["CLAT UG", "Judiciary", "CLAT PG", "Test Series", "Free Resources"].map((label) => (
              <a key={label} href={label.includes("Resource") ? "#resources" : label.includes("Test") ? "#test-series" : "#courses"} className="rounded-full border border-[#ece3e4] px-4 py-2 text-xs font-semibold text-[#5d5d5d] transition hover:border-[#d74752] hover:text-[#d74752] sm:text-sm">
                {label}
              </a>
            ))}
          </div>
        </section>

        {/* Learning pillars */}
        <section id="approach" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">A considered way to prepare</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Learning built around your law exam goals</h2>
            <p className="mt-3 leading-7 text-[#686868]">Review the program structure, practice regularly and find support as your preparation progresses.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {learningPillars.map(({ title, copy }, index) => (
              <article key={title} className="rounded-2xl border border-[#eee8e8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(35,25,25,.07)]">
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#d74752]">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b6b6b]">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Animated, high-level education and practice roadmap. */}
        <section id="lawyer-roadmap" className="lawyer-roadmap overflow-hidden border-y border-[#eee8e8] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Your legal career path</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Zero to Lawyer: the roadmap</h2>
              <p className="mt-4 leading-7 text-[#686868]">A high-level guide from choosing a law degree to preparing for legal practice in India. Your route depends on your education, university and current bar requirements.</p>
            </div>
            <ol className="roadmap-track mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {lawyerRoadmap.map((step, index) => (
                <li key={step.title} className="roadmap-step relative pt-1">
                  <span className="roadmap-number relative z-10 grid h-11 w-11 place-items-center rounded-full border-2 border-[#d74752] bg-white text-sm font-bold text-[#d74752]">{String(index + 1).padStart(2, "0")}</span>
                  <article className="roadmap-card mt-4 flex min-h-0 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,.12) 0%, rgba(10,10,10,.84) 78%), url('/lawyer-roadmap-scenes.png')`, backgroundSize: `100% 100%, 300% 200%`, backgroundPosition: `center, ${step.imagePosition}`, backgroundRepeat: "no-repeat" }}>
                    <h3 className="text-xl font-bold leading-snug text-white">{step.title}</h3>
                    <p className="mt-3 text-white/90">{step.detail}</p>
                    {step.link && <a href={step.link} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-white underline underline-offset-4">{step.linkText}</a>}
                  </article>
                </li>
              ))}
            </ol>
            <p className="mx-auto mt-6 max-w-4xl text-center text-sm text-[#777]">This roadmap is general information, not a guarantee of admission, enrolment or employment. Always confirm current requirements with the university, State Bar Council and official AIBE site.</p>
          </div>
        </section>

        {/* Course cards are loaded from the law-course catalog API. */}
        <section id="courses" className="bg-[#ffffff] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Find your program</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Courses for your next step in law</h2>
                <p className="mt-3 max-w-2xl leading-7 text-[#686868]">Current batch dates, language and pricing are shown from the course catalog.</p>
              </div>
              <Link to="/courses" className="inline-flex items-center self-start text-sm font-bold text-[#d74752] hover:underline sm:self-auto">View all courses</Link>
            </div>

            {loading ? (
              <div className="mt-9 grid gap-5 md:grid-cols-3" aria-label="Loading courses">
                {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl border border-[#eee8e8] bg-white" />)}
              </div>
            ) : loadError ? (
              <div className="mt-9 rounded-2xl border border-[#edc9cc] bg-white p-7 text-sm text-[#686868]">Course information is temporarily unavailable. Please try again shortly.</div>
            ) : courses.length ? (
              <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <article key={course.slug} className="flex flex-col overflow-hidden rounded-2xl border border-[#eee8e8] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(65,27,30,.09)]">
                    <div className="relative flex min-h-36 items-end overflow-hidden bg-[#f5f5f5] p-5">
                      <div className="absolute -right-7 -top-14 h-44 w-44 rounded-full border border-[#e9c1c4]" />
                      <div className="absolute -right-1 -top-8 h-32 w-32 rounded-full border border-[#e9c1c4]" />
                      <span className="relative inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-[#d74752]">{courseType(course)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-bold leading-snug">{course.name}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#696969]">{course.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-y-2 border-t border-[#f0ebeb] pt-4 text-xs text-[#646464]">
                        <span>Starts: {formatDate(course.batch_start_date)}</span>
                        <span>Language: {course.language || "Hindi + English"}</span>
                        <span className="col-span-2 font-bold text-[#292929]">{formatPrice(course.price_amount, course.price_currency)}</span>
                      </div>
                      <Link to={`/course/${encodeURIComponent(course.slug)}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d74752] px-4 text-sm font-bold text-[#d74752] transition hover:bg-[#d74752] hover:text-white">
                        View Course Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-9 rounded-2xl border border-dashed border-[#dfb8bb] bg-white p-8 text-center text-sm text-[#686868]">Course information will appear here when a program is published.</div>
            )}
          </div>
        </section>

        {/* Live legal headlines are refreshed by the server-side news feed. */}
        <section id="current-affairs" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Stay informed</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">CLAT and law related news</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#686868]">Legal, judiciary and CLAT headlines refresh automatically. Select a headline to read it from its publisher.</p>
            </div>
            <Link to="/blogs" className="inline-flex items-center self-start text-sm font-bold text-[#d74752] hover:underline sm:self-auto">View all articles</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter legal news by date">
            {[{ id: "current", label: "Current news" }, { id: "archive", label: "Past legal news" }].map((tab) => (
              <button key={tab.id} type="button" role="tab" aria-selected={newsPeriod === tab.id} onClick={() => setNewsPeriod(tab.id)} className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${newsPeriod === tab.id ? "border-[#d74752] bg-[#d74752] text-white" : "border-[#e6d8d9] bg-white text-[#575757] hover:border-[#d74752] hover:text-[#d74752]"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-[#777]">Headlines are collected from Google News and link to the original publishers.</p>
          {newsLoading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3" aria-label="Loading current affairs">
              {[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl border border-[#eee8e8] bg-[#ffffff]" />)}
            </div>
          ) : visibleNews.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {visibleNews.map((post) => (
                <article key={post.id || post.url} className="news-card relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl border border-[#eee8e8] bg-[#292929]">
                  <img
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500"
                    src={post.thumbnail || fallbackNewsThumbnail}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="news-card__shade absolute inset-0" aria-hidden="true" />
                  <div className="relative z-10 p-6 text-white">
                    <p className="text-sm font-semibold text-white">{post.source || post.category || "Law and current affairs"}</p>
                    <h3 className="mt-3 text-xl font-bold leading-snug text-white">{post.title}</h3>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/30 pt-4 text-sm text-white">
                      <time dateTime={post.published_at || undefined}>{formatNewsDate(post.published_at)}</time>
                      <a href={post.url} target="_blank" rel="noreferrer" className="font-semibold text-white underline underline-offset-4">Read</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-[#d8d8d8] bg-white p-7 text-[#686868]">{newsLoading ? "Loading legal news…" : "The news feed is temporarily unavailable. Please check again shortly."}</p>
          )}
        </section>

        {/* Test preparation and resource pathways */}
        <section id="test-series" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[26px] bg-[#292929] p-7 text-white sm:p-9">
            <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-white/75">Practice pathway</p>
            <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight">Test series and performance review</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85">Course pages show the tests, previous-paper practice and analysis included in each program as details are added.</p>
            <Link to="/courses" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#d74752] px-5 text-sm font-bold text-white hover:bg-[#b73540]">See course details</Link>
          </article>
          <article id="resources" className="rounded-[26px] border border-[#eee8e8] bg-white p-7 sm:p-9">
            <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#d74752]">Free preparation resources</p>
            <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight">Start with helpful study material</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#686868]">Resource links and downloadable practice material can be added here as they are ready.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["CLAT practice", "Judiciary guides", "CLAT PG revision"].map((label) => <span key={label} className="rounded-full border border-[#eee3e4] px-3 py-1.5 text-xs font-semibold text-[#5f5f5f]">{label}</span>)}
            </div>
          </article>
        </section>

        {/* Trainer profiles: replace photo and details with verified information. */}
        <section id="faculty" className="border-y border-[#eee8e8] bg-[#ffffff] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Meet the team</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Learn from our expert trainers</h2>
              <p className="mt-4 leading-7 text-[#686868]">Meet the educators guiding students through CLAT UG, Judiciary and CLAT PG preparation.</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {trainers.map((trainer, index) => (
                <article key={`${trainer.subject}-${index}`} className="overflow-hidden rounded-2xl border border-[#eee8e8] bg-white">
                  <div className="grid aspect-[4/3] place-items-center bg-[#f7f3f3] text-sm font-medium text-[#686868]">[Add trainer photo]</div>
                  <div className="p-5">
                    <p className="text-sm font-semibold text-[#d74752]">{trainer.subject}</p>
                    <h3 className="mt-2 text-xl font-bold text-[#292929]">{trainer.name}</h3>
                    <p className="mt-2 text-[#555]">{trainer.qualification}</p>
                    <p className="mt-2 text-[#686868]">{trainer.experience}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="rounded-[26px] border border-[#eee8e8] bg-white p-7 sm:p-9">
            <div className="flex items-start gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Student experiences</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Stories from learners</h2><p className="mt-2 text-sm leading-6 text-[#686868]">Genuine student feedback and outcomes will be added here after approval.</p></div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="rounded-2xl bg-[#ffffff] p-5"><p className="text-sm text-[#686868]">[Add an approved student experience]</p><p className="mt-4 text-xs font-semibold text-[#a96065]">[Student name · course]</p></div>)}
            </div>
          </div>
        </section>

        <section className="bg-[#ffffff] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Need help choosing?</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2></div>
            <div className="mt-8 divide-y divide-[#eee4e5] border-y border-[#eee4e5]">
              {faqs.map((faq) => <details key={faq.q} className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#d74752]"><span>{faq.q}</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-[#686868]">{faq.a}</p></details>)}
            </div>
          </div>
        </section>

        {/* Show the newest three published blog posts; archive stays on /blogs. */}
        <section id="latest-blogs" className="border-t border-[#eee8e8] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">From the blog</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Latest blogs</h2>
              <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#686868]">Read recent articles and updates from Lawyer Factory.</p>
            </div>
            {newsLoading ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3" aria-label="Loading latest blogs">
                {[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl border border-[#eee8e8] bg-[#f5f5f5]" />)}
              </div>
            ) : latestBlogs.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {latestBlogs.map((post) => (
                  <article key={post.id || post.slug} className="flex flex-col rounded-2xl border border-[#eee8e8] bg-white p-6">
                    <p className="text-sm font-semibold text-[#d74752]">{post.category || "Article"}</p>
                    <h3 className="mt-3 text-xl font-bold leading-snug text-[#292929]">{post.title}</h3>
                    <p className="mt-3 flex-1 text-[#686868]">{post.summary || post.meta_description || "Read the full article for details."}</p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f0ebeb] pt-4 text-sm text-[#686868]">
                      <time dateTime={post.published_at || post.created_at || undefined}>{formatNewsDate(post.published_at || post.created_at)}</time>
                      <Link to={`/blog/${post.slug}`} className="font-semibold text-[#d74752] hover:underline">Read blog</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-[#d8d8d8] p-7 text-center text-[#686868]">New blog posts will appear here when published.</p>
            )}
            <div className="mt-8 text-center">
              <Link to="/blogs" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d74752] px-7 text-sm font-bold text-white transition hover:bg-[#b73540]">More Blogs</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 rounded-[26px] bg-[#292929] p-7 text-white sm:flex-row sm:items-center sm:p-9">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#ffb8bd]">Take the next step</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Find the right law preparation course</h2><p className="mt-2 text-sm text-white/70">Explore course details or get in touch about a free demo.</p></div>
            <Link to="/courses" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#d74752] px-6 text-sm font-bold text-white hover:bg-[#b73540]">Browse courses</Link>
          </div>
        </section>
      </main>
      <BatchesFooter brandName="Lawyer Factory" />
    </div>
  );
}
