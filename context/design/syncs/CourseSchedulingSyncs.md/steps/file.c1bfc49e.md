---
timestamp: 'Sun Nov 23 2025 21:44:44 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251123_214444.eb94106b.md]]'
content_id: c1bfc49e02d23c4dba1f34fff347f33c0b3bb0384a99ed01ebb09c52ea2c5652
---

# file: src/syncs/CourseScheduling.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { CourseCatalog, Requesting, Scheduling, Sessioning } from "@concepts";

/**
 * Sync: GetUserSchedule
 * 
 * Purpose: Allows a user to retrieve their own schedule with full course details.
 * Flow:
 * 1. Request comes in with a session.
 * 2. Resolve session to user.
 * 3. Get event IDs from Scheduling.
 * 4. Get event details from CourseCatalog.
 * 5. Respond with collected results.
 */
export const GetUserSchedule: Sync = ({ request, session, user, event, name, type, times, results }) => ({
  when: actions([
    Requesting.request,
    { path: "/getUserSchedule", session },
    { request },
  ]),
  where: async (frames) => {
    // Preserve the request ID for the response if queries return empty
    const originalFrame = frames[0];

    // 1. Authenticate: Get user from session
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // 2. Get the list of event IDs for this user
    frames = await frames.query(Scheduling._getUserSchedule, { user }, { event });

    // 3. Hydrate event IDs with details from CourseCatalog
    // Note: Spec defines `_getEventInfo`
    frames = await frames.query(CourseCatalog._getEventInfo, { event }, { name, type, times });

    // Handle empty results (user has no schedule or events not found)
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [results]: [] });
    }

    // 4. Collect all resulting rows into a single list
    return frames.collectAs([name, type, times], results);
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
export const CompareSchedules: Sync = ({ request, session, user1, user2, event, name, type, times, results }) => ({
  when: actions([
    Requesting.request,
    // Expect the request body to contain the ID of the user to compare against (user2)
    { path: "/compareSchedules", session, user2 }, 
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];

    // 1. Authenticate: Get the logged-in user (user1)
    frames = await frames.query(Sessioning._getUser, { session }, { user: user1 });

    // 2. Find common events between user1 (session) and user2 (request body)
    frames = await frames.query(Scheduling._getScheduleComparison, { user1, user2 }, { event });

    // 3. Hydrate details
    frames = await frames.query(CourseCatalog._getEventInfo, { event }, { name, type, times });

    // Handle empty intersections
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [results]: [] });
    }

    // 4. Collect results
    return frames.collectAs([name, type, times], results);
  },
  then: actions([
    Requesting.respond,
    { request, results },
  ]),
});
```
