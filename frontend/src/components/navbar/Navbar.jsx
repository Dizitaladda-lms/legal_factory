import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4" aria-label="Main navigation">
        <Link to="/" className="text-xl font-bold text-slate-900">Legal <span className="text-red-700">Factory</span></Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link to="/courses" className="hover:text-red-700">Courses</Link>
          <Link to="/faculty" className="hover:text-red-700">Faculty</Link>
          <Link to="/about" className="hover:text-red-700">About</Link>
          <Link to="/blogs" className="hover:text-red-700">Resources</Link>
          <Link to="/login" className="rounded-full bg-red-700 px-5 py-2.5 text-white hover:bg-red-800">Login</Link>
        </div>
      </nav>
    </header>
  );
}
