---
timestamp: 'Sun Nov 23 2025 21:21:25 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251123_212125.9f87f3f7.md]]'
content_id: 2c2b1b242cd92f6088306ac8efab34a0f37dec788d69a7b7f8458c6ece125d38
---

# file: src/syncs/Scheduling.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Scheduling, Sessioning } from "@concepts";

/**
 * Handle request to create a schedule.
 * Authenticates the user via the provided session before creating the schedule.
 */
export const CreateScheduleRequest: Sync = ({ request, session, user, schedule }) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/createSchedule", session },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate: Resolve session to user. 
    // If session is invalid, query returns empty, frames become empty, sync stops.
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    // Create the schedule for the authenticated user
    [Scheduling.createSchedule, { user }, { schedule }],
    // Respond with the new schedule ID
    [Requesting.respond, { request, schedule }],
  ),
});

/**
 * Handle request to schedule an event.
 * Authenticates the user via the session, then adds the event to their schedule.
 */
export const ScheduleEventRequest: Sync = ({ request, session, event, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/scheduleEvent", session, event },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    // Perform the scheduling action
    [Scheduling.scheduleEvent, { user, event }],
    // Respond to acknowledge success
    [Requesting.respond, { request }],
  ),
});

/**
 * Handle request to unschedule an event.
 * Authenticates the user via the session, then removes the event from their schedule.
 */
export const UnscheduleEventRequest: Sync = ({ request, session, event, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Scheduling/unscheduleEvent", session, event },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    // Perform the unscheduling action
    [Scheduling.unscheduleEvent, { user, event }],
    // Respond to acknowledge success
    [Requesting.respond, { request }],
  ),
});
```
