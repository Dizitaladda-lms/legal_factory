import { Routes, Route, Navigate } from "react-router-dom";

import PopularCourses from "./components/PopularCourses";
import About from "./pages/About";
import LandingPage from "./pages/landing/LandingPage";
import Login from "./pages/auth/Login";
import Courses from "./pages/Courses";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import CoursesPage from "./pages/admin/CoursesPage";
import StudentsPage from "./pages/admin/StudentsPage";
import RevenuePage from "./pages/admin/RevenuePage";
import UsersPage from "./pages/admin/UsersPage";
import AddCourse from "./pages/admin/AddCourse";
import ActivityPage from "./pages/admin/ActivityPage";
import AdminContentManager from "./pages/admin/AdminContentManager";

import LearningPage from "./pages/student/LearningPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentProfile from "./pages/admin/StudentProfile";
import TeacherProfile from "./pages/admin/TeacherProfile";
import Teachers from "./pages/admin/Teachers";
import AddTeacher from "./pages/admin/AddTeacher";
import EditCourse from "./pages/admin/EditCourse";
import Payments from "./pages/admin/Payments";
import Assignments from "./pages/teacher/Assignments";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";
import MyCourses from "./pages/teacher/MyCourses";
import UploadLecture from "./pages/teacher/UploadLecture";
import CourseDetails from "./pages/course/CourseDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import GovernmentPartners from "./pages/GovernmentPartners";
import Academic from "./pages/Academic";
import Entrance from "./pages/Entrance";
import Competition from "./pages/Competition";
import Skilling from "./pages/Skilling";
import Placement from "./pages/Placement";
import AddStudent from "./pages/admin/AddStudent";
import CourseListing from "./pages/CourseListing";
import Checkout from "./pages/Checkout";
import AdminCertificates from "./pages/admin/AdminCertificates";
import VerifyCertificate from "./pages/VerifyCertificate";
import BlogListing from "./pages/blog/BlogListing";
import BlogDetail from "./pages/blog/BlogDetail";
import FacultyPage from "./pages/FacultyPage";
import SeoPortal from "./pages/admin/SeoPortal";
import React, { Suspense, lazy } from "react";
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/faculty" element={<FacultyPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/post/seo" element={<SeoPortal />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/courses" element={<CourseListing />} />
      <Route path="/ca/batches" element={<CourseListing />} />
      <Route path="/ca/:level/batches" element={<CourseListing />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/ca/:level/batches/:slug" element={<CourseDetails />} />
      <Route path="/ca/batches/:slug" element={<CourseDetails />} />
      <Route path="/cs/:level/batches/:slug" element={<CourseDetails />} />
      <Route path="/cs/batches/:slug" element={<CourseDetails />} />
      <Route path="/popular" element={<PopularCourses />} />
      <Route path="/government-partners" element={<GovernmentPartners />} />
      <Route path="/academic" element={<Academic />} />
      <Route path="/entrance" element={<Entrance />} />
      <Route path="/competition" element={<Competition />} />
      <Route path="/skilling" element={<Skilling />} />
      <Route path="/placement" element={<Placement />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
      <Route path="/verify-email" element={<Navigate to="/checkout" replace />} />
      <Route path="/blogs" element={<BlogListing />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/blog/:category/:slug" element={<BlogDetail />} />

      {/* ================= STUDENT / ENROLLED ROUTES ================= */}
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:id"
        element={
          <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
            <LearningPage />
          </ProtectedRoute>
        }
      />

      {/* ================= TEACHER ROUTES ================= */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute allowedRoles={["teacher", "admin"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute allowedRoles={["teacher", "admin"]}>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-lecture"
        element={
          <ProtectedRoute allowedRoles={["teacher", "admin"]}>
            <UploadLecture />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/certificates"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCertificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content-manager"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminContentManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content-manager/:courseId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminContentManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-course"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit-course"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit-course/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-student"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-teacher"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TeacherProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/revenue"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <RevenuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ActivityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Assignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/blogs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading Blog Portal...</div>}>
              <AdminBlogs />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
