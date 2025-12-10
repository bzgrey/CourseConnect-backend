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
  "/api/CourseCatalog/_getEventInfo": "this is public information",
  "/api/Grouping/_getGroupName": "this is public information",
  "/api/Grouping/_getGroups": "this is public information",
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
  "/api/UserAuthentication/_getAllUsers",
  "/api/Sessioning/_getUser",
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Scheduling/createSchedule",
  "/api/Scheduling/scheduleEvent",
  "/api/Scheduling/unscheduleEvent",
  "/api/Scheduling/_getUserSchedule",
  "/api/Scheduling/_getUserScheduleByCourses",
  "/api/Scheduling/_getScheduleComparison",
  "/api/CourseCatalog/timeToMinutes",
  "/api/CourseCatalog/defineCourse",
  "/api/CourseCatalog/removeAllCourses",
  "/api/CourseCatalog/removeCourse",
  "/api/CourseCatalog/validateEventTimes",
  "/api/CourseCatalog/createNewCourseAndEvents",
  "/api/CourseCatalog/updateExistingCourseAndEvents",
  // Friending routes handled by syncs
  "/api/Friending/requestFriend",
  "/api/Friending/acceptFriend",
  "/api/Friending/rejectFriend",
  "/api/Friending/removeFriend",
  "/api/Friending/_getAllIncomingFriendRequests",
  "/api/Friending/_getAllOutgoingFriendRequests",
  "/api/Friending/_getAllFriends",
  "/api/Friending/_areTheyFriends",
  "/api/Friending/_canonicalOrder",
  // Blocking routes handled by syncs
  "/api/Blocking/blockUser",
  "/api/Blocking/unblockUser",
  "/api/Blocking/_blockedUsers",
  "/api/Blocking/_isUserBlocked",
  // Grouping routes handled by syncs
  "/api/Grouping/createGroup",
  "/api/Grouping/deleteGroup",
  "/api/Grouping/renameGroup",
  "/api/Grouping/requestToJoin",
  "/api/Grouping/adjustRole",
  "/api/Grouping/removeMember",
  "/api/Grouping/confirmRequest",
  "/api/Grouping/declineRequest",
  "/api/Grouping/_getMembers",
  "/api/Grouping/_getUserGroups",
  "/api/Grouping/_getAdmins",
  "/api/Grouping/_isGroupAdmin",
  "/api/Grouping/_isGroupMember",
  "/api/Grouping/_getGroupRequests",
  "/api/Grouping/_getUserRequests",
  // Preferencing routes
  "/api/Preferencing/addScore",
  "/api/Preferencing/_getScore",
  "/api/Preferencing/removeScore",
  "/api/Preferencing/_getAllItems",
];
