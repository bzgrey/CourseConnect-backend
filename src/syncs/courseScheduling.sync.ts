import { actions, Frames, Sync } from "@engine";
import {
  CourseCatalog,
  Preferencing,
  Requesting,
  Scheduling,
  Sessioning,
} from "@concepts";

/**
 * Sync: GetUserSchedule
 *
 * Purpose: Allows a user to retrieve a schedule with full course details and preferences.
 *
 * Flow:
 * 1. Request comes in with a session and target user.
 * 2. Resolve session to currentUser.
 * 3. Get event IDs from Scheduling.
 * 4. Get event details from CourseCatalog.
 * 5. Get preference scores from Preferencing (left join - null if no score).
 * 6. Respond with collected results.
 */
export const GetUserSchedule: Sync = (
  {
    request,
    session,
    currentUser,
    targetUser,
    event,
    course,
    name,
    type,
    times,
    score,
    results,
  },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/_getUserSchedule", targetUser, session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];

    // 1. Authenticate: Get user from session
    frames = await frames.query(Sessioning._getUser, { session }, {
      currentUser,
    });

    if (frames.length === 0) {
      return new Frames({
        ...originalFrame,
        [results]: { error: "Unauthorized" },
      });
    }

    const userFrame = frames[0];

    // 2. Get the list of event IDs for target user
    frames = await new Frames(userFrame).query(Scheduling._getUserSchedule, {
      user: originalFrame[targetUser],
    }, {
      event,
    });

    // 3. Hydrate event IDs with details from CourseCatalog (including course ID)
    frames = await frames.query(CourseCatalog._getEventInfo, {
      event,
    }, {
      event,
      course,
      name,
      type,
      times,
    });

    // 4. Left join with preferences - manually preserve frames without scores
    const augmentedFrames: any[] = [];
    for (const frame of frames) {
      const scoreFrames = await new Frames(frame).query(
        Preferencing._getScore,
        {
          user: originalFrame[targetUser],
          item: frame[course],
        },
        { score },
      );

      if (scoreFrames.length > 0) {
        // Merge the score into the existing frame
        augmentedFrames.push({ ...frame, [score]: scoreFrames[0][score] });
      } else {
        // No score found
        augmentedFrames.push({ ...frame, [score]: null });
      }
    }

    frames = new Frames(...augmentedFrames);

    // Handle empty results (user has no schedule or events not found)
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [results]: [] });
    }

    // 5. Collect all events into a single array
    const allEvents = frames.map((frame) => ({
      event: frame[event],
      name: frame[name],
      type: frame[type],
      times: frame[times],
      score: frame[score],
    }));

    return new Frames({ ...originalFrame, [results]: allEvents });
  },
  then: actions([
    Requesting.respond,
    { request, results },
  ]),
});

/**
 * Sync: CompareSchedules
 *
 * Purpose: Compare the logged-in user's schedule with another user's schedule.
 * Flow:
 * 1. Request comes in with session (user1) and the target user ID (user2).
 * 2. Resolve session to user1.
 * 3. Get intersecting event IDs.
 * 4. Get event details.
 * 5. Respond.
 */
export const CompareSchedules: Sync = (
  {
    request,
    session,
    user1,
    user2,
    event,
    course,
    name,
    type,
    times,
    score,
    results,
  },
) => ({
  when: actions([
    Requesting.request,
    // Expect the request body to contain the ID of the user to compare against (user2)
    { path: "/Scheduling/_compareSchedules", session, user2 },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];

    // 1. Authenticate: Get the logged-in user (user1)
    frames = await frames.query(Sessioning._getUser, { session }, {
      user: user1,
    });

    // 2. Find common events between user1 (session) and user2 (request body)
    frames = await frames.query(Scheduling._getScheduleComparison, {
      user1,
      user2,
    }, { event });

    // 3. Hydrate details with course ID
    frames = await frames.query(CourseCatalog._getEventInfo, {
      event,
    }, {
      course,
      name,
      type,
      times,
    });

    // 4. Left join with preferences for user1 - manually preserve frames without scores
    const augmentedFrames: any[] = [];
    for (const frame of frames) {
      const scoreFrames = await new Frames(frame).query(
        Preferencing._getScore,
        {
          user: originalFrame[user1],
          item: frame[course],
        },
        { score },
      );

      if (scoreFrames.length > 0) {
        // Merge the score into the existing frame
        augmentedFrames.push({ ...frame, [score]: scoreFrames[0][score] });
      } else {
        // No score found
        augmentedFrames.push({ ...frame, [score]: null });
      }
    }

    frames = new Frames(...augmentedFrames);

    // Handle empty intersections
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [results]: [] });
    }

    // 5. Collect all events into a single array
    const allEvents = frames.map((frame) => ({
      event: frame[event],
      name: frame[name],
      type: frame[type],
      times: frame[times],
      score: frame[score],
    }));

    return new Frames({ ...originalFrame, [results]: allEvents });
  },
  then: actions([
    Requesting.respond,
    { request, results },
  ]),
});
