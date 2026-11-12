import React, { useState } from "react";
import { Link } from "react-router-dom";

// Shared responsive navigation for the public law coaching pages.
export default function BatchesHeader({ brandName = "Lawyer Factory" }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Courses", href: "/courses" },
    { label: "Faculty", href: "/#faculty" },
    { label: "Results", href: "/#results" },
    { label: "Free Resources", href: "/#resources" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#b73540] bg-[#d74752] text-white">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${brandName} home`}>
          <img src="/lawyer-factory-logo.png" alt="The Lawyer’s Factory logo" className="h-10 w-10 rounded-full border border-white/30 bg-black object-contain" />
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">{brandName}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="text-sm font-medium text-white/90 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link to="/login" className="text-sm font-semibold text-white hover:text-white/80">Login</Link>
          <Link to="/courses" className="inline-flex min-h-11 items-center rounded-full bg-[#b73540] px-5 text-sm font-bold text-white transition hover:bg-[#861722]">
            Explore Courses
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 min-w-14 place-items-center rounded-xl border border-white/60 px-2 text-white lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="text-xs font-bold tracking-widest">{mobileOpen ? "CLOSE" : "MENU"}</span>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[#b73540] bg-white px-4 py-3 text-[#292929] shadow-lg lg:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-[#3d3d3d] hover:bg-[#f5f5f5] hover:text-[#d74752]">
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#f0eaea] pt-3">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-full border border-[#d74752] px-4 py-2.5 text-center text-sm font-semibold text-[#d74752]">Login</Link>
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="rounded-full bg-[#d74752] px-4 py-2.5 text-center text-sm font-bold text-white">Explore Courses</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
