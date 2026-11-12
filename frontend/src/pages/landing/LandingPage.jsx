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

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="Legal Factory" />
      <main>
        {/* Hero and primary course discovery */}
        <section className="relative overflow-hidden border-b border-[#eee8e8] bg-[#fffafa]">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full border border-[#f1dfe0]" />
          <div className="pointer-events-none absolute -right-16 -top-24 h-[300px] w-[300px] rounded-full border border-[#f1dfe0]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#edc9cc] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.13em] text-[#bd2531]">
                Law entrance and judiciary preparation
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-.045em] text-[#252525] sm:text-5xl lg:text-[3.7rem]">
                Young Age, Big Legal Career <span className="text-[#c92835]">future in law.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#666] sm:text-lg sm:leading-8">
               Crack CLAT UG, Judiciary or CLAT PG with clear concepts, live classes, regular mock tests and mentors who guide you at every step. Learn in Hindi + English.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c92835] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#a91f2b]">
                  Explore Courses
                </a>
                <a href="#contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c92835] bg-white px-6 text-sm font-bold text-[#c92835] transition hover:bg-[#fff3f3]">
                  Book a Free Demo
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#676767]">
                <span>Hindi + English support</span>
                <span>Online learning + Offline learning</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative min-h-[330px] overflow-hidden rounded-[30px] border border-[#efd5d7] bg-white p-5 shadow-[0_22px_70px_rgba(96,28,34,.09)] sm:min-h-[400px] sm:p-7">
                <div className="absolute inset-x-0 top-0 h-2 bg-[#c92835]" />
                <div className="flex h-full min-h-[290px] flex-col justify-between rounded-[22px] bg-[#fff8f8] p-6 sm:min-h-[350px] sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[.16em] text-[#c92835]">Your legal learning path</span>
                      <h2 className="mt-3 max-w-xs text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Choose the exam you are preparing for</h2>
                    </div>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {["CLAT UG", "Judiciary", "CLAT PG"].map((label, index) => (
                      <a key={label} href="#courses" className="group rounded-2xl border border-[#eedcdd] bg-white p-4 transition hover:-translate-y-1 hover:border-[#c92835] hover:shadow-md">
                        <span className="mt-3 block text-sm font-bold">{label}</span>
                        <span className="mt-1 inline-flex items-center text-xs text-[#777] group-hover:text-[#c92835]">View course</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exam-track navigation */}
        <section className="border-b border-[#eee8e8] bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-4 py-5 sm:px-6 lg:px-8">
            <span className="mr-2 text-sm font-bold text-[#555]">Explore by goal</span>
            {["CLAT UG", "Judiciary", "CLAT PG", "Test Series", "Free Resources"].map((label) => (
              <a key={label} href={label.includes("Resource") ? "#resources" : label.includes("Test") ? "#test-series" : "#courses"} className="rounded-full border border-[#ece3e4] px-4 py-2 text-xs font-semibold text-[#5d5d5d] transition hover:border-[#c92835] hover:text-[#c92835] sm:text-sm">
                {label}
              </a>
            ))}
          </div>
        </section>

        {/* Learning pillars */}
        <section id="approach" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">A considered way to prepare</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Learning built around your law exam goals</h2>
            <p className="mt-3 leading-7 text-[#686868]">Review the program structure, practice regularly and find support as your preparation progresses.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {learningPillars.map(({ title, copy }, index) => (
              <article key={title} className="rounded-2xl border border-[#eee8e8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(35,25,25,.07)]">
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#c92835]">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b6b6b]">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Course cards are loaded from the law-course catalog API. */}
        <section id="courses" className="bg-[#fffafa] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Find your program</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Courses for your next step in law</h2>
                <p className="mt-3 max-w-2xl leading-7 text-[#686868]">Current batch dates, language and pricing are shown from the course catalog.</p>
              </div>
              <Link to="/courses" className="inline-flex items-center self-start text-sm font-bold text-[#c92835] hover:underline sm:self-auto">View all courses</Link>
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
                    <div className="relative flex min-h-36 items-end overflow-hidden bg-[#f9e9ea] p-5">
                      <div className="absolute -right-7 -top-14 h-44 w-44 rounded-full border border-[#e9c1c4]" />
                      <div className="absolute -right-1 -top-8 h-32 w-32 rounded-full border border-[#e9c1c4]" />
                      <span className="relative inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-[#c92835]">{courseType(course)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-bold leading-snug">{course.name}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#696969]">{course.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-y-2 border-t border-[#f0ebeb] pt-4 text-xs text-[#646464]">
                        <span>Starts: {formatDate(course.batch_start_date)}</span>
                        <span>Language: {course.language || "Hindi + English"}</span>
                        <span className="col-span-2 font-bold text-[#292929]">{formatPrice(course.price_amount, course.price_currency)}</span>
                      </div>
                      <Link to={`/course/${encodeURIComponent(course.slug)}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c92835] px-4 text-sm font-bold text-[#c92835] transition hover:bg-[#c92835] hover:text-white">
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

        {/* Test preparation and resource pathways */}
        <section id="test-series" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[26px] bg-[#c92835] p-7 text-white sm:p-9">
            <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-white/75">Practice pathway</p>
            <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight">Test series and performance review</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85">Course pages show the tests, previous-paper practice and analysis included in each program as details are added.</p>
            <Link to="/courses" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-[#b3212d] hover:bg-[#fff2f2]">See course details</Link>
          </article>
          <article id="resources" className="rounded-[26px] border border-[#eee8e8] bg-white p-7 sm:p-9">
            <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#c92835]">Free preparation resources</p>
            <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight">Start with helpful study material</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#686868]">Resource links and downloadable practice material can be added here as they are ready.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["CLAT practice", "Judiciary guides", "CLAT PG revision"].map((label) => <span key={label} className="rounded-full border border-[#eee3e4] px-3 py-1.5 text-xs font-semibold text-[#5f5f5f]">{label}</span>)}
            </div>
          </article>
        </section>

        {/* Placeholder zones for verified faculty and student stories */}
        <section id="faculty" className="border-y border-[#eee8e8] bg-[#fffafa] py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Faculty and guidance</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Learn with experienced law educators</h2>
              <p className="mt-4 leading-7 text-[#686868]">Verified faculty profiles, subject expertise and teaching information will be added here.</p>
              <Link to="/faculty" className="mt-6 inline-flex items-center text-sm font-bold text-[#c92835]">Meet the faculty</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Faculty photo", "Faculty photo", "Faculty photo"].map((label, index) => (
                <div key={index} className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-[#dab5b8] bg-white text-center text-xs font-semibold text-[#b15d63] sm:min-h-48">[Add verified faculty profile]</div>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="rounded-[26px] border border-[#eee8e8] bg-white p-7 sm:p-9">
            <div className="flex items-start gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Student experiences</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Stories from learners</h2><p className="mt-2 text-sm leading-6 text-[#686868]">Genuine student feedback and outcomes will be added here after approval.</p></div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="rounded-2xl bg-[#fffafa] p-5"><p className="text-sm text-[#686868]">[Add an approved student experience]</p><p className="mt-4 text-xs font-semibold text-[#a96065]">[Student name · course]</p></div>)}
            </div>
          </div>
        </section>

        <section className="bg-[#fffafa] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Need help choosing?</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2></div>
            <div className="mt-8 divide-y divide-[#eee4e5] border-y border-[#eee4e5]">
              {faqs.map((faq) => <details key={faq.q} className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#c92835]"><span>{faq.q}</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-[#686868]">{faq.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 rounded-[26px] bg-[#292929] p-7 text-white sm:flex-row sm:items-center sm:p-9">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#ffb8bd]">Take the next step</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Find the right law preparation course</h2><p className="mt-2 text-sm text-white/70">Explore course details or get in touch about a free demo.</p></div>
            <Link to="/courses" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#c92835] px-6 text-sm font-bold text-white hover:bg-[#a91f2b]">Browse courses</Link>
          </div>
        </section>
      </main>
      <BatchesFooter brandName="Legal Factory" />
    </div>
  );
}
