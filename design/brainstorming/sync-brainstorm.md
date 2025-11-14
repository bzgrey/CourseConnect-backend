
[@implementing-synchronizations](../background/implementing-synchronizations.md)
[@spec](../concepts/CourseRegistering/spec.md)
[@spec](../concepts/Ranking/spec.md)

# prompt: create basic ("pseudo code") syncs for Ranking and CourseRegistering that are user-facing, i.e. when some request happens where Sessioning._getUser(session) associated with current user then call the concept's actions. Then, provide example syncs that connnect CourseRegistering with Ranking. For example if CourseRegistering had a removeCourse action then when that happens all associated Rankings should be removed too

# response:

Of course. Here are the basic "pseudo-code" syncs followed by their full TypeScript implementations, illustrating both user-facing request handling and direct inter-concept communication.

First, let's imagine the relevant actions and queries for our concepts:

*   **`CourseRegistering`**
    *   `actions`:
        *   `addCourse(user, courseId)`: Registers a user for a course.
        *   `removeCourse(courseId)`: Removes a course entirely (and thus all registrations).
    *   `queries`:
        *   `_getRegistrationsForUser(user)`: Gets all course registrations for a user.
*   **`Ranking`**
    *   `actions`:
        *   `setRank(user, courseId, rank)`: Sets a user's rank for a specific course.
        *   `delete(rank)`: Deletes a specific ranking record.
    *   `queries`:
        *   `_getRanksByCourse(courseId)`: Gets all ranking records associated with a course.

---

### 1. Pseudo-Code Synchronizations

This section outlines the logic of the synchronizations in the simplified `sync` format.

#### User-Facing Syncs

These synchronizations handle HTTP requests from a user to perform actions.

```sync
// User requests to register for a course
sync RegisterForCourseRequest
when
    Requesting.request (path: "/courses/register", session, courseId) : (request)
where
    in Sessioning: _getUser(session) gets user
then
    CourseRegistering.addCourse (user, courseId)

// User requests to rank a course
sync SetCourseRankRequest
when
    Requesting.request (path: "/courses/rank", session, courseId, rank) : (request)
where
    in Sessioning: _getUser(session) gets user
then
    Ranking.setRank (user, courseId, rank)

// Generic success response for both actions above
sync ActionSuccessResponse
when
    // This will match either of the requests above
    Requesting.request (path: "/courses/register" or "/courses/rank") : (request)
    // And it will match either of the resulting actions
    CourseRegistering.addCourse () : (registration) or Ranking.setRank () : (ranking)
then
    // Respond with a success status
    Requesting.respond (request, status: "success")
```

#### Inter-Concept Syncs

This synchronization connects two concepts directly, without any user request. It acts as a cleanup mechanism.

```sync
// When a course is removed from the registration system,
// ensure all associated rankings are also deleted.
sync CleanupRanksOnCourseRemoval
when
    CourseRegistering.removeCourse (courseId) : ()
where
    // Find all ranking records for that course
    in Ranking: rank has courseId
then
    // Delete each ranking record found
    Ranking.delete (rank)
```

---

### 2. TypeScript Implementation

Here is the full implementation of the pseudo-code syncs using the TypeScript DSL.

#### User-Facing Syncs (`src/syncs/user_requests.sync.ts`)

These syncs wire up HTTP endpoints to concept actions.

```typescript
import { actions, Sync } from "@engine";
import { CourseRegistering, Ranking, Requesting, Sessioning } from "@concepts";

// Handles the request to register for a course
export const RegisterForCourseRequest: Sync = ({ request, session, user, courseId }) => ({
  when: actions([
    Requesting.request,
    { path: "/courses/register", session, courseId },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    CourseRegistering.addCourse, { user, courseId }
  ]),
});

// Handles the request to rank a course
export const SetCourseRankRequest: Sync = ({ request, session, user, courseId, rank }) => ({
  when: actions([
    Requesting.request,
    { path: "/courses/rank", session, courseId, rank },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    Ranking.setRank, { user, courseId, rank }
  ]),
});

// A single sync to handle successful responses for both actions
export const ActionSuccessResponse: Sync = ({ request, registration, ranking }) => ({
  when: actions(
    // Note: We don't care about the input pattern for the request, only the path and output
    [Requesting.request, { path: "/courses/register" }, { request }],
    // The second action pattern will match if a registration record is returned
    [CourseRegistering.addCourse, {}, { registration }],
  ),
  then: actions([
    Requesting.respond, { request, status: "success", body: registration }
  ]),
});

export const RankSuccessResponse: Sync = ({ request, ranking }) => ({
    when: actions(
      [Requesting.request, { path: "/courses/rank" }, { request }],
      // This will match if a ranking record is returned
      [Ranking.setRank, {}, { ranking }],
    ),
    then: actions([
      Requesting.respond, { request, status: "success", body: ranking }
    ]),
  });
```

#### Inter-Concept Syncs (`src/syncs/cleanup.sync.ts`)

This synchronization demonstrates how concepts can react to the actions of other concepts, creating powerful, emergent behaviors.

```typescript
import { actions, Sync } from "@engine";
import { CourseRegistering, Ranking } from "@concepts";

/**
 * When a course is removed from the CourseRegistering concept, this sync
 * ensures that all associated rankings for that course are also deleted.
 * This maintains data integrity across concepts.
 */
export const CleanupRanksOnCourseRemoval: Sync = ({ courseId, rank }) => ({
  // This sync triggers when ANY CourseRegistering.removeCourse action happens.
  when: actions(
    [CourseRegistering.removeCourse, { courseId }, {}],
  ),
  // The where clause finds all the rankings that need to be deleted.
  where: async (frames) => {
    // For each frame (in this case, just one containing the courseId),
    // query the Ranking concept to find all associated ranking records.
    // This will expand the frames: if there are 3 ranks for the course,
    // we will now have 3 frames, each with a different 'rank' binding.
    return await frames.query(Ranking._getRanksByCourse, { courseId }, { rank });
  },
  // The then clause runs ONCE for EACH frame returned by the 'where' clause.
  then: actions(
    // This action will be called for every rank found in the previous step.
    [Ranking.delete, { rank }],
  ),
});
```

This final example, `CleanupRanksOnCourseRemoval`, perfectly illustrates the power of the `Frames` system. A single `removeCourse` event is expanded in the `where` clause into multiple frames—one for each ranking that needs to be deleted. The `then` clause then automatically iterates through these frames, firing a `Ranking.delete` action for each one, ensuring the system state remains consistent.