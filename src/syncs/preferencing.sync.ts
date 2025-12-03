import { actions, Frames, Sync } from "@engine";
import {
  CourseCatalog,
  Preferencing,
  Requesting,
  Scheduling,
  Sessioning,
} from "@concepts";

// ------------------------------------------------------------------
// Data Integrity: Ensure scores are only added for scheduled courses
// ------------------------------------------------------------------

/**
 * Sync: AddScoreToScheduledCourse
 *
 * Purpose: Ensures users can only add/update preference scores for courses they have scheduled.
 *
 * Flow:
 * 1. User makes a request to add a score
 * 2. Authenticate the user
 * 3. Check that the course (item) is in the user's schedule
 * 4. If the course is scheduled, add or update the score
 */
export const AddScoreToScheduledCourse: Sync = (
  { request, course, session, user, item, score },
) => ({
  when: actions(
    [Requesting.request, {
      path: "/Preferencing/addScore",
      session,
      item,
      score,
    }, { request }],
  ),
  where: async (frames) => {
    // Authenticate user
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // Get all courses in the user's schedule
    frames = await frames.query(
      Scheduling._getUserScheduleByCourses,
      { user },
      { course },
    );

    // Filter to only frames where the course matches the item they're trying to score
    // If the item is not in the schedule, this returns empty and the sync fails
    frames = frames.filter(($) => $[course] === $[item]);
    if (frames.length === 0) {
      return new Frames();
    }
    return frames;
  },
  then: actions(
    [Preferencing.addScore, { user, item, score }],
  ),
});

export const AddScoreResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Preferencing/addScore" }, { request }],
    [Preferencing.addScore, {}, {}],
  ),
  then: actions(
    [Requesting.respond, { request }],
  ),
});

export const AddScoreResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Preferencing/addScore" }, { request }],
    [Preferencing.addScore, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

export const AddScoreValidationError: Sync = (
  { request, session, user, item, course, error },
) => ({
  when: actions(
    [Requesting.request, { path: "/Preferencing/addScore", session, item }, {
      request,
    }],
  ),
  where: async (frames) => {
    const originalFrame = frames[0];

    // Authenticate user
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    if (frames.length === 0) {
      return new Frames({
        ...originalFrame,
        [error]: "Unauthorized",
      });
    }

    // Get all courses in the user's schedule
    frames = await frames.query(
      Scheduling._getUserScheduleByCourses,
      { user },
      { course },
    );

    // Check if the item is NOT in the schedule
    frames = frames.filter(($) => $[course] === $[item]);

    if (frames.length === 0) {
      // Item not in schedule - return error frame
      return new Frames({
        ...originalFrame,
        [error]: "Item not in user's schedule",
      });
    }

    // Item IS in schedule - don't fire this sync
    return new Frames();
  },
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

// ------------------------------------------------------------------
// Data Integrity: Cleaning up preferences
// ------------------------------------------------------------------

/**
 * Sync: RemoveScoreRequest
 *
 * Purpose: Allow users to manually remove a preference score for a course.
 *
 * Flow:
 * 1. User makes a request to remove a score
 * 2. Authenticate the user
 * 3. Remove the score
 * 4. Respond to the request
 */
export const RemoveScoreRequest: Sync = (
  { request, session, user, item, score },
) => ({
  when: actions(
    [Requesting.request, {
      path: "/Preferencing/removeScore",
      session,
      item,
    }, { request }],
  ),
  where: async (frames) => {
    // Authenticate user
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions(
    [Preferencing.removeScore, { user, item }],
  ),
});

export const RemoveScoreResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Preferencing/removeScore" }, { request }],
    [Preferencing.removeScore, {}, {}],
  ),
  then: actions(
    [Requesting.respond, { request }],
  ),
});

export const RemoveScoreResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Preferencing/removeScore" }, { request }],
    [Preferencing.removeScore, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

/**
 * Sync: GetAllItemsRequest
 *
 * Purpose: Allow users to retrieve all items they have scored.
 *
 * Flow:
 * 1. User makes a request to get all their scored items
 * 2. Authenticate the user
 * 3. Query for all items the user has scored
 * 4. Respond with the results
 */
export const GetAllItemsRequest: Sync = (
  { request, session, user, item, results },
) => ({
  when: actions(
    [Requesting.request, {
      path: "/Preferencing/_getAllItems",
      session,
    }, { request }],
  ),
  where: async (frames) => {
    const originalFrame = frames[0];

    // Authenticate user
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    if (frames.length === 0) {
      return new Frames({
        ...originalFrame,
        [results]: { error: "Unauthorized" },
      });
    }

    // Get all items the user has scored
    frames = await frames.query(Preferencing._getAllItems, { user }, { item });

    // Collect all items into a single array
    const allItems = frames.map((frame) => frame[item]);

    return new Frames({ ...originalFrame, [results]: allItems });
  },
  then: actions(
    [Requesting.respond, { request, results }],
  ),
});

// UNNECESSARY BECAUSE COURSE IDS ARE STATIC SO USER CAN ADD BACK
// COURSE AND CHOOSE TO CHANGE THE PREVIOUSLY STORED SCORE
// /**
//  * Sync: RemovePreferenceOnEventRemoval
//  *
//  * Purpose: Automatically remove preference scores when the last event of a course is unscheduled.
//  *
//  * Flow:
//  * 1. User unschedules an event
//  * 2. Determine which course the event belongs to
//  * 3. Check if any other events from that course remain in the schedule
//  * 4. If no events from that course remain, remove the preference score for that course
//  */
// export const RemovePreferenceOnEventRemoval: Sync = (
//   { user, event, course, session, remainingEvent },
// ) => ({
//   when: actions(
//     [Requesting.request, {
//       path: "/Scheduling/unscheduleEvent",
//       session,
//       event,
//     }, {}],
//     [Scheduling.unscheduleEvent, { user, event }, {}],
//   ),
//   where: async (frames) => {
//     // Get the course ID for the unscheduled event
//     frames = await frames.query(
//       Scheduling._getUserSchedule,
//       { user },
//       { event: remainingEvent },
//     );

//     // For each remaining event, get its course ID
//     const courseFrames = await frames.query(
//       Scheduling._getUserSchedule,
//       { user },
//       { event: remainingEvent },
//     );

//     // Check if any remaining events belong to the same course
//     // If none do, remove the preference
//     const originalFrame = frames[0];

//     // Get all remaining events in user's schedule
//     const scheduleFrames = await new Frames(originalFrame).query(
//       Scheduling._getUserSchedule,
//       { user: originalFrame[user] },
//       { event: remainingEvent },
//     );

//     // Get course IDs for all remaining events
//     const remainingCourses = new Set();
//     for (const frame of scheduleFrames) {
//       const eventInfo = await new Frames(frame).query(
//         CourseCatalog._getEventInfoWithCourse,
//         { event: frame[remainingEvent] },
//         { course },
//       );
//       if (eventInfo.length > 0) {
//         remainingCourses.add(eventInfo[0][course]);
//       }
//     }

//     // Get the course of the event that was just removed
//     const removedEventInfo = await new Frames(originalFrame).query(
//       CourseCatalog._getEventInfoWithCourse,
//       { event: originalFrame[event] },
//       { course },
//     );

//     if (removedEventInfo.length === 0) {
//       return new Frames();
//     }

//     const removedCourse = removedEventInfo[0][course];

//     // If the course still has events in the schedule, don't remove preference
//     if (remainingCourses.has(removedCourse)) {
//       return new Frames();
//     }

//     // Course no longer in schedule - check if there's a preference to remove
//     const preferenceFrames = await new Frames({
//       ...originalFrame,
//       [course]: removedCourse,
//     }).query(
//       Preferencing._getScore,
//       { user: originalFrame[user], item: removedCourse },
//       {},
//     );

//     if (preferenceFrames.length === 0) {
//       return new Frames();
//     }

//     return new Frames({ ...originalFrame, [course]: removedCourse });
//   },
//   then: actions(
//     [Preferencing.removeScore, { user, item: course }],
//   ),
// });
