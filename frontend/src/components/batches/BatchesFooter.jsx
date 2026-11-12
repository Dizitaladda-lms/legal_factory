import React from "react";
import { Link } from "react-router-dom";

// Shared footer for public law coaching pages. Replace contact/social placeholders before launch.
export default function BatchesFooter({
  brandName = "Lawyer Factory",
  phone = "9266500226",
  email = "[Add email address]",
}) {
  return (
    <footer id="contact" className="border-t border-white/20 bg-[#c92835] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/lawyer-factory-logo.png" alt="The Lawyer’s Factory logo" loading="lazy" className="h-12 w-12 rounded-full border border-white/30 bg-black object-contain" />
              <span className="font-bold">{brandName}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              Online preparation for CLAT, Judiciary and CLAT PG. Course details and learning support are provided in Hindi + English.
            </p>
            <div className="mt-5 flex gap-2.5">
              <a href="#social" className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">Instagram</a>
              <a href="#social" className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">YouTube</a>
              <a href="#social" className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">LinkedIn</a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold">Explore</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link className="hover:text-white" to="/courses">All Courses</Link></li>
              <li><Link className="hover:text-white" to="/course/clat-ug-2028-1-year-batch">CLAT UG</Link></li>
              <li><Link className="hover:text-white" to="/course/judiciary-online-coaching">Judiciary</Link></li>
              <li><Link className="hover:text-white" to="/course/clat-pg-online-coaching">CLAT PG</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold">Resources</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link className="hover:text-white" to="/#resources">Free Study Resources</Link></li>
              <li><Link className="hover:text-white" to="/blogs">Articles and Updates</Link></li>
              <li><Link className="hover:text-white" to="/#faculty">Faculty</Link></li>
              <li><Link className="hover:text-white" to="/#approach">Our approach</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li><span className="block text-xs uppercase tracking-wide text-white/45">Phone</span><a className="hover:text-white" href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a></li>
              <li><span className="block text-xs uppercase tracking-wide text-white/45">Email</span>{email}</li>
              <li><span className="block text-xs uppercase tracking-wide text-white/45">Address</span>[Add office address]</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="#privacy" className="hover:text-white">Privacy Policy</a>
            <a href="#terms" className="hover:text-white">Terms</a>
            <a href="#refund" className="hover:text-white">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
