const courseImages = {
  clatUg: "/course-clat-ug.jpg",
  judiciary: "/course-judiciary.jpg",
  clatPg: "/course-clat-pg.jpg",
};

export function getLawCourseImage(course) {
  const identity = `${course?.slug || ""} ${course?.name || ""}`.toLowerCase();
  if (identity.includes("judiciary")) return courseImages.judiciary;
  if (identity.includes("pg")) return courseImages.clatPg;
  return courseImages.clatUg;
}

export default courseImages;
