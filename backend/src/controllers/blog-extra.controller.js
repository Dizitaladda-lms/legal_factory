const pool = require("../config/db");

const cleanText = (value, max = 2000) => String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
const getDb = () => pool.getRealPool?.();

exports.createLead = async (req, res, next) => {
  try {
    const name = cleanText(req.body.name, 160);
    const phone = cleanText(req.body.phone, 40);
    const email = cleanText(req.body.email, 255).toLowerCase();
    const blogId = Number(req.body.blog_id) || null;
    const resourceId = Number(req.body.resource_id) || null;
    if (!name || !/^\+?[0-9 ()-]{7,20}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a name, valid phone number, and email address." });
    }
    const db = getDb();
    if (!db) return res.status(503).json({ success: false, message: "Lead capture is temporarily unavailable." });
    const saved = await db.query("INSERT INTO blog_leads(blog_id,name,phone,email,resource_id) VALUES($1,$2,$3,$4,$5) RETURNING id", [blogId, name, phone, email, resourceId]);
    if (blogId) await db.query("INSERT INTO blog_analytics(blog_id,event) VALUES($1,'lead')", [blogId]);
    res.status(201).json({ success: true, leadId: saved.rows[0].id });
  } catch (error) { next(error); }
};

exports.createCourseInquiry = async (req, res, next) => {
  try {
    const name = cleanText(req.body.name, 160);
    const phone = cleanText(req.body.phone, 40);
    const course = cleanText(req.body.course_interest, 80);
    const source = cleanText(req.body.source, 40) || "homepage";
    const validCourses = ["CLAT UG", "Judiciary", "CLAT PG", "Not sure yet"];
    if (!name || !/^\+?[0-9 ()-]{7,20}$/.test(phone) || !validCourses.includes(course)) {
      return res.status(400).json({ success: false, message: "Enter your name, a valid phone number, and select a course." });
    }
    const db = getDb();
    if (!db) return res.status(503).json({ success: false, message: "Enquiry service is temporarily unavailable." });
    const saved = await db.query(
      "INSERT INTO course_inquiries(name,phone,course_interest,source) VALUES($1,$2,$3,$4) RETURNING id",
      [name, phone, course, source]
    );
    res.status(201).json({ success: true, inquiryId: saved.rows[0].id });
  } catch (error) { next(error); }
};

exports.createComment = async (req, res, next) => {
  try {
    const blogId = Number(req.body.blog_id);
    const name = cleanText(req.body.name, 160);
    const email = cleanText(req.body.email, 255).toLowerCase();
    const body = cleanText(req.body.body, 3000);
    if (!blogId || !name || !body || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Complete all fields with a valid email." });
    const db = getDb();
    if (!db) return res.status(503).json({ success: false, message: "Questions are temporarily unavailable." });
    const saved = await db.query("INSERT INTO blog_comments(blog_id,name,email,body) VALUES($1,$2,$3,$4) RETURNING id", [blogId, name, email, body]);
    res.status(201).json({ success: true, message: "Your question was submitted for review.", id: saved.rows[0].id });
  } catch (error) { next(error); }
};

exports.listComments = async (req, res, next) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, comments: [] });
    const comments = await db.query("SELECT id,blog_id,name,body,status,created_at FROM blog_comments WHERE status='approved' AND blog_id=$1 ORDER BY created_at DESC", [Number(req.params.blogId)]);
    res.json({ success: true, comments: comments.rows });
  } catch (error) { next(error); }
};

exports.moderateComment = async (req, res, next) => {
  try {
    const status = req.body.status;
    if (!["approved", "rejected", "pending"].includes(status)) return res.status(400).json({ success: false, message: "Invalid moderation status." });
    const db = getDb();
    if (!db) return res.status(503).json({ success: false, message: "Database unavailable." });
    const result = await db.query("UPDATE blog_comments SET status=$1 WHERE id=$2 RETURNING id,status", [status, Number(req.params.id)]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Comment not found." });
    res.json({ success: true, comment: result.rows[0] });
  } catch (error) { next(error); }
};

exports.adminComments = async (_req, res, next) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, comments: [] });
    const result = await db.query("SELECT c.*, b.title AS post_title FROM blog_comments c JOIN blogs b ON b.id=c.blog_id ORDER BY c.created_at DESC LIMIT 250");
    res.json({ success: true, comments: result.rows });
  } catch (error) { next(error); }
};

exports.analytics = async (req, res, next) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, events: [] });
    const result = await db.query("SELECT event,COUNT(*)::int AS count,COALESCE(SUM(value),0)::numeric AS total FROM blog_analytics WHERE blog_id=$1 GROUP BY event ORDER BY event", [Number(req.params.id)]);
    res.json({ success: true, events: result.rows });
  } catch (error) { next(error); }
};

exports.trackEvent = async (req, res, next) => {
  try {
    const blogId = Number(req.body.blog_id);
    const event = String(req.body.event || "");
    if (!blogId || !["view", "cta_click", "resource_click", "time_on_page"].includes(event)) return res.status(400).json({ success: false, message: "Invalid analytics event." });
    const value = Math.max(1, Math.min(3600, Number(req.body.value) || 1));
    const db = getDb();
    if (db) await db.query("INSERT INTO blog_analytics(blog_id,event,value) VALUES($1,$2,$3)", [blogId, event, value]);
    res.status(202).json({ success: true });
  } catch (error) { next(error); }
};

exports.listRevisions = async (req, res, next) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, revisions: [] });
    const result = await db.query("SELECT id,blog_id,revision,created_at FROM blog_revisions WHERE blog_id=$1 ORDER BY created_at DESC LIMIT 50", [Number(req.params.id)]);
    res.json({ success: true, revisions: result.rows });
  } catch (error) { next(error); }
};

exports.rollbackRevision = async (req, res, next) => {
  try {
    const db = getDb();
    if (!db) return res.status(503).json({ success: false, message: "Database unavailable." });
    const result = await db.query("SELECT revision FROM blog_revisions WHERE id=$1 AND blog_id=$2", [Number(req.params.revisionId), Number(req.params.id)]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ success: false, message: "Revision not found." });
    await db.query("INSERT INTO blog_revisions(blog_id,revision) SELECT id,to_jsonb(b) FROM blogs b WHERE id=$1", [Number(req.params.id)]);
    const revision = row.revision;
    const restored = await db.query(`UPDATE blogs SET title=$1,slug=$2,category=$3,meta_title=$4,meta_description=$5,
      keywords=$6,author_name=$7,author_role=$8,featured_image=$9,summary=$10,content=$11,faqs=$12,tags=$13,
      updated_at=CURRENT_TIMESTAMP WHERE id=$14 RETURNING *`, [revision.title, revision.slug, revision.category, revision.meta_title,
      revision.meta_description, revision.keywords, revision.author_name, revision.author_role, revision.featured_image,
      revision.summary, revision.content, JSON.stringify(revision.faqs || []), revision.tags || [], Number(req.params.id)]);
    res.json({ success: true, blog: restored.rows[0] });
  } catch (error) { next(error); }
};

const slug = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
exports.categories = async (_req, res, next) => {
  try { const db = getDb(); const rows = db ? await db.query("SELECT * FROM blog_categories ORDER BY name") : { rows: [] }; res.json({ success: true, categories: rows.rows }); }
  catch (error) { next(error); }
};
exports.saveCategory = async (req, res, next) => {
  try {
    const db = getDb(); const name = cleanText(req.body.name, 120); const key = slug(req.body.slug || name);
    if (!db || !name || !key) return res.status(400).json({ success: false, message: "A category name is required." });
    const row = req.params.id
      ? await db.query("UPDATE blog_categories SET name=$1,slug=$2,description=$3 WHERE id=$4 RETURNING *", [name,key,cleanText(req.body.description,1000),Number(req.params.id)])
      : await db.query("INSERT INTO blog_categories(name,slug,description) VALUES($1,$2,$3) RETURNING *", [name,key,cleanText(req.body.description,1000)]);
    res.status(req.params.id ? 200 : 201).json({ success: true, category: row.rows[0] });
  } catch (error) { next(error); }
};
exports.deleteCategory = async (req, res, next) => {
  try { const db = getDb(); if (!db) return res.status(503).json({ success: false, message: "Database unavailable." }); await db.query("DELETE FROM blog_categories WHERE id=$1", [Number(req.params.id)]); res.json({ success: true }); }
  catch (error) { next(error); }
};
exports.tags = async (_req, res, next) => {
  try { const db = getDb(); const rows = db ? await db.query("SELECT * FROM blog_tags ORDER BY name") : { rows: [] }; res.json({ success: true, tags: rows.rows }); }
  catch (error) { next(error); }
};
exports.saveTag = async (req, res, next) => {
  try {
    const db = getDb(); const name = cleanText(req.body.name, 100); const key = slug(req.body.slug || name);
    if (!db || !name || !key) return res.status(400).json({ success: false, message: "A tag name is required." });
    const row = req.params.id ? await db.query("UPDATE blog_tags SET name=$1,slug=$2 WHERE id=$3 RETURNING *", [name,key,Number(req.params.id)]) : await db.query("INSERT INTO blog_tags(name,slug) VALUES($1,$2) RETURNING *", [name,key]);
    res.status(req.params.id ? 200 : 201).json({ success: true, tag: row.rows[0] });
  } catch (error) { next(error); }
};
exports.deleteTag = async (req, res, next) => {
  try { const db = getDb(); if (!db) return res.status(503).json({ success: false, message: "Database unavailable." }); await db.query("DELETE FROM blog_tags WHERE id=$1", [Number(req.params.id)]); res.json({ success: true }); }
  catch (error) { next(error); }
};
exports.redirects = async (_req, res, next) => {
  try { const db = getDb(); const rows = db ? await db.query("SELECT * FROM blog_redirects ORDER BY created_at DESC LIMIT 500") : { rows: [] }; res.json({ success: true, redirects: rows.rows }); }
  catch (error) { next(error); }
};
exports.saveRedirect = async (req, res, next) => {
  try {
    const db = getDb(); const oldSlug = slug(req.body.old_slug); const newSlug = slug(req.body.new_slug);
    if (!db || !oldSlug || !newSlug || oldSlug === newSlug) return res.status(400).json({ success: false, message: "Provide distinct old and new slugs." });
    const result = await db.query("INSERT INTO blog_redirects(old_slug,new_slug) VALUES($1,$2) ON CONFLICT(old_slug) DO UPDATE SET new_slug=EXCLUDED.new_slug RETURNING *", [oldSlug,newSlug]);
    res.status(201).json({ success: true, redirect: result.rows[0] });
  } catch (error) { next(error); }
};
exports.deleteRedirect = async (req, res, next) => {
  try { const db = getDb(); if (!db) return res.status(503).json({ success: false, message: "Database unavailable." }); await db.query("DELETE FROM blog_redirects WHERE id=$1", [Number(req.params.id)]); res.json({ success: true }); }
  catch (error) { next(error); }
};
