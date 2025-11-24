---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 990b33ec874c15a3533c912ef13790574b57a044dd937050d368f227cd4edd1e
---

# file: src/syncs/scheduling.sync.ts

```typescript
import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, Scheduling, CourseCatalog, Friending, Blocking, UserAuthentication } from "@concepts";

// Define Course (Admin)
export const DefineCourseSync: Sync = ({ request, name, events, course }) => ({
  when: actions([
    Requesting.request, 
    { path: "/courses/define", name, events }, 
    { request }
  ]),
  then: actions(
    [CourseCatalog.defineCourse, { name, events }, { course }],
    [Requesting.respond, { request, course }]
  )
});

// Schedule an Event
// Input event is the EventID from CourseCatalog
export const ScheduleEventSync: Sync = ({ request, session, event, user }) => ({
  when: actions([
    Requesting.request, 
    { path: "/schedule/add", session, event }, 
    { request }
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Scheduling.scheduleEvent, { user, event }],
    [Requesting.respond, { request, status: "Event scheduled" }]
  )
});

// View My Schedule
export const ViewMyScheduleSync: Sync = ({ request, session, user, events, results }) => ({
  when: actions([
    Requesting.request, 
    { path: "/schedule/mine", session }, 
    { request }
  ]),
  where: async (frames) => {
    const original = frames[0];
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Scheduling._getUserSchedule, { user }, { events });
    
    // Flatten events array for response or detail expansion
    // Here we just return the list of IDs for simplicity
    if (frames.length === 0) return new Frames({ ...original, [results]: [] });
    
    // Optional: Enrich with course details
    // This would require iterating the events and calling CourseCatalog._getEventInfo
    
    return frames.collectAs([events], results); 
  },
  then: actions([Requesting.respond, { request, results }])
});

/**
 * VIEW FRIEND'S SCHEDULE
 * This enforces the principle: "Mutual friends can see each other's schedules"
 * AND the Blocking principle: "If A blocks B... B cannot see A's information"
 */
export const ViewFriendScheduleSync: Sync = ({ request, session, targetUsername, user, targetUser, events, results, isFriends, isBlocked }) => ({
  when: actions([
    Requesting.request, 
    { path: "/schedule/friend", session, targetUsername }, 
    { request }
  ]),
  where: async (frames) => {
    const original = frames[0];
    
    // 1. Identify Requester
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    
    // 2. Identify Target
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: targetUser });
    
    if (frames.length === 0) return new Frames({ ...original, [results]: { error: "User not found" } });

    // 3. Check Blocking: Is Requester blocked by Target?
    // _isUserBlocked(primary: Target, secondary: Requester)
    frames = await frames.query(Blocking._isUserBlocked, { primaryUser: targetUser, secondaryUser: user }, { result: isBlocked });
    
    // Filter out if blocked
    frames = frames.filter($ => !$.isBlocked);
    if (frames.length === 0) return new Frames({ ...original, [results]: { error: "Access denied" } });

    // 4. Check Friending: Are they friends?
    frames = await frames.query(Friending._areTheyFriends, { user1: user, user2: targetUser }, { areFriends: isFriends });
    
    // Filter out if not friends
    frames = frames.filter($ => $.isFriends);
    if (frames.length === 0) return new Frames({ ...original, [results]: { error: "Not friends" } });

    // 5. Fetch Schedule
    frames = await frames.query(Scheduling._getUserSchedule, { user: targetUser }, { events });

    if (frames.length === 0) return new Frames({ ...original, [results]: [] });

    return frames.collectAs([events], results);
  },
  then: actions([Requesting.respond, { request, results }])
});
```
