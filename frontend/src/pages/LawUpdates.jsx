import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

const formatDate = (value) => {
  if (!value) return "Recently published";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently published" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function LawUpdates() {
  const [updates, setUpdates] = useState({ current: [], exams: [], vacancies: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/api/news")
      .then(({ data }) => {
        if (!active) return;
        setUpdates({
          current: Array.isArray(data?.current) ? data.current : [],
          exams: Array.isArray(data?.exams) ? data.exams : [],
          vacancies: Array.isArray(data?.vacancies) ? data.vacancies : [],
          results: Array.isArray(data?.results) ? data.results : [],
        });
      })
      .catch(() => { if (active) setUnavailable(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const groups = [
    { id: "news", title: "Latest law news", description: "Legal, judiciary and CLAT headlines.", items: updates.current },
    { id: "exams", title: "Exam notifications & application forms", description: "Entrance exam, recruitment, registration and admit-card updates.", items: [...updates.exams, ...updates.vacancies].filter((item, index, all) => all.findIndex((entry) => entry.url === item.url) === index).sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)) },
    { id: "results", title: "Results & answer keys", description: "Law entrance and judiciary result announcements.", items: updates.results },
  ];

  return (
    <div className="law-site min-h-screen bg-white text-[#292929]">
      <BatchesHeader brandName="Lawyer Factory" />
      <main>
        <section className="border-b border-[#eee3e4] bg-[#fdf9f9]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <Link to="/#current-affairs" className="text-sm font-semibold text-[#8f1d2c] hover:underline">← Back to home</Link>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.15em] text-[#8f1d2c]">Stay informed</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold sm:text-5xl">Law entrance news, exam forms and results</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b5563]">Browse the available updates and open each publisher or issuing-body source for complete information.</p>
          </div>
        </section>
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {loading ? <div className="space-y-4" aria-live="polite">{[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-[#f7f1f2]" />)}</div> : unavailable ? <p className="rounded-2xl border border-[#ead5d7] p-6 text-[#4b5563]" role="status">Updates are temporarily unavailable. Please try again later.</p> : groups.map((group) => (
            <section key={group.id} className="overflow-hidden rounded-2xl border border-[#eee3e4] bg-white shadow-[0_12px_34px_rgba(55,25,30,.05)]" aria-labelledby={`updates-${group.id}`}>
              <div className="border-b border-[#f0e8e9] bg-[#fdfafa] px-5 py-5 sm:px-7"><h2 id={`updates-${group.id}`} className="font-serif text-2xl font-bold sm:text-3xl">{group.title}</h2><p className="mt-1 text-sm text-[#4b5563]">{group.description}</p></div>
              {group.items.length ? <ol className="divide-y divide-[#f0e8e9] px-5 sm:px-7">{group.items.map((item, index) => <li key={item.id || item.url} className="flex gap-4 py-5"><span className="w-8 shrink-0 pt-0.5 font-serif text-sm font-bold text-[#9b1c2e]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold leading-6 text-[#202027] underline decoration-[#d7b6ba] underline-offset-4 hover:text-[#8f1d2c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c]">{item.title}</a><p className="mt-2 text-sm text-[#4b5563]">{item.source || item.category || "Publisher source"} <span aria-hidden="true">·</span> <time dateTime={item.published_at || undefined}>{formatDate(item.published_at)}</time>{item.application_deadline ? <span> <span aria-hidden="true">·</span> Apply by {item.application_deadline}</span> : null}</p></div><a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 self-center text-sm font-semibold text-[#8f1d2c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f1d2c]">Open source ↗</a></li>)}</ol> : <p className="px-5 py-6 text-sm text-[#4b5563] sm:px-7">No updates are available in this category right now.</p>}
            </section>
          ))}
          {!loading && !unavailable && <p className="text-sm leading-6 text-[#4b5563]">Exam dates, eligibility and application details can change. Use the linked issuing-body notice to confirm official information.</p>}
        </div>
      </main>
      <BatchesFooter brandName="Lawyer Factory" />
    </div>
  );
}
