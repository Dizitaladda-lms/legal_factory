import { Link } from "react-router-dom";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

export default function About() {
  return (
    <div className="law-site min-h-screen bg-white text-slate-700">
      <BatchesHeader brandName="Legal Factory" />
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-700">About Legal Factory</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">A focused place to prepare for law entrance exams.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8">Legal Factory offers online coaching for CLAT, Judiciary and CLAT PG aspirants. Explore course details, teaching formats and available support, then choose the preparation path that fits your goals.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/courses" className="rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800">Explore courses</Link>
          <Link to="/faculty" className="rounded-full border border-red-700 px-6 py-3 font-semibold text-red-700 hover:bg-red-50">Meet the faculty</Link>
        </div>
        <section className="mt-16 grid gap-5 sm:grid-cols-3">
          {[["Live learning", "Attend instructor-led classes and use recordings where they are available."], ["Structured practice", "Build consistency with topic-wise practice, mock tests and review."], ["Student support", "Get help with questions and preparation planning through the available course support." ]].map(([title, body]) => <article key={title} className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-3 leading-7">{body}</p></article>)}
        </section>
      </main>
      <BatchesFooter brandName="Legal Factory" />
    </div>
  );
}
