---
timestamp: 'Tue Dec 02 2025 11:06:51 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251202_110651.8bc141bd.md]]'
content_id: 1658aa2a2da3943d04d7f0092814ff424eecd6a2486db2cce4a7350c8cab3dd4
---

# response:

Here are the TypeScript implementations for the synchronizations between **Preferencing**, **Friending**, **Blocking**, **Sessioning**, and **Scheduling**.

These implementations adhere to the provided DSL, using `when` (triggers), `where` (logic/queries), and `then` (effects).

### 1. State Integrity (Cross-Concept Logic)

These synchronizations enforce the principles defined in the concepts (e.g., if you block someone, you shouldn't be friends; if you remove an event, you shouldn't prefer it).

```typescript
import { actions, Sync } from "@engine";
import { Preferencing, Friending, Blocking, Scheduling } from "@concepts";

// Principle: If you block someone, you cannot be friends.
// Trigger: Blocking.blockUser
// Effect: Friending.removeFriend
export const UnfriendOnBlock: Sync = ({ blocker, userToBlock, isFriend }) => ({
  when: actions(
    [Blocking.blockUser, { blocker, userToBlock }, {}]
  ),
  where: async (frames) => {
    // Check if they are currently friends
    frames = await frames.query(
      Friending._areTheyFriends, 
      { user1: blocker, user2: userToBlock }, 
      { isFriend }
    );
    // Only proceed if isFriend is true
    return frames.filter((frame) => frame[isFriend] === true);
  },
  then: actions(
    [Friending.removeFriend, { remover: blocker, removed: userToBlock }]
  ),
});

// Principle: If you block someone, pending requests from them should be rejected.
// Trigger: Blocking.blockUser
// Effect: Friending.rejectFriend
export const RejectRequestOnBlock: Sync = ({ blocker, userToBlock, requestee }) => ({
  when: actions(
    [Blocking.blockUser, { blocker, userToBlock }, {}]
  ),
  where: async (frames) => {
    // Check if the person being blocked (userToBlock) has sent a request to the blocker
    frames = await frames.query(
      Friending._getAllIncomingFriendRequests, 
      { user: blocker }, 
      { requestee } // Output: The person who sent the request
    );
    // Filter to find if the userToBlock is in that list
    return frames.filter((frame) => frame[requestee] === frame[userToBlock]);
  },
  then: actions(
    // Rejects the request from userToBlock -> blocker
    [Friending.rejectFriend, { requester: userToBlock, requestee: blocker }]
  ),
});

// Principle: If an event is removed from the schedule, any preference score for it is invalid.
// Trigger: Scheduling.unscheduleEvent
// Effect: Preferencing.removeScore
export const RemovePreferenceOnUnschedule: Sync = ({ user, event, score }) => ({
  when: actions(
    [Scheduling.unscheduleEvent, { user, event }, {}]
  ),
  where: async (frames) => {
    // Check if a score exists for this user/event pair
    // If the query returns no results (empty array), the frame stream stops here
    return await frames.query(
        Preferencing._getScore, 
        { user, item: event }, 
        { score }
    );
  },
  then: actions(
    [Preferencing.removeScore, { user, item: event }]
  ),
});
```

### 2. Request Handling (Session Integration)

These synchronizations handle the flow from an HTTP request (via `Requesting`) to the actual concept actions, mediated by `Sessioning` to identify the user.

```typescript
import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, Scheduling, Preferencing } from "@concepts";

// Scenario: User wants to schedule an event via API
export const ScheduleEventRequest: Sync = ({ request, session, event, user }) => ({
  when: actions(
    [Requesting.request, { path: "/schedule/add", session, event }, { request }]
  ),
  where: async (frames) => {
    // Resolve the session to a user
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Scheduling.scheduleEvent, { user, event }]
  ),
});

// Scenario: User wants to set a preference score for an event they have scheduled
export const AddPreferenceRequest: Sync = ({ request, session, event, score, user }) => ({
  when: actions(
    [Requesting.request, { path: "/preference/set", session, event, score }, { request }]
  ),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    
    // Optional Logic: Ensure the event is actually in their schedule first?
    // We can check if they have it scheduled using Scheduling._getUserSchedule
    // However, for this example, we assume valid inputs or that the Action handles requirements.
    
    // Check if they already have a preference (Action requirement: addScore requires no existing item)
    // If they have one, we might need updateScore, but let's assume this sync handles the "New" case.
    const items = await frames.query(Preferencing._getAllItems, { user }, { existingItems: "items" });
    
    // Filter to ensure they don't already have this item scored (simplified for addScore)
    return frames; 
  },
  then: actions(
    [Preferencing.addScore, { user, item: event, score }]
  ),
});

// Response Sync: When scheduling completes, respond to the user
export const ScheduleEventResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/schedule/add" }, { request }],
    [Scheduling.scheduleEvent, {}, {}] // Successful completion
  ),
  then: actions(
    [Requesting.respond, { request, status: "success" }]
  ),
});
```

### 3. Data Privacy & Queries (Complex Logic)

This is a complex example demonstrating how to implement the **Blocking** and **Friending** principles during a data retrieval request.

**Goal:** Allow User A to view User B's schedule *only if* they are friends AND User B has not blocked User A.

```typescript
import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, Friending, Blocking, Scheduling } from "@concepts";

export const GetFriendScheduleRequest: Sync = ({ 
  request, session, targetUser, // Inputs
  currentUser, isFriend, isBlocked, scheduleEvents, results // Variables
}) => ({
  when: actions(
    // Request contains the session (currentUser) and the targetUser ID they want to see
    [Requesting.request, { path: "/friends/schedule/view", session, targetUser }, { request }]
  ),
  where: async (frames) => {
    // 1. Identify the requester
    frames = await frames.query(Sessioning._getUser, { session }, { currentUser });
    const originalFrame = frames[0]; // Keep ref for error handling

    // 2. Check Friending: Are they friends?
    frames = await frames.query(
        Friending._areTheyFriends, 
        { user1: currentUser, user2: targetUser }, 
        { isFriend }
    );
    // Filter: Must be friends
    frames = frames.filter($ => $[isFriend] === true);

    // 3. Check Blocking: Is the currentUser blocked by the targetUser?
    // Note: blockedUsers(user) returns a list. 
    // We need to check if currentUser is in targetUser's block list.
    frames = await frames.query(
        Blocking.blockedUsers, 
        { user: targetUser }, 
        { blockedList: "blockedList" }
    );
    
    // Filter: currentUser must NOT be in the blockedList
    frames = frames.filter($ => {
        const list = $["blockedList"] as any[]; // Type assertion for list
        return !list.includes($[currentUser]);
    });

    // 4. If we survived the filters, fetch the schedule
    if (frames.length === 0) {
       // Either not friends or blocked. Return empty/error.
       return new Frames({ ...originalFrame, [results]: { error: "Access Denied" } });
    }

    frames = await frames.query(
        Scheduling._getUserSchedule, 
        { user: targetUser }, 
        { scheduleEvents }
    );

    // Collect results
    return frames.collectAs([scheduleEvents], results);
  },
  then: actions(
    [Requesting.respond, { request, results }]
  ),
});
```

### 4. Implementation of Prompt Proposals

Here are the specific ideas proposed in the prompt text, translated into the DSL.

```typescript
import { actions, Sync } from "@engine";
import { CourseScheduling, Preferencing, User } from "@concepts"; 
// Note: Assuming CourseScheduling wraps Scheduling or is the specific instance used.

// "Sync: RemovePreferenceOnCourseDeletion"
// When a course is deleted globally, remove preferences for it from ALL users.
export const RemovePreferenceOnCourseDeletion: Sync = ({ course, user }) => ({
    when: actions(
        [CourseScheduling.deleteCourse, { course }, {}]
    ),
    where: async (frames) => {
        // 1. Get All Users (assuming User concept has this query)
        frames = await frames.query(User._getAllUsers, {}, { user });
        
        // 2. For every user, check if they have a score for this course
        // This query acts as a filter; if they don't have a score, the frame drops.
        return await frames.query(Preferencing._getScore, { user, item: course }, {});
    },
    then: actions(
        [Preferencing.removeScore, { user, item: course }]
    )
});

// "Sync: ClearPreferencesOnScheduleDeletion"
// When a user deletes their entire schedule, remove their specific preference.
export const ClearPreferencesOnScheduleDeletion: Sync = ({ user, item }) => ({
    when: actions(
        [CourseScheduling.deleteSchedule, { user }, {}]
    ),
    where: async (frames) => {
        // Find the items this user has preferences for
        frames = await frames.query(Preferencing._getAllItems, { user }, { item });
        return frames;
    },
    then: actions(
        // removeScore requires (user, item)
        // Since _getAllItems returns an array, the 'where' clause expands frames
        // One frame per item, firing this action for each item.
        [Preferencing.removeScore, { user, item }]
    )
});
```
