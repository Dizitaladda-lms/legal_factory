const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Public, read-only course catalog. Only published courses and their content
// are returned; the private DATABASE_URL remains inside the backend.
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT slug, name, description, batch_start_date, language,
              duration_label, price_amount, price_currency, created_at
       FROM public.law_courses
       WHERE is_published = true
       ORDER BY created_at ASC, name ASC`
    );
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, courses: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const courseResult = await pool.query(
      `SELECT id, slug, name, description, batch_start_date, language,
              duration_label, price_amount, price_currency, discount_label,
              enrollment_url, demo_url, refund_policy_summary, refund_policy_url,
              class_schedule, course_validity, learning_mode, hero_image_url
       FROM public.law_courses
       WHERE slug = $1 AND is_published = true
       LIMIT 1`,
      [req.params.slug]
    );

    if (!courseResult.rows.length) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const course = courseResult.rows[0];
    const [benefits, modules, moduleItems, tests, faculty] = await Promise.all([
      pool.query(
        `SELECT title, description, icon, position
         FROM public.law_course_benefits WHERE course_id = $1 ORDER BY position ASC`,
        [course.id]
      ),
      pool.query(
        `SELECT id, title, description, position
         FROM public.law_course_modules WHERE course_id = $1 ORDER BY position ASC`,
        [course.id]
      ),
      pool.query(
        `SELECT i.module_id, i.title, i.position
         FROM public.law_module_items i
         JOIN public.law_course_modules m ON m.id = i.module_id
         WHERE m.course_id = $1 ORDER BY i.position ASC`,
        [course.id]
      ),
      pool.query(
        `SELECT title, description, icon, position
         FROM public.law_course_tests WHERE course_id = $1 ORDER BY position ASC`,
        [course.id]
      ),
      pool.query(
        `SELECT name, qualification, photo_url, position
         FROM public.law_course_faculty WHERE course_id = $1 ORDER BY position ASC`,
        [course.id]
      ),
    ]);

    const itemsByModule = new Map();
    for (const item of moduleItems.rows) {
      const items = itemsByModule.get(item.module_id) || [];
      items.push({ title: item.title, position: item.position });
      itemsByModule.set(item.module_id, items);
    }

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({
      success: true,
      course: {
        ...course,
        course_benefits: benefits.rows,
        course_modules: modules.rows.map((module) => ({
          ...module,
          module_items: itemsByModule.get(module.id) || [],
        })),
        course_tests: tests.rows,
        course_faculty: faculty.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
