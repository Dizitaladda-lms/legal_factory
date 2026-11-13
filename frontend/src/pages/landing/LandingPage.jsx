import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";
import CourseInquiryForm from "../../components/landing/CourseInquiryForm";
import ExamsWeCover from "../../components/landing/ExamsWeCover";
import { getLawCourseImage } from "../../utils/lawCourseImage";
import { CalendarDays, Languages, Monitor } from "lucide-react";

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

const courseDescriptions = {
  "CLAT UG": "One-year structured coaching covering all five CLAT UG sections, with guided lessons, practice and revision.",
  "CLAT PG": "Postgraduate law entrance preparation with subject revision and passage-based comprehension practice.",
  JUDICIARY: "Core legal subjects, legal writing practice and structured preparation for judiciary exams.",
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
    a: "Share your details through the admission enquiry form. A counsellor will contact you with course and fee information.",
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
  const [lawUpdates, setLawUpdates] = useState({ current: [], exams: [], vacancies: [], results: [] });
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const inquiryDialogRef = useRef(null);

  useEffect(() => {
    if (window.sessionStorage.getItem("law-inquiry-seen")) return undefined;
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem("law-inquiry-seen", "1");
      setInquiryOpen(true);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const dialog = inquiryDialogRef.current;
    if (inquiryOpen && dialog && !dialog.open) dialog.showModal();
    if (!inquiryOpen && dialog?.open) dialog.close();
  }, [inquiryOpen]);

  const openInquiry = () => {
    window.sessionStorage.setItem("law-inquiry-seen", "1");
    setInquiryOpen(true);
  };

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
        setLawUpdates({
          current: Array.isArray(feedNews.current) ? feedNews.current : [],
          exams: Array.isArray(feedNews.exams) ? feedNews.exams : [],
          vacancies: Array.isArray(feedNews.vacancies) ? feedNews.vacancies : [],
          results: Array.isArray(feedNews.results) ? feedNews.results : [],
        });
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

  const updateGroups = [
    { id: "news", title: "Latest law news", description: "Recent legal, judiciary and CLAT headlines.", items: lawUpdates.current },
    { id: "exams", title: "Exam notifications & forms", description: "Application, registration, admit card and recruitment updates.", items: [...lawUpdates.exams, ...lawUpdates.vacancies].filter((item, index, all) => all.findIndex((entry) => entry.url === item.url) === index).sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)) },
    { id: "results", title: "Results & answer keys", description: "Result declarations and answer-key updates for law exams.", items: lawUpdates.results },
  ];

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="Lawyer Factory" onContactClick={openInquiry} />
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
                Prepare for CLAT UG, Judiciary or CLAT PG through live online classes or in-person classes at our Delhi campus. Share an admission enquiry and our counsellor will contact you with course details. Learn in Hindi + English.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d74752] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#b73540]">
                  Explore Courses
                </a>
                <button type="button" onClick={openInquiry} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d74752] bg-white px-6 text-sm font-bold text-[#d74752] transition hover:bg-[#f5f5f5]">
                  Book a Free Demo
                </button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#676767]">
                <span>Hindi + English support</span>
                <span>Online classes</span>
                <span>Offline classes at our Delhi campus</span>
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

        {/* Law exam preparation */}
        <section id="approach" className="law-preparation mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <style>{`
            .law-preparation__card { isolation: isolate; transition: transform .4s ease, box-shadow .4s ease, border-color .4s ease; }
            .law-preparation__image { transition: opacity .4s ease; }
            .law-preparation__card::before { content: ""; position: absolute; inset: 0; z-index: 10; border-radius: inherit; background: rgba(89, 18, 29, .78); opacity: 0; transition: opacity .4s ease; }
            .law-preparation__card:hover, .law-preparation__card:focus-visible { transform: translateY(-4px); border-color: #7b1e2b; box-shadow: 0 18px 44px rgba(45, 15, 20, .18); }
            .law-preparation__card:hover::before, .law-preparation__card:focus-visible::before { opacity: 1; }
            .law-preparation__card:hover .law-preparation__image, .law-preparation__card:focus-visible .law-preparation__image { opacity: 1; }
            .law-preparation__card:hover .law-preparation__number, .law-preparation__card:hover .law-preparation__title, .law-preparation__card:hover .law-preparation__copy,
            .law-preparation__card:focus-visible .law-preparation__number, .law-preparation__card:focus-visible .law-preparation__title, .law-preparation__card:focus-visible .law-preparation__copy { color: #fff; }
            .law-preparation__card:focus-visible { outline: 3px solid #7b1e2b; outline-offset: 4px; }
            @media (hover: none), (pointer: coarse) {
              .law-preparation__image { opacity: .15; }
              .law-preparation__card:hover, .law-preparation__card:focus-visible { transform: none; }
              .law-preparation__card:hover::before, .law-preparation__card:focus-visible::before { opacity: 0; }
              .law-preparation__card:hover .law-preparation__number, .law-preparation__card:hover .law-preparation__title, .law-preparation__card:hover .law-preparation__copy,
              .law-preparation__card:focus-visible .law-preparation__number, .law-preparation__card:focus-visible .law-preparation__title, .law-preparation__card:focus-visible .law-preparation__copy { color: inherit; }
              .law-preparation__card:focus-visible { outline-color: #7b1e2b; }
            }
            @media (prefers-reduced-motion: reduce) {
              .law-preparation__card, .law-preparation__image, .law-preparation__card::before { transition: none; }
            }
          `}</style>
          <div className="max-w-[700px]">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#8f1d2c]">A rigorous approach to law entrance preparation</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#292929] sm:text-4xl">A disciplined, outcome-driven program for serious law aspirants</h2>
            <p className="mt-4 leading-7 text-[#686868]">Our program combines a syllabus-aligned curriculum, rigorous assessment and continuous academic mentoring, designed to build the conceptual depth, speed and accuracy that top law entrance exams demand.</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              { number: "01", title: "Structured Curriculum", image: "/pexels-shox-37726703.jpg", copy: "A comprehensive, subject-wise roadmap covering Legal Aptitude, Logical Reasoning, English, Current Affairs and Quantitative Techniques. Every module is sequenced to match the latest exam pattern, with concept building, revision cycles and clear milestones so no topic is left to chance." },
              { number: "02", title: "Practice and Assessment", image: "/download.jpg", copy: "Daily practice sets, sectional tests and full-length mock exams modelled on the real exam interface. Each test comes with detailed performance analytics, question-wise solutions and percentile benchmarking, so you can identify weak areas and improve with precision." },
              { number: "03", title: "Academic Support", image: "/download.png", copy: "Live classes by experienced faculty, dedicated doubt-resolution sessions and personalised mentoring. Regular progress reviews keep your preparation on track, and expert guidance helps you refine strategy, time management and exam temperament." },
            ].map(({ number, title, image, copy }) => (
              <article key={number} tabIndex={0} className="law-preparation__card relative overflow-hidden rounded-[20px] border border-[#eee3e4] bg-white p-6 sm:p-7">
                <img className="law-preparation__image absolute inset-0 z-0 h-full w-full object-cover opacity-0" src={image} alt="" loading="lazy" decoding="async" />
                <div className="relative z-20">
                  <p className="law-preparation__number text-sm font-bold tracking-[.14em] text-[#8f1d2c]">{number}</p>
                  <h3 className="law-preparation__title mt-5 text-xl font-bold leading-snug text-[#292929]">{title}</h3>
                  <p className="law-preparation__copy mt-3 text-sm leading-6 text-[#626262]">{copy}</p>
                </div>
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
                <p className="mt-3 max-w-2xl leading-7 text-[#686868]">Choose online learning or attend classes at our Delhi campus. Enquire for admission and our counsellor will share the course details.</p>
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
              <div className="mt-9 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => {
                  const type = courseType(course);
                  const detailHref = `/course/${encodeURIComponent(course.slug)}`;
                  return (
                    <article key={course.slug} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#eee5e6] bg-white transition duration-[400ms] ease-out hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(65,27,30,.12)]">
                      <div className="relative h-[200px] shrink-0 overflow-hidden bg-[#f5f2f2]">
                        <img src={getLawCourseImage(course)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
                        <span className="absolute bottom-4 left-6 inline-flex rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-[#8f1d2c]">{type}</span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-serif text-xl font-semibold leading-snug text-[#292929]">{course.name}</h3>
                        <p className="mt-2 min-h-10 text-xs leading-5 text-[#686868]">{courseDescriptions[type] || courseDescriptions["CLAT UG"]}</p>

                        <div className="mt-5 border-t border-[#eee8e8] pt-4">
                          <div className="grid gap-3 text-xs text-[#5f5f5f]">
                            <div className="flex items-center gap-2.5"><Languages size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-[#9b666b]" /><span><span className="text-[#898282]">Language:</span> Hindi + English</span></div>
                            <div className="flex items-center gap-2.5"><Monitor size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-[#9b666b]" /><span><span className="text-[#898282]">Mode:</span> Online and Delhi campus</span></div>
                            <div className="flex items-center gap-2.5"><CalendarDays size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-[#9b666b]" /><span><span className="text-[#898282]">Batch:</span> Admissions open</span></div>
                          </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                          <Link to={detailHref} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#8f1d2c] px-3 text-center text-xs font-bold text-white transition hover:bg-[#741622] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c] sm:text-sm">View Details</Link>
                          <Link to="/#admission-inquiry" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#8f1d2c] bg-white px-3 text-center text-xs font-bold text-[#8f1d2c] transition hover:bg-[#8f1d2c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c] sm:text-sm">Enquire Now</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-9 rounded-2xl border border-dashed border-[#dfb8bb] bg-white p-8 text-center text-sm text-[#686868]">Course information will appear here when a program is published.</div>
            )}
          </div>
        </section>

        <ExamsWeCover />

        {/* Law news, exam notices, and result updates */}
        <section id="current-affairs" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Stay informed</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">CLAT and law related updates</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#686868]">News, exam notifications, application links and result announcements in one place. Updates refresh automatically, and each headline opens its source.</p>
            </div>
            <Link to="/law-updates" className="inline-flex min-h-11 items-center self-start rounded-full border border-[#8f1d2c] px-5 text-sm font-bold text-[#8f1d2c] transition hover:bg-[#8f1d2c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c] sm:self-auto">View all updates</Link>
          </div>
          {newsLoading ? (
            <div className="mt-8 grid gap-4" aria-label="Loading law updates">
              {[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#eee8e8] bg-[#ffffff]" />)}
            </div>
          ) : (
            <div className="mt-8 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {updateGroups.map((group) => (
                <section key={group.id} className="flex h-full flex-col rounded-2xl border border-[#eee3e4] bg-white p-5 shadow-[0_10px_30px_rgba(55,25,30,.04)] sm:p-6" aria-labelledby={`updates-${group.id}`}>
                  <div className="flex min-h-[104px] flex-wrap content-start items-start justify-between gap-3 border-b border-[#f0e8e9] pb-4"><div><h3 id={`updates-${group.id}`} className="font-serif text-xl font-bold text-[#202027] sm:text-2xl">{group.title}</h3><p className="mt-1 text-sm text-[#686868]">{group.description}</p></div><span className="rounded-full bg-[#fbf1f2] px-3 py-1 text-xs font-semibold text-[#8f1d2c]">Latest 5</span></div>
                  {group.items.length ? <ol className="divide-y divide-[#f1ebeb]">{group.items.slice(0, 5).map((post, index) => <li key={post.id || post.url} className="flex items-start gap-2.5 py-3.5 last:pb-1"><span className="mt-0.5 w-6 shrink-0 font-serif text-xs font-bold text-[#a23a46]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><a href={post.url} target="_blank" rel="noopener noreferrer" className="font-semibold leading-5 text-[#27242a] decoration-[#a23a46] underline-offset-4 hover:text-[#8f1d2c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c]">{post.title}</a><p className="mt-1 text-xs text-[#62616a]">{post.source || post.category || "Publisher source"} <span aria-hidden="true">·</span> <time dateTime={post.published_at || undefined}>{formatNewsDate(post.published_at)}</time>{post.application_deadline ? <span> <span aria-hidden="true">·</span> Apply by {post.application_deadline}</span> : null}</p></div></li>)}</ol> : <p className="py-5 text-sm text-[#62616a]">No updates are available in this category right now.</p>}
                </section>
              ))}
            </div>
          )}
          {!newsLoading && <p className="mt-4 text-xs leading-5 text-[#62616a]">Exam dates, eligibility and application steps can change. Open the linked notice or exam body source for the official details.</p>}
        </section>

        {/* Test preparation and resource pathways */}
        <section id="test-series" className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <article className="flex min-h-[330px] flex-col items-start rounded-[26px] bg-[#292929] p-7 text-white shadow-[0_18px_45px_-28px_rgba(41,41,41,.55)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#f0b6ba]">Practice pathway</p>
            <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight text-white">Test series and performance review</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85">Course pages show the tests, previous-paper practice and analysis included in each program as details are added.</p>
            <Link to="/courses" className="mt-auto inline-flex min-h-11 items-center rounded-full bg-[#d74752] px-5 text-sm font-bold text-white transition-colors hover:bg-[#b73540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">See course details</Link>
          </article>
          <article id="resources" className="flex min-h-[330px] flex-col items-start rounded-[26px] border border-[#f0d9db] bg-[#fffdfd] p-7 shadow-[0_18px_45px_-34px_rgba(110,38,44,.35)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b42332]">Free preparation resources</p>
            <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight text-[#292929]">Start with helpful study material</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#5f5f5f]">Resource links and downloadable practice material can be added here as they are ready.</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {["CLAT practice", "Judiciary guides", "CLAT PG revision"].map((label) => <span key={label} className="rounded-full border border-[#ead5d7] bg-white px-3.5 py-2 text-xs font-semibold text-[#494949]">{label}</span>)}
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

        <section id="admission-inquiry" className="border-t border-[#eee8e8] bg-[#fbf8f8] py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a32131]">Talk to our counsellor</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#292929] sm:text-4xl">Get guidance for your law entrance preparation</h2>
              <p className="mt-4 max-w-xl leading-7 text-[#686868]">Tell us which course you’re considering. Our team will call you with program details and help you choose your next step.</p>
            </div>
            <div className="rounded-[24px] border border-[#eee1e2] bg-white p-6 shadow-[0_16px_48px_rgba(55,20,25,.06)] sm:p-8">
              <CourseInquiryForm source="homepage" />
            </div>
          </div>
        </section>
      </main>
      <dialog
        ref={inquiryDialogRef}
        aria-labelledby="inquiry-dialog-title"
        onCancel={(event) => { event.preventDefault(); setInquiryOpen(false); }}
        onClose={() => setInquiryOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setInquiryOpen(false); }}
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-[24px] border border-[#eee1e2] bg-white p-0 text-[#292929] shadow-2xl backdrop:bg-[#201012]/60"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a32131]">Free course guidance</p>
              <h2 id="inquiry-dialog-title" className="mt-2 text-2xl font-bold leading-tight">Request a call back</h2>
              <p className="mt-2 text-sm leading-6 text-[#686868]">Share your details and our counsellor will get in touch.</p>
            </div>
            <button type="button" onClick={() => setInquiryOpen(false)} aria-label="Close enquiry form" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#eadcdd] text-xl text-[#555] transition hover:bg-[#fbf5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a32131]">×</button>
          </div>
          <div className="mt-6">
            <CourseInquiryForm source="popup" compact />
          </div>
        </div>
      </dialog>
      <BatchesFooter brandName="Lawyer Factory" />
    </div>
  );
}
