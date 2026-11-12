import { Link } from "react-router-dom";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

const faculty = [
  { name: "Faculty profile placeholder", subject: "CLAT UG", detail: "Replace with the mentor’s name, photo and verified qualifications." },
  { name: "Faculty profile placeholder", subject: "Judiciary", detail: "Replace with the mentor’s name, photo and verified qualifications." },
  { name: "Faculty profile placeholder", subject: "CLAT PG", detail: "Replace with the mentor’s name, photo and verified qualifications." },
];

export default function FacultyPage() {
  return (
    <div className="law-site min-h-screen bg-white text-slate-700">
      <BatchesHeader brandName="Lawyer Factory" />
      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-700">Our faculty</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Learn with experienced law educators</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8">Faculty profiles will be published here with verified subject experience and qualifications.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {faculty.map((person, index) => <article key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex aspect-[4/3] items-center justify-center bg-slate-50 text-sm text-slate-500">[Faculty photo placeholder]</div>
            <div className="p-6"><span className="text-sm font-semibold text-red-700">{person.subject}</span><h2 className="mt-2 text-xl font-bold text-slate-900">{person.name}</h2><p className="mt-2 leading-6">{person.detail}</p></div>
          </article>)}
        </div>
        <Link to="/courses" className="mt-9 inline-flex rounded-full bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800">Browse law courses</Link>
      </main>
      <BatchesFooter brandName="Lawyer Factory" />
    </div>
  );
}
