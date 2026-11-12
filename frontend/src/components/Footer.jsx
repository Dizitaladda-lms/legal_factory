import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div><Link to="/" className="text-xl font-bold text-slate-900">Legal <span className="text-red-700">Factory</span></Link><p className="mt-3 max-w-xs text-sm leading-6">Online preparation for CLAT, Judiciary and CLAT PG.</p></div>
        <div><h2 className="font-semibold text-slate-900">Explore</h2><div className="mt-3 grid gap-2 text-sm"><Link to="/courses">Courses</Link><Link to="/faculty">Faculty</Link><Link to="/about">About us</Link><Link to="/blogs">Free resources</Link></div></div>
        <div><h2 className="font-semibold text-slate-900">Contact</h2><div className="mt-3 grid gap-2 text-sm"><a href="mailto:hello@legalfactory.in">[Replace with contact email]</a><a href="tel:+910000000000">[Replace with contact phone]</a><span>[Replace with office address]</span></div></div>
        <div><h2 className="font-semibold text-slate-900">Policies</h2><div className="mt-3 grid gap-2 text-sm"><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/refund-policy">Refund Policy</Link></div></div>
      </div>
      <div className="border-t border-slate-200 px-5 py-5 text-center text-xs">© {new Date().getFullYear()} Legal Factory. All rights reserved.</div>
    </footer>
  );
}
