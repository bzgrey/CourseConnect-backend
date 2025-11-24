---
timestamp: 'Sun Nov 23 2025 21:20:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251123_212017.9c3c2991.md]]'
content_id: 93b739b53577ed778ccc159d54a2f2272408d1b1492fcb273cb4a937a5b25ab2
---

# file: src/syncs/scheduling.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Scheduling, Sessioning } from "@concepts";

// ==========================================
// createSchedule
// ==========================================

export const CreateScheduleRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/createSchedule", session },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate user via session
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Scheduling.createSchedule, { user }],
  ),
});

export const CreateScheduleResponse: Sync = (
  { request, schedule, error },
) => ({
  when: actions(
    [Requesting.request, { path: "/Scheduling/createSchedule" }, { request }],
    // Matches either success (schedule) or error
    [Scheduling.createSchedule, {}, { schedule, error }],
  ),
  then: actions(
    [Requesting.respond, { request, schedule, error }],
  ),
});

// ==========================================
// scheduleEvent
// ==========================================

export const ScheduleEventRequest: Sync = (
  { request, session, user, event },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/scheduleEvent", session, event },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Scheduling.scheduleEvent, { user, event }],
  ),
});

export const ScheduleEventResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Scheduling/scheduleEvent" }, { request }],
    // Note: Success returns empty dictionary, failure returns {error}
    [Scheduling.scheduleEvent, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error, status: "ok" }],
  ),
});

// ==========================================
// unscheduleEvent
// ==========================================

export const UnscheduleEventRequest: Sync = (
  { request, session, user, event },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/unscheduleEvent", session, event },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Scheduling.unscheduleEvent, { user, event }],
  ),
});

export const UnscheduleEventResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Scheduling/unscheduleEvent" }, { request }],
    [Scheduling.unscheduleEvent, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error, status: "ok" }],
  ),
});

// ==========================================
// Queries
// ==========================================

export const GetUserScheduleRequest: Sync = (
  { request, session, user, events },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/getUserSchedule", session },
    { request },
  ]),
  where: async (frames) => {
    // 1. Get user from session
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    // 2. Query schedule
    // The query returns [{ events: [...] }], so `events` will bind to the array
    return await frames.query(Scheduling._getUserSchedule, { user }, {
      events,
    });
  },
  then: actions(
    [Requesting.respond, { request, events }],
  ),
});

export const GetScheduleComparisonRequest: Sync = (
  { request, session, user, otherUser, events },
) => ({
  when: actions([
    // Request must include the ID of the user to compare against
    Requesting.request,
    { path: "/Scheduling/compareSchedules", session, otherUser },
    { request },
  ]),
  where: async (frames) => {
    // 1. Get current user
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    // 2. Compare current user with otherUser
    return await frames.query(
      Scheduling._getScheduleComparison,
      { user1: user, user2: otherUser },
      { events },
    );
  },
  then: actions(
    [Requesting.respond, { request, events }],
  ),
});
```
