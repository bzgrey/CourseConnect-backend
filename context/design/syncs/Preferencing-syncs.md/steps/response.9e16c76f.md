---
timestamp: 'Mon Nov 17 2025 23:49:47 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251117_234947.08f5c7be.md]]'
content_id: 9e16c76f6a8b63cdf7e88c6eca5d10cf04391d51e04b5233bc70d3e1c288221f
---

# response:

Excellent. Based on the provided `CourseScheduling` and `Preferencing` concepts, here are three proposed synchronizations that create a powerful, bidirectional link between a user's schedule and their preferences.

The core idea is to treat an `Event` from the `CourseScheduling` concept as an `Item` in the `Preferencing` concept. This allows a user's actions in one system to be intelligently reflected in the other.

***

### Proposed Synchronizations

Here are three synchronizations that link schedule management with preferences:

1. **`AddEventToScheduleOnNewPreference`**: When a user sets a preference for an event, automatically add that event to their schedule if it's not already there. This allows users to build a schedule by "liking" or "prioritizing" specific course sections.
2. **`RemovePreferenceOnEventRemoval`**: When a user removes an event from their schedule, automatically remove any corresponding preference they had for it. This keeps the two concepts consistent.
3. **`UpdatePreferenceOnNewEventAdded`**: Since a user can only have one preference at a time, adding a new event to their schedule will make that new event their primary preference, replacing any old one.

***

### 1. Add Event to Schedule on New Preference

This synchronization allows a user to build their schedule by indicating preferences. If they `addScore` for an `event` that isn't in their schedule, this sync will automatically add it.

A critical assumption here is that we can get the `name` and `type` of an event from the `CourseScheduling` concept. The provided queries don't explicitly offer `_getEventDetails(event)`, so we'll simulate this by querying all courses and finding the event within them. In a real system, adding such a query would be beneficial.

**Specification:**

```sync
sync AddEventToScheduleOnNewPreference
when
    Preferencing.addScore (user, item: event, score)
where
    in CourseScheduling: _getAllCourses() gets courses
    in CourseScheduling: _getCourseDetails(courses) gets course details
    // Logic to find the event in the course details to get its name and type
    in CourseScheduling: _getUserSchedule(user) does not contain the event
then
    CourseScheduling.addEvent (user, event, name, type)
```

**Implementation:**

```typescript
import { actions, Sync, Frames } from "@engine";
import { CourseScheduling, Preferencing, User, Event } from "@concepts";

// Note: This sync is more complex and assumes we can find event details.
// A helper query on the CourseScheduling concept would simplify this greatly.
export const AddEventToScheduleOnNewPreference: Sync = ({ user, event, score, name, type, courses, details, schedule }) => ({
    when: actions(
        [Preferencing.addScore, { user, item: event, score }, {}],
    ),
    where: async (frames) => {
        // First, check if the user even has a schedule. Create one if not.
        // This makes the system more robust, but is omitted for brevity.
        
        // Find the event's name and type by searching all courses.
        let courseFrames = await frames.query(CourseScheduling._getAllCourses, {}, { courses });
        courseFrames = await courseFrames.query(CourseScheduling._getCourseDetails, { courses }, { details });
        
        const enrichedFrames = new Frames();
        for (const frame of courseFrames) {
            const eventId = frame[event];
            for (const detail of frame[details]) {
                const foundLecture = detail.lectures.find(l => l === eventId);
                if (foundLecture) {
                    enrichedFrames.push({ ...frame, [name]: detail.name, [type]: "Lecture" });
                    break;
                }
                const foundRecitation = detail.recitations.find(r => r === eventId);
                if (foundRecitation) {
                    enrichedFrames.push({ ...frame, [name]: detail.name, [type]: "Recitation" });
                    break;
                }
                const foundLab = detail.labs.find(l => l === eventId);
                if (foundLab) {
                    enrichedFrames.push({ ...frame, [name]: detail.name, [type]: "Lab" });
                    break;
                }
            }
        }
        
        if (enrichedFrames.length === 0) return new Frames(); // Event not found in catalog

        // Now, filter out frames where the event is already in the user's schedule.
        const scheduleFrames = await enrichedFrames.query(CourseScheduling._getUserSchedule, { user }, { schedule });

        return scheduleFrames.filter(frame => 
            !frame[schedule].some(scheduledEvent => scheduledEvent.event === frame[event])
        );
    },
    then: actions(
        [CourseScheduling.addEvent, { user, event, name, type }],
    ),
});
```

***

### 2. Remove Preference on Event Removal

This is a straightforward cleanup synchronization. If a user decides they no longer want an event in their schedule, any preference score associated with that specific event should also be cleared.

**Specification:**

```sync
sync RemovePreferenceOnEventRemoval
when
    CourseScheduling.removeEvent (user, event)
where
    in Preferencing: user has a score for item event
then
    Preferencing.removeScore (user, item: event)
```

**Implementation:**

```typescript
import { actions, Sync } from "@engine";
import { CourseScheduling, Preferencing, User, Event } from "@concepts";

export const RemovePreferenceOnEventRemoval: Sync = ({ user, event, items }) => ({
    when: actions(
        [CourseScheduling.removeEvent, { user, event }, {}],
    ),
    where: async (frames) => {
        // Query for the user's currently preferenced item(s).
        frames = await frames.query(Preferencing._getAllItems, { user }, { items });
        
        // Only proceed if the removed event is the one the user had a preference for.
        // The concept says one item, so items should be an array of 0 or 1.
        return frames.filter(frame => frame[items].includes(frame[event]));
    },
    then: actions(
        // The parameter is `item`, but our variable is `event`.
        [Preferencing.removeScore, { user, item: event }],
    ),
});
```

***

### 3. Update Preference on New Event Added

The `Preferencing` concept states that a user can only have a score for one item at a time. This synchronization enforces that principle by making the most recently added schedule event the user's current preference, replacing any previous one.

This requires a sequence of actions: removing the old score (if any) and adding the new one. This is best modeled as two separate synchronizations to maintain declarative purity.

#### 3a. Remove Old Preference

**Specification:**

```sync
sync RemoveOldPreferenceOnNewEvent
when
    CourseScheduling.addEvent (user, event: newEvent)
where
    in Preferencing: _getAllItems(user) gets (items: oldEvent)
    and oldEvent is not equal to newEvent
then
    Preferencing.removeScore (user, item: oldEvent)
```

**Implementation:**

```typescript
import { actions, Sync } from "@engine";
import { CourseScheduling, Preferencing, User, Event } from "@concepts";

export const RemoveOldPreferenceOnNewEvent: Sync = ({ user, newEvent, oldEvent }) => ({
    when: actions(
        [CourseScheduling.addEvent, { user, event: newEvent }, {}],
    ),
    where: async (frames) => {
        // Get the user's currently preferred item, aliased as oldEvent.
        frames = await frames.query(Preferencing._getAllItems, { user }, { items: oldEvent });
        
        // Filter for frames where a preference exists and it's different from the newly added event.
        return frames.filter(frame => 
            frame[oldEvent] && frame[oldEvent].length > 0 && frame[oldEvent][0] !== frame[newEvent]
        );
    },
    then: actions(
        // We need to handle the fact that oldEvent is an array from the query.
        // We assume it contains at most one item as per the concept principle.
        [Preferencing.removeScore, { user, item: (frame) => frame[oldEvent][0] }]
    ),
});
```

#### 3b. Add New Preference

This fires after an event is added, creating the new preference. We give it a default score of `1`. This sync will fire after the `removeScore` from the previous sync, ensuring the `addScore` requirement (user has no current item) is met.

**Specification:**

```sync
sync AddNewPreferenceOnNewEvent
when
    CourseScheduling.addEvent (user, event)
    // Implicitly, after any old preference is removed.
then
    Preferencing.addScore (user, item: event, score: 1)
```

**Implementation:**

```typescript
import { actions, Sync } from "@engine";
import { CourseScheduling, Preferencing, User, Event } from "@concepts";

export const AddNewPreferenceOnNewEvent: Sync = ({ user, event }) => ({
    when: actions(
        [CourseScheduling.addEvent, { user, event }, {}],
        // This sync will wait for the `removeScore` action (if any) from the
        // previous sync to complete before its `then` clause can be checked.
        // The engine handles this causal ordering.
    ),
    // We add a where clause to ensure we don't try to add a score if one already exists for this item.
    where: async (frames) => {
        const { items } = frames.vars();
        frames = await frames.query(Preferencing._getAllItems, { user }, { items });
        return frames.filter(frame => !frame[items].includes(frame[event]));
    },
    then: actions(
        [Preferencing.addScore, { user, item: event, score: 1 }],
    ),
});

```
