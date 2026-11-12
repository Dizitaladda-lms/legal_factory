const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Auto-discover environment variables from any standard location
const envPaths = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// Database initialization
require("./config/db");
require("./services/blog-scheduler.service");

// Middlewares
const rateLimit = require("./middleware/rateLimit.middleware");
const errorHandler = require("./middleware/error.middleware");

// Routes
const activityRoutes = require("./routes/activity.routes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/ai.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const authRoutes = require("./routes/auth.routes");
const blogRoutes = require("./routes/blog.routes");
const blogSeoRoutes = require("./routes/blog-seo.routes");
const certificateRoutes = require("./routes/certificate.routes");
const courseRoutes = require("./routes/course.routes");
const doubtRoutes = require("./routes/doubt.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const lectureRoutes = require("./routes/lecture.routes");
const lawCourseRoutes = require("./routes/law-course.routes");
const paymentRoutes = require("./routes/payment.routes");
const progressRoutes = require("./routes/progress.routes");
const quizRoutes = require("./routes/quiz.routes");
const sectionRoutes = require("./routes/section.routes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Production Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        frameSrc: ["'self'", "https://www.youtube-nocookie.com", "https://player.vimeo.com"],
        mediaSrc: ["'self'", "https:"],
      },
    },
  })
);

// CORS configuration
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://tsg-ecru.vercel.app",
  "https://tsg-lms-lac.vercel.app",
  "https://tsg-qlb1.onrender.com",
  "https://www.nidads.com",
  "https://nidads.com",
  "https://www.nigape.com",
  "https://nigape.com",
  "https://dizitaladda.com",
  "https://www.dizitaladda.com",
];

const envAllowed = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowed]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      // Allow explicitly whitelisted origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all Vercel deployment previews (*.vercel.app) for this project
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsers
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again after a minute.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many login/register attempts. Please try again after 15 minutes.",
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);

// Frontend SPA dist path
const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");

// Root & Health check
app.get("/", (req, res) => {
  if (fs.existsSync(path.join(frontendDist, "index.html"))) {
    return res.sendFile(path.join(frontendDist, "index.html"));
  }
  res.json({
    success: true,
    message: "Dizital Adda LMS Production API is operational 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    database: {
      configured: require("./config/db").hasConfiguredDatabase(),
      connected: require("./config/db").isPostgres(),
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
app.use("/api/activity", activityRoutes);
app.use("/api/admin/analytics", adminDashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog", blogRoutes);
// Crawlers receive post-specific HTML metadata and a no-JS article rendering.
app.use(blogSeoRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/law-courses", lawCourseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/user", userRoutes);

// Serve compiled frontend SPA dynamically
app.use(express.static(frontendDist, {
  maxAge: "1y",
  immutable: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
  },
}));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    const indexPath = path.join(frontendDist, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// 404 Route Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
