const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getBlogCategories,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const rateLimit = require("../middleware/rateLimit.middleware");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/jwt");
const extra = require("../controllers/blog-extra.controller");
const publicPostLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 8, message: "Too many submissions. Please try again later." });
const seoLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many login attempts. Please try again later." });
const checkBlogRole = checkRole("admin", "seo_admin");

router.post("/seo-login", seoLoginLimiter, (req, res) => {
  const configuredId = (process.env.SEO_PORTAL_LOGIN_ID || "").trim();
  const configuredPassword = process.env.SEO_PORTAL_LOGIN_PASSWORD || "";
  const id = String(req.body?.id || "").trim();
  const password = String(req.body?.password || "");

  if (!configuredId || !configuredPassword) {
    return res.status(503).json({ success: false, message: "SEO portal login is not configured on the server." });
  }

  if (id.toLowerCase() !== configuredId.toLowerCase() || password !== configuredPassword) {
    return res.status(401).json({ success: false, message: "Incorrect login ID or password." });
  }

  const token = jwt.sign(
    { id: "seo_portal", role: "seo_admin", name: "SEO Editor" },
    getJwtSecret(),
    { expiresIn: "8h" }
  );
  return res.json({ success: true, token, user: { id: "seo_portal", role: "seo_admin", name: "SEO Editor" } });
});

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get("/", getBlogs);
router.get("/posts", getBlogs);
router.get("/posts/:slug", getBlogBySlug);
router.get("/categories", getBlogCategories);
router.get("/search", getBlogs);
router.post("/leads", publicPostLimiter, extra.createLead);
router.post("/comments", publicPostLimiter, extra.createComment);
router.post("/analytics", publicPostLimiter, extra.trackEvent);
router.get("/comments/:blogId", extra.listComments);
router.get("/slug/:slug", getBlogBySlug);

// ==========================================
// ADMIN MANAGEMENT ROUTES (Protected)
// ==========================================
router.get("/admin/all", verifyToken, checkBlogRole, getAdminBlogs);
router.get("/admin/comments", verifyToken, checkBlogRole, extra.adminComments);
router.get("/admin/categories", verifyToken, checkBlogRole, extra.categories);
router.post("/admin/categories", verifyToken, checkBlogRole, extra.saveCategory);
router.put("/admin/categories/:id", verifyToken, checkBlogRole, extra.saveCategory);
router.delete("/admin/categories/:id", verifyToken, checkBlogRole, extra.deleteCategory);
router.get("/admin/tags", verifyToken, checkBlogRole, extra.tags);
router.post("/admin/tags", verifyToken, checkBlogRole, extra.saveTag);
router.put("/admin/tags/:id", verifyToken, checkBlogRole, extra.saveTag);
router.delete("/admin/tags/:id", verifyToken, checkBlogRole, extra.deleteTag);
router.get("/admin/redirects", verifyToken, checkBlogRole, extra.redirects);
router.post("/admin/redirects", verifyToken, checkBlogRole, extra.saveRedirect);
router.delete("/admin/redirects/:id", verifyToken, checkBlogRole, extra.deleteRedirect);
router.patch("/admin/comments/:id", verifyToken, checkBlogRole, extra.moderateComment);
router.get("/admin/:id/revisions", verifyToken, checkBlogRole, extra.listRevisions);
router.post("/admin/:id/revisions/:revisionId/rollback", verifyToken, checkBlogRole, extra.rollbackRevision);
router.get("/admin/:id/analytics", verifyToken, checkBlogRole, extra.analytics);
router.post("/", verifyToken, checkBlogRole, createBlog);
router.put("/:id", verifyToken, checkBlogRole, updateBlog);
router.delete("/:id", verifyToken, checkBlogRole, deleteBlog);

// Single slug fallback (must be at the bottom so it doesn't collide with /categories or /admin)
router.get("/:slug", getBlogBySlug);

module.exports = router;
