import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, Menu, X } from "lucide-react";

// Shared responsive navigation for the public law coaching pages.
export default function BatchesHeader({ brandName = "[WEBSITE NAME]" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  const navItems = [
    { label: "Courses", href: "/courses" },
    { label: "Faculty", href: "/#faculty" },
    { label: "Results", href: "/#results" },
    { label: "Free Resources", href: "/#resources" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee7e7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${brandName} home`}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c92835] text-white"><Scale size={21} strokeWidth={2.2} /></span>
          <span className="text-base font-bold tracking-tight text-[#242424] sm:text-lg">{brandName}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="text-sm font-medium text-[#525252] transition hover:text-[#c92835]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link to="/login" className="text-sm font-semibold text-[#3d3d3d] hover:text-[#c92835]">Login</Link>
          <Link to="/courses" className="inline-flex min-h-11 items-center rounded-full bg-[#c92835] px-5 text-sm font-bold text-white transition hover:bg-[#a91f2b]">
            Explore Courses <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-[#eadcdd] text-[#c92835] lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[#f0eaea] bg-white px-4 py-3 shadow-lg lg:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-[#3d3d3d] hover:bg-[#fff7f7] hover:text-[#c92835]">
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#f0eaea] pt-3">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-full border border-[#c92835] px-4 py-2.5 text-center text-sm font-semibold text-[#c92835]">Login</Link>
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="rounded-full bg-[#c92835] px-4 py-2.5 text-center text-sm font-bold text-white">Explore Courses</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
