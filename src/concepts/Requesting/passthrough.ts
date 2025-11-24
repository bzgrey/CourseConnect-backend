/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Feel free to delete these example inclusions
  "/api/CourseCatalog/_getAllCourses": "this is public information",
  "/api/CourseCatalog/_getCourseInfo": "this is public information",
  "/api/CourseCatalog/_getAllCourses": "this is public information",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Feel free to delete these example exclusions
  "/api/UserAuthentication/register",
  "/api/UserAuthentication/login",
  "/api/UserAuthentication/logout",
  "/api/UserAuthentication/_getUserByUsername",
  "/api/UserAuthentication/_getUsername",
  "/api/Sessioning/_getUser",
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Scheduling/createSchedule",
  "/api/Scheduling/scheduleEvent",
  "/api/Scheduling/unscheduleEvent",
  "/api/Scheduling/_getUserSchedule",
  "/api/Scheduling/_getScheduleComparison",
  "/api/CourseCatalog/timeToMinutes",
  // Friending routes handled by syncs
  "/api/Friending/requestFriend",
  "/api/Friending/acceptFriend",
  "/api/Friending/rejectFriend",
];
