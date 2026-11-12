import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

const filters = ["All courses", "CLAT UG", "Judiciary", "CLAT PG"];

function getType(course) {
  const slug = (course.slug || "").toLowerCase();
  if (slug.includes("judiciary")) return "Judiciary";
  if (slug.includes("pg")) return "CLAT PG";
  return "CLAT UG";
}

function formatPrice(amount, currency = "INR") {
  if (amount == null || amount === "") return "Contact for price";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(Number(amount));
}

function formatDate(value) {
  if (!value) return "To be announced";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "To be announced" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CourseListing() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("All courses");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/api/law-courses")
      .then(({ data }) => {
        if (!active) return;
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleCourses = useMemo(() => courses.filter((course) => {
    const matchesFilter = filter === "All courses" || getType(course) === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${course.name} ${course.description} ${course.language}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  }), [courses, filter, search]);

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="Legal Factory" />
      <main>
        <section className="border-b border-[#eee8e8] bg-[#fffafa]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Online law coaching</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Explore law courses</h1>
              <p className="mt-4 text-base leading-7 text-[#686868]">Compare CLAT UG, Judiciary and CLAT PG programs. Batch dates, language and prices come from the published course catalog.</p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by course type">
                {filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${filter === item ? "bg-[#c92835] text-white" : "border border-[#eadcdd] bg-white text-[#5f5f5f] hover:border-[#c92835] hover:text-[#c92835]"}`}>{item}</button>)}
              </div>
              <label className="flex min-h-11 w-full items-center gap-2 rounded-full border border-[#e9e1e1] bg-white px-4 sm:max-w-xs">
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-[#969090]" placeholder="Search courses" aria-label="Search courses" />
              </label>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#c92835]">Course catalog</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">{filter === "All courses" ? "Available programs" : filter}</h2></div>
            {!loading && !error && <span className="text-sm text-[#777]">{visibleCourses.length} {visibleCourses.length === 1 ? "course" : "courses"}</span>}
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl border border-[#eee8e8] bg-[#fffafa]" />)}</div>
          ) : error ? (
            <div className="rounded-2xl border border-[#edc9cc] bg-[#fffafa] p-8 text-center">
              <p className="font-semibold">Course catalog couldn’t be loaded.</p><p className="mt-2 text-sm text-[#686868]">Please refresh the page in a moment.</p>
            </div>
          ) : visibleCourses.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleCourses.map((course) => (
                <article key={course.slug} className="flex flex-col overflow-hidden rounded-2xl border border-[#eee8e8] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(65,27,30,.09)]">
                  <div className="relative flex min-h-36 items-end overflow-hidden bg-[#f9e9ea] p-5">
                    <div className="absolute -right-4 -top-12 h-40 w-40 rounded-full border border-[#e6c3c5]" />
                    <div className="absolute right-8 -top-6 h-28 w-28 rounded-full border border-[#e6c3c5]" />
                    <span className="relative inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#c92835]">{getType(course)}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-xl font-bold leading-snug">{course.name}</h3>
                    <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#686868]">{course.description || "Course overview will be added soon."}</p>
                    <div className="mt-4 space-y-2 border-t border-[#f0ebeb] pt-4 text-sm text-[#646464]">
                      <p>Starts: {formatDate(course.batch_start_date)}</p>
                      <p>Language: {course.language || "Hindi + English"}</p>
                      <p>Duration: {course.duration_label || "To be announced"}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[#292929]">{formatPrice(course.price_amount, course.price_currency)}</span>
                      <Link to={`/course/${encodeURIComponent(course.slug)}`} className="inline-flex min-h-10 items-center rounded-full bg-[#c92835] px-4 text-sm font-bold text-white hover:bg-[#a91f2b]">View Details</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dfb8bb] bg-[#fffafa] p-10 text-center">
              <h3 className="mt-4 text-lg font-bold">No matching courses</h3>
              <p className="mt-2 text-sm text-[#686868]">Try another filter or search term.</p>
              <button onClick={() => { setFilter("All courses"); setSearch(""); }} className="mt-4 text-sm font-bold text-[#c92835] hover:underline">Clear filters</button>
            </div>
          )}
        </section>

        <section className="bg-[#fffafa]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div><h2 className="text-xl font-bold">Need help choosing a course?</h2><p className="mt-1 text-sm text-[#686868]">Ask about course details or the next free demo.</p></div>
            <Link to="/#contact" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c92835] px-5 text-sm font-bold text-[#c92835] hover:bg-white">Contact the team</Link>
          </div>
        </section>
      </main>
      <BatchesFooter brandName="Legal Factory" />
    </div>
  );
}
