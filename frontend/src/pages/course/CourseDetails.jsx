import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FileText,
  Languages,
  MessageCircleQuestion,
  PlayCircle,
  Scale,
  Target,
} from "lucide-react";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";

function formatPrice(amount, currency = "INR") {
  if (amount == null || amount === "") return "Contact for price";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(Number(amount));
}

function formatDate(value) {
  if (!value) return "To be announced";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "To be announced" : date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function safeHref(value, fallback = "#contact") {
  if (!value) return fallback;
  return /^https:\/\//i.test(value) || value.startsWith("/") || value.startsWith("#") ? value : fallback;
}

const iconFor = (title = "") => {
  const value = title.toLowerCase();
  if (value.includes("live")) return PlayCircle;
  if (value.includes("note") || value.includes("pdf")) return FileText;
  if (value.includes("doubt")) return MessageCircleQuestion;
  if (value.includes("test") || value.includes("mock")) return Target;
  return Check;
};

export default function CourseDetails() {
  const { id, slug } = useParams();
  const courseSlug = slug || id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);
    api.get(`/api/law-courses/${encodeURIComponent(courseSlug || "")}`)
      .then(({ data }) => {
        if (active) setCourse(data?.course || null);
      })
      .catch(() => {
        if (active) {
          setCourse(null);
          setError(true);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseSlug]);

  const price = course ? formatPrice(course.price_amount, course.price_currency) : "Contact for price";
  const enrollHref = safeHref(course?.enrollment_url);
  const demoHref = safeHref(course?.demo_url);

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="[WEBSITE NAME]" />
      {loading ? (
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-live="polite">
          <div className="h-8 w-40 animate-pulse rounded bg-[#f7e8e9]" />
          <div className="mt-6 h-14 max-w-2xl animate-pulse rounded bg-[#f7e8e9]" />
          <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-[#f7e8e9]" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-[#fff5f5]" />)}</div>
        </main>
      ) : error || !course ? (
        <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff1f2] text-[#c92835]"><BookOpen size={26} /></span>
          <h1 className="mt-5 text-3xl font-bold">Course details are unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-[#686868]">This course may not be published yet. Browse the current course catalog to see available programs.</p>
          <Link to="/courses" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c92835] px-5 text-sm font-bold text-white hover:bg-[#a91f2b]">Browse courses <ArrowRight size={16} /></Link>
        </main>
      ) : (
        <main>
          {/* Course overview and primary actions */}
          <section className="border-b border-[#eee8e8] bg-[#fffafa]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
              <nav className="mb-7 text-xs font-medium text-[#777]" aria-label="Breadcrumb"><Link to="/" className="hover:text-[#c92835]">Home</Link><span className="mx-2">/</span><Link to="/courses" className="hover:text-[#c92835]">Courses</Link><span className="mx-2">/</span><span className="text-[#555]">{course.name}</span></nav>
              <div className="grid items-start gap-9 lg:grid-cols-[1fr_350px] lg:gap-12">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#edc9cc] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#c92835]"><Scale size={14} />{course.slug?.includes("judiciary") ? "Judiciary preparation" : course.slug?.includes("pg") ? "Postgraduate law entrance" : "Law entrance preparation"}</span>
                  <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-[-.035em] sm:text-4xl lg:text-5xl">{course.name}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#666]">{course.description || "Course description will be added soon."}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#eee2e3] bg-white px-3.5 py-2 text-xs font-semibold text-[#555]"><Clock3 size={14} className="text-[#c92835]" />Starts: {formatDate(course.batch_start_date)}</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#eee2e3] bg-white px-3.5 py-2 text-xs font-semibold text-[#555]"><Languages size={14} className="text-[#c92835]" />{course.language || "Hindi + English"}</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#eee2e3] bg-white px-3.5 py-2 text-xs font-semibold text-[#555]"><BookOpen size={14} className="text-[#c92835]" />{course.duration_label || "Duration to be announced"}</span>
                  </div>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <a href={enrollHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c92835] px-6 text-sm font-bold text-white hover:bg-[#a91f2b]">Enroll Now <ArrowRight size={16} /></a>
                    <a href={demoHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c92835] bg-white px-6 text-sm font-bold text-[#c92835] hover:bg-[#fff2f2]">Free Demo Class</a>
                  </div>
                </div>

                <aside className="rounded-[24px] border border-[#ecd4d6] bg-white p-6 shadow-[0_18px_50px_rgba(65,27,30,.08)] lg:sticky lg:top-24">
                  {course.hero_image_url ? (
                    <img src={course.hero_image_url} alt={course.name} className="mb-5 h-40 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="mb-5 grid h-40 place-items-center rounded-2xl bg-[#fff1f2] text-[#c92835]"><div className="text-center"><Scale size={34} className="mx-auto" /><span className="mt-2 block text-xs font-semibold">[Course image]</span></div></div>
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8a7778]">Course fee</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{price}</p>
                  {course.discount_label && <p className="mt-2 text-sm font-semibold text-[#c92835]">{course.discount_label}</p>}
                  <p className="mt-3 text-xs leading-5 text-[#777]">{course.refund_policy_summary || "Review the refund terms before enrolling."} {course.refund_policy_url && <a href={safeHref(course.refund_policy_url)} className="font-semibold text-[#c92835] underline">Refund policy</a>}</p>
                  <a href={enrollHref} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#c92835] px-5 text-sm font-bold text-white hover:bg-[#a91f2b]">Enroll Now <ArrowRight size={16} /></a>
                  <a href={demoHref} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#c92835] px-5 text-sm font-bold text-[#c92835] hover:bg-[#fff5f5]">Book a Free Demo</a>
                </aside>
              </div>
            </div>
          </section>

          {/* Course inclusions */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">The learning experience</p><h2 className="mt-3 text-3xl font-bold tracking-tight">What you get in this course</h2><p className="mt-3 leading-7 text-[#686868]">Review the course support and learning materials included in this program.</p></div>
            {course.course_benefits?.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {course.course_benefits.map((benefit) => { const Icon = iconFor(benefit.title); return (
                  <article key={`${benefit.position}-${benefit.title}`} className="rounded-2xl border border-[#eee8e8] p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1f2] text-[#c92835]"><Icon size={21} /></span>
                    <h3 className="mt-4 font-bold">{benefit.title}</h3><p className="mt-1.5 text-sm leading-6 text-[#686868]">{benefit.description}</p>
                  </article>
                ); })}
              </div>
            ) : <p className="mt-7 rounded-2xl border border-dashed border-[#dfb8bb] p-6 text-sm text-[#686868]">Course inclusions will be added soon.</p>}
          </section>

          {/* Expandable course modules */}
          <section className="bg-[#fffafa] py-14 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Course curriculum</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Modules and subjects</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#686868]">Expand a module to see its lesson and practice components.</p></div>
              <div className="mt-8 space-y-3">
                {course.course_modules?.length ? course.course_modules.map((module) => (
                  <details key={`${module.position}-${module.title}`} className="group overflow-hidden rounded-2xl border border-[#eee3e4] bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold marker:hidden sm:px-6">
                      <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff1f2] text-[#c92835]"><BookOpen size={17} /></span>{module.title}</span>
                      <span className="text-xl font-normal text-[#c92835] transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="border-t border-[#f1ebeb] px-5 py-4 sm:px-6">
                      <p className="text-sm leading-6 text-[#686868]">{module.description}</p>
                      {module.module_items?.length ? <ul className="mt-4 grid gap-2 sm:grid-cols-2">{module.module_items.map((item) => <li key={`${item.position}-${item.title}`} className="flex items-center gap-2 text-sm text-[#555]"><Check size={15} className="shrink-0 text-[#c92835]" />{item.title}</li>)}</ul> : <p className="mt-3 text-sm text-[#777]">Module resources will be added soon.</p>}
                    </div>
                  </details>
                )) : <div className="rounded-2xl border border-dashed border-[#dfb8bb] bg-white p-7 text-center text-sm text-[#686868]">Course modules will be added soon.</div>}
              </div>
            </div>
          </section>

          {/* Test series cards */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Practice and review</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Test series</h2><p className="mt-3 max-w-2xl leading-7 text-[#686868]">See the practice tests and review methods included in this course.</p></div>
            {course.course_tests?.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-3">{course.course_tests.map((test) => <article key={`${test.position}-${test.title}`} className="rounded-2xl border border-[#eee8e8] p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1f2] text-[#c92835]"><Target size={21} /></span><h3 className="mt-4 font-bold">{test.title}</h3><p className="mt-2 text-sm leading-6 text-[#686868]">{test.description}</p></article>)}</div>
            ) : <p className="mt-7 rounded-2xl border border-dashed border-[#dfb8bb] p-6 text-sm text-[#686868]">Test series details will be added soon.</p>}
          </section>

          {/* Batch information */}
          <section className="bg-[#fffafa] py-14 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Plan your preparation</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Batch details</h2></div>
              <dl className="mt-8 overflow-hidden rounded-2xl border border-[#eee3e4] bg-white">
                {[
                  ["Batch start", formatDate(course.batch_start_date)],
                  ["Class schedule", course.class_schedule || "To be announced"],
                  ["Course validity", course.course_validity || "To be announced"],
                  ["Learning mode", course.learning_mode || "To be announced"],
                  ["Language", course.language || "Hindi + English"],
                ].map(([label, value]) => <div key={label} className="grid gap-1 border-b border-[#f0ebeb] px-5 py-4 last:border-0 sm:grid-cols-[220px_1fr] sm:gap-5"><dt className="text-sm font-bold">{label}</dt><dd className="text-sm text-[#686868]">{value}</dd></div>)}
              </dl>
            </div>
          </section>

          {/* Verified faculty only */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Meet your mentors</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Faculty</h2><p className="mt-3 text-sm text-[#686868]">Faculty profiles and verified qualifications.</p></div>
            {course.course_faculty?.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{course.course_faculty.map((member, index) => <article key={`${member.name}-${index}`} className="rounded-2xl border border-[#eee8e8] p-5">{member.photo_url ? <img src={member.photo_url} alt={member.name} loading="lazy" className="h-44 w-full rounded-xl object-cover" /> : <div className="grid h-44 place-items-center rounded-xl bg-[#fff1f2] text-sm font-semibold text-[#b15d63]">[Faculty photo]</div>}<h3 className="mt-4 font-bold">{member.name}</h3><p className="mt-1 text-sm text-[#686868]">{member.qualification}</p></article>)}</div>
            ) : <div className="mt-7 rounded-2xl border border-dashed border-[#dfb8bb] p-6 text-sm text-[#686868]">Verified faculty profiles will be added here.</div>}
          </section>

          {/* Questions */}
          <section className="bg-[#fffafa] py-14 sm:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Course support</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Frequently asked questions</h2></div>
              <div className="mt-8 divide-y divide-[#eee4e5] border-y border-[#eee4e5]">
                <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">What is the course fee?<span className="text-xl font-normal text-[#c92835] group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-[#686868]">{price}. Check this page for current pricing and enrollment details.</p></details>
                <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">What is the refund policy?<span className="text-xl font-normal text-[#c92835] group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-[#686868]">{course.refund_policy_summary || "Please review the refund policy before enrolling."} {course.refund_policy_url && <a href={safeHref(course.refund_policy_url)} className="font-semibold text-[#c92835] underline">Read the full policy</a>}</p></details>
                <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Are class recordings available?<span className="text-xl font-normal text-[#c92835] group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-[#686868]">{course.learning_mode || "Recording availability will be confirmed for the selected batch."}</p></details>
                <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Which language is used for teaching?<span className="text-xl font-normal text-[#c92835] group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-[#686868]">{course.language || "Hindi + English"}</p></details>
                <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">How do I attend a free demo?<span className="text-xl font-normal text-[#c92835] group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-[#686868]">Use the Free Demo Class button and follow the current booking instructions.</p></details>
              </div>
            </div>
          </section>

          {/* Mobile enrollment bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#eadcdd] bg-white px-4 py-3 shadow-[0_-8px_28px_rgba(35,25,25,.08)] lg:hidden">
            <div className="min-w-0"><span className="block truncate text-sm font-bold">{price}</span><span className="block truncate text-[11px] text-[#777]">{course.name}</span></div>
            <a href={enrollHref} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#c92835] px-4 text-xs font-bold text-white">Enroll Now <ArrowRight size={14} /></a>
          </div>
        </main>
      )}
      <BatchesFooter brandName="[WEBSITE NAME]" />
    </div>
  );
}
