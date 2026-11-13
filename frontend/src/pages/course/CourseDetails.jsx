import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../lib/api";
import BatchesHeader from "../../components/batches/BatchesHeader";
import BatchesFooter from "../../components/batches/BatchesFooter";

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

  const enquiryHref = "/#contact";

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

                <aside className="rounded-[24px] border border-[#ecd4d6] bg-white p-6 shadow-[0_18px_50px_rgba(65,27,30,.08)] lg:sticky lg:top-24">
                  {course.hero_image_url ? (
                    <img src={course.hero_image_url} alt={course.name} className="mb-5 h-40 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="mb-5 grid h-40 place-items-center rounded-2xl bg-[#f5f5f5] text-sm font-semibold text-[#8a5559]">[Course image placeholder]</div>
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8a7778]">Study modes</p>
                  <p className="mt-1 text-xl font-bold tracking-tight">Online or Delhi campus</p>
                  <p className="mt-3 text-sm leading-5 text-[#777]">Enquire for admission and our counsellor will contact you with course and fee details.</p>
                  <a href={enquiryHref} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#d74752] px-5 text-sm font-bold text-white hover:bg-[#b73540]">Enquire for Admission</a>
                </aside>
              </div>
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
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Course curriculum</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Modules and subjects</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#686868]">Expand a module to see its lesson and practice components.</p></div>
              <div className="mt-8 space-y-3">
                {course.course_modules?.length ? course.course_modules.map((module) => (
                  <details key={`${module.position}-${module.title}`} className="group overflow-hidden rounded-2xl border border-[#eee3e4] bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold marker:hidden sm:px-6">
                      <span>{module.title}</span>
                    </summary>
                    <div className="border-t border-[#f1ebeb] px-5 py-4 sm:px-6">
                      <p className="text-sm leading-6 text-[#686868]">{module.description}</p>
                      {module.module_items?.length ? <ul className="mt-4 grid gap-2 sm:grid-cols-2">{module.module_items.map((item) => <li key={`${item.position}-${item.title}`} className="text-sm text-[#555]">{item.title}</li>)}</ul> : <p className="mt-3 text-sm text-[#777]">Module resources will be added soon.</p>}
                    </div>
                  </details>
                )) : <div className="rounded-2xl border border-dashed border-[#dfb8bb] bg-white p-7 text-center text-sm text-[#686868]">Course modules will be added soon.</div>}
              </div>
            </div>
          </section>

          {/* Test series cards */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d74752]">Practice and review</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Test series</h2><p className="mt-3 max-w-2xl leading-7 text-[#686868]">See the practice tests and review methods included in this course.</p></div>
            {course.course_tests?.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-3">{course.course_tests.map((test) => <article key={`${test.position}-${test.title}`} className="rounded-2xl border border-[#eee8e8] p-5"><h3 className="font-bold">{test.title}</h3><p className="mt-2 text-sm leading-6 text-[#686868]">{test.description}</p></article>)}</div>
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
