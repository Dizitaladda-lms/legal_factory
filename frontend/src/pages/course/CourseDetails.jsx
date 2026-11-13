import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpenCheck, CheckCircle2, ChevronDown, ClipboardCheck, FileText, PlayCircle, Target } from "lucide-react";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";
import { getLawCourseImage } from "../../utils/lawCourseImage";

function formatDate(value) {
  if (!value) return "To be announced";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "To be announced" : date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function safeHref(value, fallback = "#contact") {
  if (!value) return fallback;
  return /^https:\/\//i.test(value) || value.startsWith("/") || value.startsWith("#") ? value : fallback;
}

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

  const enquiryHref = "/#admission-inquiry";
  const courseModules = Array.isArray(course?.course_modules) ? course.course_modules : [];
  const courseTests = Array.isArray(course?.course_tests) ? course.course_tests : [];
  const moduleResources = courseModules.flatMap((module) => module.module_items || []);
  const videoModuleCount = courseModules.filter((module) => (module.module_items || []).some((item) => /video/i.test(item.title))).length;
  const practiceResources = ["Practice questions", "Sectional test", "Doubt session"]
    .map((title) => ({ title, moduleCount: courseModules.filter((module) => (module.module_items || []).some((item) => item.title === title)).length }))
    .filter((item) => item.moduleCount > 0);

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="Lawyer Factory" />
      {loading ? (
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-live="polite">
          <div className="h-8 w-40 animate-pulse rounded bg-[#f7e8e9]" />
          <div className="mt-6 h-14 max-w-2xl animate-pulse rounded bg-[#f7e8e9]" />
          <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-[#f7e8e9]" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-[#f5f5f5]" />)}</div>
        </main>
      ) : error || !course ? (
        <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h1 className="mt-5 text-3xl font-bold">Course details are unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-[#686868]">This course may not be published yet. Browse the current course catalog to see available programs.</p>
          <Link to="/courses" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#d74752] px-5 text-sm font-bold text-white hover:bg-[#b73540]">Browse courses</Link>
        </main>
      ) : (
        <main>
          {/* Course overview and primary actions */}
          <section className="border-b border-[#eee8e8] bg-[#ffffff]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
              <nav className="mb-7 text-xs font-medium text-[#777]" aria-label="Breadcrumb"><Link to="/" className="hover:text-[#d74752]">Home</Link><span className="mx-2">/</span><Link to="/courses" className="hover:text-[#d74752]">Courses</Link><span className="mx-2">/</span><span className="text-[#555]">{course.name}</span></nav>
              <div className="grid items-start gap-9 lg:grid-cols-[1fr_350px] lg:gap-12">
                <div>
                  <span className="inline-flex rounded-full border border-[#edc9cc] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#d74752]">{course.slug?.includes("judiciary") ? "Judiciary preparation" : course.slug?.includes("pg") ? "Postgraduate law entrance" : "Law entrance preparation"}</span>
                  <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-[-.035em] sm:text-4xl lg:text-5xl">{course.name}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#666]">{course.description || "Course description will be added soon."}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#eee2e3] bg-white px-3.5 py-2 text-sm font-semibold text-[#555]">Starts: {formatDate(course.batch_start_date)}</span>
                    <span className="rounded-full border border-[#eee2e3] bg-white px-3.5 py-2 text-sm font-semibold text-[#555]">Language: {course.language || "Hindi + English"}</span>
                    <span className="rounded-full border border-[#eee2e3] bg-white px-3.5 py-2 text-sm font-semibold text-[#555]">Duration: {course.duration_label || "To be announced"}</span>
                  </div>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <a href={enquiryHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d74752] px-6 text-sm font-bold text-white hover:bg-[#b73540]">Enquire for Admission</a>
                    <a href={enquiryHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d74752] bg-white px-6 text-sm font-bold text-[#d74752] hover:bg-[#f5f5f5]">Ask a Counsellor</a>
                  </div>
                </div>

                <aside className="overflow-hidden rounded-[24px] border border-[#ecd4d6] bg-white shadow-[0_20px_55px_rgba(65,27,30,.12)] lg:sticky lg:top-24">
                  <div className="relative h-56 overflow-hidden bg-[#f3eeee] sm:h-64">
                    <img src={course.hero_image_url || getLawCourseImage(course)} alt="" aria-hidden="true" fetchPriority="high" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#321319]/65 via-transparent to-transparent" aria-hidden="true" />
                    <span className="absolute bottom-4 left-5 rounded-full border border-white/70 bg-white/95 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#8f1d2c]">Course overview</span>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8a7778]">Study modes</p>
                    <p className="mt-1 text-xl font-bold tracking-tight">Online or Delhi campus</p>
                    <p className="mt-3 text-sm leading-6 text-[#686868]">Enquire for admission and our counsellor will contact you with course and fee details.</p>
                    <a href={enquiryHref} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#8f1d2c] px-5 text-sm font-bold text-white transition hover:bg-[#741622] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c]">Enquire for Admission</a>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Course roadmap snapshot */}
          <section className="mx-auto -mt-2 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8" aria-label="Course roadmap summary">
            <div className="grid overflow-hidden rounded-2xl border border-[#eee3e4] bg-white shadow-[0_16px_45px_rgba(68,24,29,.06)] sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: BookOpenCheck, value: courseModules.length, label: "Step-by-step modules" },
                { icon: PlayCircle, value: videoModuleCount, label: "Modules with concept videos" },
                { icon: ClipboardCheck, value: courseTests.length, label: "Assessment formats" },
                { icon: FileText, value: moduleResources.length, label: "Learning resources listed" },
              ].map(({ icon: Icon, value, label }, index) => <div key={label} className={`flex items-center gap-4 px-5 py-5 ${index ? "border-t border-[#f0e8e9] sm:border-l sm:border-t-0" : ""}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fbf1f2] text-[#941d2d]"><Icon size={20} aria-hidden="true" /></span><div><p className="text-2xl font-bold leading-none text-[#202027]">{value}</p><p className="mt-1.5 text-xs font-medium text-[#747078]">{label}</p></div></div>)}
            </div>
          </section>

          {/* Course inclusions */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">The learning experience</p><h2 className="mt-3 text-3xl font-bold tracking-tight">What you get in this course</h2><p className="mt-3 leading-7 text-[#686868]">Review the course support and learning materials included in this program.</p></div>
            {course.course_benefits?.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {course.course_benefits.map((benefit) => (
                  <article key={`${benefit.position}-${benefit.title}`} className="rounded-2xl border border-[#eee8e8] p-5">
                    <h3 className="font-bold">{benefit.title}</h3><p className="mt-1.5 text-sm leading-6 text-[#686868]">{benefit.description}</p>
                  </article>
                ))}
              </div>
            ) : <p className="mt-7 rounded-2xl border border-dashed border-[#dfb8bb] p-6 text-sm text-[#686868]">Course inclusions will be added soon.</p>}
          </section>

          {/* Expandable course modules */}
          <section className="bg-[#ffffff] py-14 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Your preparation, mapped</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Modules and subjects</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#686868]">Follow the course in sequence. Open each module to review its teaching and practice components.</p></div>
              <div className="relative mt-10 space-y-4 before:absolute before:bottom-8 before:left-[27px] before:top-8 before:w-px before:bg-[#ead6d8] sm:before:left-[31px]">
                {courseModules.length ? courseModules.map((module, index) => (
                  <details key={`${module.position}-${module.title}`} open={index === 0} className="group relative overflow-hidden rounded-2xl border border-[#eee3e4] bg-white shadow-[0_8px_26px_rgba(35,25,25,.035)] transition-shadow open:shadow-[0_14px_34px_rgba(35,25,25,.07)]">
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-5 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#941d2d] sm:gap-5 sm:px-6">
                      <span className="z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-white bg-[#941d2d] text-sm font-bold text-white shadow-sm sm:h-16 sm:w-16">{String(index + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#a13a46]">Module {String(index + 1).padStart(2, "0")}</span><span className="mt-1 block font-serif text-xl font-bold text-[#202027] sm:text-2xl">{module.title}</span><span className="mt-1 block text-xs text-[#777]">{module.module_items?.length || 0} learning components</span></span>
                      <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-[#941d2d] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-[#f1ebeb] px-5 py-5 sm:ml-[84px] sm:px-6 sm:py-6">
                      {module.description && <p className="max-w-3xl text-sm leading-7 text-[#62616a]">{module.description}</p>}
                      {module.module_items?.length ? <ul className="mt-5 grid gap-3 sm:grid-cols-2">{module.module_items.map((item) => { const Icon = /video/i.test(item.title) ? PlayCircle : /test|practice|question/i.test(item.title) ? CheckCircle2 : FileText; return <li key={`${item.position}-${item.title}`} className="flex items-center gap-3 rounded-xl border border-[#f0e8e9] bg-[#fdfafa] px-4 py-3 text-sm font-medium text-[#41404a]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#941d2d] shadow-sm"><Icon size={17} aria-hidden="true" /></span>{item.title}</li>; })}</ul> : <p className="mt-3 text-sm text-[#777]">Module resources will be added soon.</p>}
                    </div>
                  </details>
                )) : <div className="rounded-2xl border border-dashed border-[#dfb8bb] bg-white p-7 text-center text-sm text-[#686868]">Course modules will be added soon.</div>}
              </div>
              {!!practiceResources.length && <div className="mt-7 rounded-2xl bg-[#f9f4f4] p-5 sm:p-6"><h3 className="font-serif text-xl font-bold">Practice and assignments</h3><p className="mt-1 text-sm leading-6 text-[#686868]">Practice components currently listed across the course modules:</p><div className="mt-4 flex flex-wrap gap-2">{practiceResources.map(({ title, moduleCount }) => <span key={title} className="rounded-full border border-[#e9d5d7] bg-white px-4 py-2 text-xs font-semibold text-[#6c3440]">{title} <span className="text-[#8a8588]">· {moduleCount} {moduleCount === 1 ? "module" : "modules"}</span></span>)}</div><p className="mt-4 text-xs leading-5 text-[#777]">Assignment quantities and due dates are shared with the batch schedule.</p></div>}
            </div>
          </section>

          {/* Test series cards */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Practice and review</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Test series</h2><p className="mt-3 max-w-2xl leading-7 text-[#686868]">See the practice tests and review methods included in this course.</p></div>
            {courseTests.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-3">{courseTests.map((test, index) => <article key={`${test.position}-${test.title}`} className="relative overflow-hidden rounded-2xl border border-[#eee3e4] bg-white p-6 shadow-[0_8px_26px_rgba(35,25,25,.035)]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fbf1f2] text-[#941d2d]"><Target size={20} aria-hidden="true" /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.15em] text-[#a13a46]">Assessment {String(index + 1).padStart(2, "0")}</p><h3 className="mt-1 font-serif text-xl font-bold">{test.title}</h3><p className="mt-2 text-sm leading-6 text-[#686868]">{test.description}</p></article>)}</div>
            ) : <p className="mt-7 rounded-2xl border border-dashed border-[#dfb8bb] p-6 text-sm text-[#686868]">Test series details will be added soon.</p>}
          </section>

          {/* Batch information */}
          <section className="bg-[#ffffff] py-14 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Plan your preparation</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Batch details</h2></div>
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
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Meet your mentors</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Faculty</h2><p className="mt-3 text-sm text-[#686868]">Faculty profiles and verified qualifications.</p></div>
            {course.course_faculty?.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{course.course_faculty.map((member, index) => <article key={`${member.name}-${index}`} className="rounded-2xl border border-[#eee8e8] p-5">{member.photo_url ? <img src={member.photo_url} alt={member.name} loading="lazy" className="h-44 w-full rounded-xl object-cover" /> : <div className="grid h-44 place-items-center rounded-xl bg-[#f5f5f5] text-sm font-semibold text-[#b15d63]">[Faculty photo]</div>}<h3 className="mt-4 font-bold">{member.name}</h3><p className="mt-1 text-sm text-[#686868]">{member.qualification}</p></article>)}</div>
            ) : <div className="mt-7 rounded-2xl border border-dashed border-[#dfb8bb] p-6 text-sm text-[#686868]">Verified faculty profiles will be added here.</div>}
          </section>

          {/* Questions */}
          <section className="bg-[#ffffff] py-14 sm:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Course support</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Frequently asked questions</h2></div>
              <div className="mt-8 divide-y divide-[#eee4e5] border-y border-[#eee4e5]">
                <details className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#d74752]">How can I get course and fee details?</summary><p className="mt-3 text-sm leading-6 text-[#686868]">Send an admission enquiry and our counsellor will contact you with the details.</p></details>
                <details className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#d74752]">What is the refund policy?</summary><p className="mt-3 text-sm leading-6 text-[#686868]">{course.refund_policy_summary || "Please review the refund policy before enrolling."} {course.refund_policy_url && <a href={safeHref(course.refund_policy_url)} className="font-semibold text-[#d74752] underline">Read the full policy</a>}</p></details>
                <details className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#d74752]">Are class recordings available?</summary><p className="mt-3 text-sm leading-6 text-[#686868]">{course.learning_mode || "Recording availability will be confirmed for the selected batch."}</p></details>
                <details className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#d74752]">Which language is used for teaching?</summary><p className="mt-3 text-sm leading-6 text-[#686868]">{course.language || "Hindi + English"}</p></details>
                <details className="group py-5"><summary className="cursor-pointer list-none font-bold hover:text-[#d74752]">How do I attend a free demo?</summary><p className="mt-3 text-sm leading-6 text-[#686868]">Use the Free Demo Class button and follow the current booking instructions.</p></details>
              </div>
            </div>
          </section>

          {/* Mobile enrollment bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#eadcdd] bg-white px-4 py-3 shadow-[0_-8px_28px_rgba(35,25,25,.08)] lg:hidden">
            <div className="min-w-0"><span className="block truncate text-sm font-bold">Online or Delhi campus</span><span className="block truncate text-[11px] text-[#777]">{course.name}</span></div>
            <a href={enquiryHref} className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-[#d74752] px-4 text-sm font-bold text-white">Enquire</a>
          </div>
        </main>
      )}
      <BatchesFooter brandName="Lawyer Factory" />
    </div>
  );
}
