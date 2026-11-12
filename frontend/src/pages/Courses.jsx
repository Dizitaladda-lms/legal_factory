import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";
import CourseCard from "../components/course/CourseCard";
import BatchesHeader from "../components/batches/BatchesHeader";
import BatchesFooter from "../components/batches/BatchesFooter";

function Courses() {

  const [courses, setCourses] = useState([]);

  const [search, setSearch] = useState("");

  const fetchCourses = async () => {
    try {
      const response = await api.get("/api/courses");
      setCourses(response.data?.courses || response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* 1. STICKY HEADER */}
      <BatchesHeader brandName="Legal Factory" />

      {/* HERO */}
      <div className="bg-[#0F172A] py-20 px-6 border-b border-slate-800">

        <div className="max-w-7xl mx-auto">

          <h1 className="text-7xl font-bold text-white leading-tight">

            Explore <br />

            Professional Courses

          </h1>

          <p className="text-slate-300 text-xl mt-8 max-w-2xl leading-9">

            Learn industry-ready skills from modern courses
            designed to help students build successful careers.

          </p>

          {/* SEARCH */}

          <div className="mt-12 relative w-full max-w-2xl">

            <input
              type="text"
              placeholder="Search your favorite course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-8 py-5 rounded-2xl outline-none text-lg bg-white shadow-2xl text-slate-800 placeholder:text-slate-400"
            />

            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-900 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition">

              Search

            </button>

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8 -mt-12 px-6">

        <div className="bg-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-slate-500 text-lg">

            Total Courses

          </h2>

          <p className="text-5xl font-bold mt-4">

            {courses.length}+

          </p>

        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-slate-500 text-lg">

            Active Students

          </h2>

          <p className="text-5xl font-bold mt-4">

            15K+

          </p>

        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-slate-500 text-lg">

            Certificates

          </h2>

          <p className="text-5xl font-bold mt-4">

            8K+

          </p>

        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-slate-500 text-lg">

            Placement Rate

          </h2>

          <p className="text-5xl font-bold mt-4">

            92%

          </p>

        </div>

      </div>

      {/* COURSES */}

      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-5xl font-bold text-slate-800">

              Trending Courses

            </h1>

            <p className="text-slate-500 mt-4 text-lg">

              Upgrade your skills with our top programs.

            </p>

          </div>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

      </div>

      {/* FOOTER */}
      <BatchesFooter brandName="Legal Factory" />
    </div>
  );
}

export default Courses;
