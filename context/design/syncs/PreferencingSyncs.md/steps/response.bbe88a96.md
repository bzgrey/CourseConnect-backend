---
timestamp: 'Tue Dec 02 2025 11:13:08 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251202_111308.082083c8.md]]'
content_id: bbe88a96afb6db991c3a199c16691c50237740f02e679674e7123146c04b3786
---

# response:

Here is the implementation for `preferencing.sync.ts`.

This file includes the synchronizations where **Preferencing** is a key actor. It includes the logic to clean up preferences when schedules change, a rule to apply default preferences, and the requested modification to the schedule retrieval request to include preference data (performing a "left join" in the `where` clause).

```typescript
import { actions, Sync, Frames } from "@engine";
import { Preferencing, Scheduling, Requesting, Sessioning, CourseScheduling } from "@concepts";

// ------------------------------------------------------------------
// 1. Data Integrity: Cleaning up preferences
// ------------------------------------------------------------------

export const RemovePreferenceOnEventRemoval: Sync = ({ user, event, score }) => ({
  when: actions(
    // Trigger: User removes an event from their schedule
    [Scheduling.unscheduleEvent, { user, event }, {}]
  ),
  where: async (frames) => {
    // Check if the user actually has a score for this event.
    // If _getScore returns nothing (empty array), the sync stops here.
    return await frames.query(Preferencing._getScore, { user, item: event }, { score });
  },
  then: actions(
    // Effect: Remove the dangling preference score
    [Preferencing.removeScore, { user, item: event }]
  ),
});

export const ClearPreferencesOnScheduleDeletion: Sync = ({ user, item }) => ({
  when: actions(
    // Trigger: User deletes their entire schedule (or CourseScheduling equivalent)
    [CourseScheduling.deleteSchedule, { user }, {}]
  ),
  where: async (frames) => {
    // Retrieve ALL items this user has preferences for.
    // This query returns an array of items, creating one frame per item.
    return await frames.query(Preferencing._getAllItems, { user }, { item });
  },
  then: actions(
    // Effect: Fires once per item found in the where clause
    [Preferencing.removeScore, { user, item }]
  ),
});

// ------------------------------------------------------------------
// 2. Business Logic: Default Preferences
// ------------------------------------------------------------------

export const AddDefaultPreferenceOnEventAddition: Sync = ({ user, event }) => ({
  when: actions(
    // Trigger: User adds a new event
    [Scheduling.scheduleEvent, { user, event }, {}]
  ),
  where: async (frames) => {
    // Check if the user has ANY existing preferences.
    // We bind the result to a temporary variable 'existingItems'.
    frames = await frames.query(Preferencing._getAllItems, { user }, { existingItems: "existingItems" });
    
    // Logic: We only proceed if the list of existing items is empty.
    // This implies this is the user's first interaction or they cleared their prefs.
    return frames.filter((frame) => {
      const items = frame["existingItems"] as any[];
      return items.length === 0;
    });
  },
  then: actions(
    // Effect: Set a neutral score (0) for this new event
    [Preferencing.addScore, { user, item: event, score: 0 }]
  ),
});

// ------------------------------------------------------------------
// 3. Request Handling: Get Schedule with Preferences
// ------------------------------------------------------------------

export const GetScheduleWithPreferencesRequest: Sync = ({ 
  request, session, user, event, score, results 
}) => ({
  when: actions(
    // Trigger: HTTP Request to view schedule
    [Requesting.request, { path: "/my-schedule", session }, { request }]
  ),
  where: async (frames) => {
    // 1. Resolve User
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // 2. Get the User's Schedule (Generates one frame per event)
    frames = await frames.query(Scheduling._getUserSchedule, { user }, { event });

    // 3. "Left Join" Preferencing
    // We cannot simply use .query(Preferencing._getScore) here because if a user
    // hasn't scored an event, the query returns empty, and the frame (the event) 
    // would be filtered out. We want to keep the event and set score to null.
    
    const augmentedFrames: any[] = [];

    for (const frame of frames) {
      // Create a temporary single-frame set to query with
      const tempFrame = new Frames(frame);
      const scoreResult = await tempFrame.query(Preferencing._getScore, { user, item: frame[event] }, { score });

      if (scoreResult.length > 0) {
        // If score exists, push the frame containing the score
        augmentedFrames.push(scoreResult[0]);
      } else {
        // If no score exists, keep the original frame and bind score to null
        augmentedFrames.push({ ...frame, [score]: null });
      }
    }

    // Wrap our manually constructed array back into a Frames object
    frames = new Frames(...augmentedFrames);

    // 4. Collect results into a single object for the response
    return frames.collectAs([event, score], results);
  },
  then: actions(
    [Requesting.respond, { request, results }]
  ),
});
```
