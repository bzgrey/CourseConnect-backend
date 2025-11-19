[@concept-design-overview](../../background/concept-design-overview.md)
[@concept-specifications](../../background/concept-specifications.md)
[@ProblemFraming](../../FunctionalDesign/ProblemFraming.md)
# concept: Ranking

- **concept**: Ranking [Item]
- **purpose**: To maintain an ordered list of items based on an associated numerical score.
- **principle**: If the score associated with an item is set or updated, then that item's position in the ordered list is adjusted, allowing for the retrieval of items sorted by score.
- **state**:
    - A set of `Items` with
        - a `score` of type `Number`
- **actions**:
    - `setScore (item: Item, score: Number)`
        - **requires**: `score` must be a valid number.
        - **effects**: Assigns or updates the score for the given item. If the item is not yet in the set, it is added.
    - `removeItem (item: Item)`
        - **requires**: The item must exist in the ranking.
        - **effects**: Removes the item and its associated score from the ranking.


[@sync-CourseRegistration_Ranking_brainstorm](../../brainstorming/sync-CourseRegistration_Ranking_brainstorm.md)

# prompt: Based on the syncs, add a query section of actions to the concept spec above
# response:

Of course. Based on the synchronizations created, especially the `CleanupRanksOnCourseRemoval` sync, we can infer the necessary query for the `Ranking` concept.

To make the concept fully consistent with the syncs, I will first update its definition slightly to reflect the more detailed actions (`setRank` with a user, `delete` with a rank object) and then add the `queries` section.

***

### Updated Concept: Ranking

The original `Ranking` concept was very generic. The syncs imply a more detailed structure where a `User` ranks an `Item`. Here is an updated specification that is more robust and directly supports the queries needed by our synchronizations.

*   **concept**: Ranking \[User, Item]
*   **purpose**: To allow users to assign a numerical rank to specific items.
*   **principle**: A user can assign or update a numerical rank for an item. These ranks can be retrieved or removed. When an item is removed from another system, its associated ranks should also be removed.
*   **state**:
    *   A set of `Ranks`, where each `Rank` has:
        *   a `user` of type `User`
        *   an `item` of type `Item`
        *   a `rankValue` of type `Number`
*   **actions**:
    *   `setRank (user: User, item: Item, rank: Number)`
        *   **requires**: `rank` must be a valid number.
        *   **effects**: Creates a new `Rank` record linking the user and item with the given rank. If a rank from that user for that item already exists, it is updated.
        *   **returns**: `(rank: Rank)` — The created or updated rank record/identifier.
    *   `delete (rank: Rank)`
        *   **requires**: The `Rank` record must exist.
        *   **effects**: Removes the specified `Rank` record from the state.
*   **queries**:
    *   `_getRanksByCourse (courseId: Item): (rank: Rank)`
        *   **purpose**: To find all rank records associated with a specific item (in this context, a course). This is crucial for cleanup operations.
        *   **inputs**: `courseId` - The identifier of the item to look up.
        *   **outputs**: `rank` - Zero or more `Rank` record identifiers associated with the given `courseId`.

### Rationale for the Query

The query `_getRanksByCourse` is directly derived from the `where` clause of the `CleanupRanksOnCourseRemoval` synchronization:

```typescript
// From the sync's `where` clause:
where: async (frames) => {
    return await frames.query(Ranking._getRanksByCourse, { courseId }, { rank });
},
```

This line of code explicitly calls a query on the `Ranking` concept with the following characteristics:

1.  **Name**: `Ranking._getRanksByCourse`. The underscore prefix is a common convention for queries intended for internal, inter-concept communication rather than direct user exposure.
2.  **Input Pattern**: `{ courseId }`. This tells us the query function expects a single input parameter named `courseId` (which we map to the generic `Item` type in the concept spec).
3.  **Output Pattern**: `{ rank }`. This indicates that the query returns a set of results, and for each result, the value is bound to a variable named `rank`. In the concept spec, this corresponds to the `Rank` record/identifier.

# prompt: only one ranking associated with a course at a time

# response:

Excellent question. This is a great example of how a change in requirements directly translates into a change in a concept's definition and, consequently, its interactions.

The constraint "only one ranking associated with a course at a time" fundamentally changes the `Ranking` concept. It's no longer about *users* ranking items, but about items having a single, canonical rank or score.

Here is the revised concept specification, followed by the updated synchronizations that use it.

***

### Revised Concept: Ranking

This version removes the `User` parameter and simplifies the state to enforce that any given `Item` can only have one score. This aligns perfectly with the original `Ranking` concept provided in the documentation.

*   **concept**: Ranking \[Item]
*   **purpose**: To maintain an ordered list of items, where each item has a single, canonical numerical score.
*   **principle**: An item can be assigned a score. If a score is set or updated for an item, its position in any ordered retrieval is adjusted. An item can only have one score at a time.
*   **state**:
    *   A mapping from `Item` to its `score` of type `Number`.
    *   **Note**: This state structure naturally enforces the one-to-one relationship. You cannot have two different scores for the same `Item`.
*   **actions**:
    *   `setScore (item: Item, score: Number)`
        *   **requires**: `score` must be a valid number.
        *   **effects**: Assigns or updates the score for the given item. If the item is not yet in the ranking, it is added.
        *   **returns**: `(item: Item, score: Number)` — The item and its new score.
    *   `removeItem (item: Item)`
        *   **requires**: The item must exist in the ranking.
        *   **effects**: Removes the item and its associated score from the ranking.
*   **queries**:
    *   `_findRankedItem (item: Item): (item: Item)`
        *   **purpose**: To determine if a specific item exists within the ranking system (i.e., has a score). This is used for cleanup to find the item that needs to be removed.
        *   **inputs**: `item` - The identifier of the item to look up.
        *   **outputs**: `item` - The identifier of the item *if it was found*. Returns zero or one result.

***

### Revised Synchronizations

With the new, simpler `Ranking` concept, the synchronizations that interact with it also become simpler and more direct.

#### Revised User-Facing Syncs (`src/syncs/user_requests.sync.ts`)

The request to set a score no longer needs to look up the user, as the `Ranking` concept doesn't care who is setting the score.

```typescript
import { actions, Sync } from "@engine";
import { Ranking, Requesting } from "@concepts";

// Handles the request to set or update a course's rank/score.
// NOTE: We've removed Sessioning and the 'user' variable, as they are no longer
// required by the Ranking.setScore action. Authorization could be handled
// in a separate sync if needed (e.g., checking if a user is an admin).
export const SetCourseScoreRequest: Sync = ({ request, courseId, score }) => ({
  when: actions([
    Requesting.request,
    { path: "/courses/score", courseId, score },
    { request },
  ]),
  // No 'where' clause is needed to look up the user.
  then: actions([
    Ranking.setScore, { item: courseId, score }
  ]),
});

// A success response for the setScore action.
export const ScoreSuccessResponse: Sync = ({ request, item, score }) => ({
    when: actions(
      [Requesting.request, { path: "/courses/score" }, { request }],
      [Ranking.setScore, {}, { item, score }],
    ),
    then: actions([
      Requesting.respond, { request, status: "success", body: { item, score } }
    ]),
  });
```

#### Revised Inter-Concept Syncs (`src/syncs/cleanup.sync.ts`)

This synchronization is now simpler. Instead of finding *many* user-specific ranks to delete, it finds *at most one* ranked item and removes it.

```typescript
import { actions, Sync } from "@engine";
import { CourseRegistering, Ranking } from "@concepts";

/**
 * When a course is removed, this sync ensures its single, canonical
 * score is also removed from the Ranking concept.
 */
export const CleanupScoreOnCourseRemoval: Sync = ({ courseId }) => ({
  // The trigger remains the same: a course is removed.
  when: actions(
    [CourseRegistering.removeCourse, { courseId }, {}],
  ),
  // The where clause now finds the single item to be removed.
  where: async (frames) => {
    // We query to see if this 'courseId' exists as a ranked 'item'.
    // This will return either one frame (if found) or zero frames (if not).
    // The input parameter is `item` and we pass `courseId`.
    // The output is also `item`, which we can ignore as we already have courseId.
    return await frames.query(Ranking._findRankedItem, { item: courseId }, { item: courseId });
  },
  // The 'then' clause will run at most once.
  then: actions(
    // We call the new 'removeItem' action, passing the courseId.
    [Ranking.removeItem, { item: courseId }],
  ),
});
```

By modifying the `Ranking` concept to directly enforce the business rule, the entire system becomes cleaner. The synchronizations are simpler to write and understand because they no longer need to handle a one-to-many relationship, reflecting the new one-to-one reality.

# prompt: what about queries about the ranking
# response:

Of course. This is a crucial part of the design. A ranking concept isn't useful unless you can query the results.

Adding queries allows other parts of the system—and end-users via API requests—to retrieve the ranked list, see the top items, or check a specific item's score.

Here is the updated `Ranking` concept specification, now including a robust set of queries, followed by examples of how they would be used in synchronizations.

***

### Updated Concept: Ranking (with Queries)

* **concept**: Ranking \[User, Item]
* **purpose**: To maintain an ordered list of items, where each item has a single, canonical numerical score.
* **principle**: An item can be assigned a score. If a score is set or updated for an item, its position in any ordered retrieval is adjusted. An item can only have one score at a time.
* **state**:
	 * A set of `Ranks` with
        *   a `user` of type `User`
        *   an `item` of type `Item`
        *   a score of type `Number`
* **actions**:
  * `setScore (item: Item, score: Number)`
    * **requires**: `score` must be a valid number.
    * **effects**: Assigns or updates the score for the given item.
  * `removeItem (item: Item)`
    * **requires**: The item must exist in the ranking.
    * **effects**: Removes the item and its associated score.
* **queries**:
  * `_findRankedItem (item: Item): (item: Item)`
    * **purpose**: To determine if a specific item exists within the ranking system.
    * **inputs**: `item` - The identifier of the item to look up.
    * **outputs**: `item` - The identifier of the item if found.
  * `_getScoreForItem (item: Item): (score: Number)`
    * **purpose**: To retrieve the specific score for a single item.
    * **inputs**: `item` - The identifier of the item to look up.
    * **outputs**: `score` - The numerical score of the item. Returns at most one result.
 *  `_getAllRanks(): (` 

***

### Example Synchronizations Using the New Queries

These syncs show how to build API endpoints that expose the ranking data to users.

#### 1. Get the Top 5 Courses (Leaderboard)

This sync creates an API endpoint like `/leaderboard` that returns the top-ranked courses.

**Pseudo-Code:**

```sync
sync GetLeaderboard
when
    Requesting.request (path: "/leaderboard", count: 5) : (request)
where
    // Use the new query to get the top 5 items from the Ranking concept
    in Ranking: _getTopItems(count) gets (item, score)
    // Collect all the results into a single list
    results is collection of { item, score }
then
    // Respond to the original request with the list of results
    Requesting.respond (request, results)
```

**TypeScript Implementation (`src/syncs/leaderboard.sync.ts`):**

```typescript
import { actions, Sync } from "@engine";
import { Ranking, Requesting } from "@concepts";

/**
 * Handles a request to /leaderboard and returns the top-ranked items.
 * Demonstrates using a query and the `collectAs` helper to format a response.
 */
export const GetLeaderboard: Sync = ({ request, count, item, score, results }) => ({
  when: actions([
    // This could also be written to extract 'count' from the request if it's a query param
    Requesting.request, { path: "/leaderboard", count: 5 }, { request }
  ]),
  where: async (frames) => {
    // 1. Query the Ranking concept for the top items. This will create
    // multiple frames, one for each top-ranked item found.
    frames = await frames.query(Ranking._getTopItems, { count }, { item, score });
    
    // 2. Use `collectAs` to gather the `item` and `score` from all frames
    // into a single array named `results` in a single final frame.
    return frames.collectAs([item, score], results);
  },
  then: actions([
    // 3. Respond to the request with the collected results.
    Requesting.respond, { request, results }
  ]),
});
```

#### 2. Get the Specific Score for a Single Course

This sync creates an endpoint like `/courses/score/:courseId` to get the score for one course.

**Pseudo-Code:**

```sync
sync GetCourseScore
when
    Requesting.request (path: "/courses/score", courseId) : (request)
where
    // Find the score for just this one course
    in Ranking: _getScoreForItem(item: courseId) gets (score)
then
    // Respond with the courseId and its score
    Requesting.respond (request, courseId, score)
```

**TypeScript Implementation (`src/syncs/course_info.sync.ts`):**

```typescript
import { actions, Sync } from "@engine";
import { Ranking, Requesting } from "@concepts";

/**
 * Handles a request to get the score for a specific course.
 */
export const GetCourseScore: Sync = ({ request, courseId, score }) => ({
  when: actions([
    Requesting.request, { path: "/courses/score", courseId }, { request }
  ]),
  where: async (frames) => {
    // Query for the score of the specific item (courseId).
    // This will return at most one frame, with the 'score' binding.
    return await frames.query(Ranking._getScoreForItem, { item: courseId }, { score });
  },
  then: actions([
    // Respond with the original courseId and the score we found.
    // Note: If the where clause returns no frames, this 'then' will not fire,
    // and the request would time out. A more robust sync would handle the
    // "not found" case, as described in the "Common Pitfalls" section.
    Requesting.respond, { request, courseId, score }
  ]),
});
```

By adding these queries to the `Ranking` concept, you make it a fully-featured, reusable component. Any application can now drop it in, use `setScore` and `removeItem` to manage the data, and use `_getTopItems` or `_getScoreForItem` to easily build UIs and APIs around that data, all without altering the core concept itself.


# prompt: update the Ranking concept below to use User
### Updated Concept: Ranking (with Queries)

* **concept**: Ranking \[User, Item]
* **purpose**: To maintain an ordered list of items, where each item has a single, canonical numerical score.
* **principle**: An item can be assigned a score. If a score is set or updated for an item, its position in any ordered retrieval is adjusted. An item can only have one score at a time.
* **state**:
	 * A set of `Ranks` with
        *   a `user` of type `User`
        *   an `item` of type `Item`
        *   a score of type `Number`
* **actions**:
  * `setScore (item: Item, score: Number)`
    * **requires**: `score` must be a valid number.
    * **effects**: Assigns or updates the score for the given item.
  * `removeItem (item: Item)`
    * **requires**: The item must exist in the ranking.
    * **effects**: Removes the item and its associated score.
* **queries**:
  * `_findRankedItem (item: Item): (item: Item)`
    * **purpose**: To determine if a specific item exists within the ranking system.
    * **inputs**: `item` - The identifier of the item to look up.
    * **outputs**: `item` - The identifier of the item if found.
  * `_getScoreForItem (item: Item): (score: Number)`
    * **purpose**: To retrieve the specific score for a single item.
    * **inputs**: `item` - The identifier of the item to look up.
    * **outputs**: `score` - The numerical score of the item. Returns at most one result.
 *  `_getAllRanks(): (` 
# response:

Of course. Here is the `Ranking` concept specification, updated to properly and consistently incorporate the `User` parameter throughout its definition.

The core change is shifting the model from "an item has one score" to "a user gives a score to an item." This affects the purpose, state, actions, and especially the queries.

***

### Updated Concept: Ranking [User, Item]

*   **concept**: Ranking \[User, Item]
*   **purpose**: To allow users to assign a personal numerical score to a set of items, and to query these scores.
*   **principle**: Each user can assign at most one score to any given item. The concept maintains the relationship between users, items, and the scores they have assigned.
*   **state**:
    *   A set of `Ranks` with
        *   a `user` of type `User`
        *   an `item` of type `Item`
        *   a `score` of type `Number`
*   **actions**:
    *   `setScore (user: User, item: Item, score: Number): (rank: Rank)`
        *   **requires**: `score` must be a valid number.
        *   **effects**: Creates and returns a new `Rank` record linking the `user` and `item` with the given `score`. If a rank from that user for that item already exists, it is updated with the new score.
    *   `removeItem (item: Item)`
        *   **requires**: The item must be a valid identifier.
        *   **effects**: Removes **all** `Rank` records associated with the given `item`, regardless of the user who created them. This is typically used for cleanup when an item is deleted from another system.
*   **queries**:
    *   `_getRanksByItem (item: Item): (rank: Rank)`
        *   **purpose**: To find all individual rank records associated with a specific item. This is crucial for cleanup operations (used by `removeItem`) or for fetching all data for aggregation.
        *   **inputs**: `item` - The identifier of the item to look up.
        *   **outputs**: `rank` - Zero or more `Rank` record identifiers associated with the given `item`.
    *   `_getRanksByUser (user: User): (item: Item, score: Number)`
        *   **purpose**: To retrieve all the scores a specific user has submitted.
        *   **inputs**: `user` - The identifier of the user.
        *   **outputs**: `item`, `score` - Zero or more pairs of items and the scores the user assigned to them.
    *   `_getScoreForUserAndItem (user: User, item: Item): (score: Number)`
        *   **purpose**: To retrieve the specific score a single user gave to a single item.
        *   **inputs**: `user` - The user identifier. `item` - The item identifier.
        *   **outputs**: `score` - The numerical score, if one exists. Returns at most one result.
    * 

  # Concept: Preferencing [User, Item]

*   **concept**: Preferencing \[User, Item]
*   **purpose**: To allow users to assign a personal numerical score to a set of items, and to query these scores.
*   **principle**: Each user can assign at most one score to any given item. The concept maintains the relationship between users, items, and the scores they have assigned.
*   **state**:
    * A set of `Users` with
        * a set of `Preferences` 
    * A set of `Preferences` with
        * an `item` of type `Item`
        * a `score` of type `Number`

*   **actions**:
    *   `setScore (user: User, item: Item, score: Number): (preference: Preference)`
        *   **requires**: `score` must be a valid number.
        *   **effects**: Creates and returns a new `Preference` record linking the `user` and `item` with the given `score`. If a preference from that user for that item already exists, it is updated with the new score.
    *   `removeItem (item: Item)`
        *   **requires**: The item must be a valid identifier.
        *   **effects**: Removes **all** `Rank` records associated with the given `item`, regardless of the user who created them. This is typically used for cleanup when an item is deleted from another system.
*   **queries**:
    *   `_getRanksByItem (item: Item): (rank: Rank)`
        *   **purpose**: To find all individual rank records associated with a specific item. This is crucial for cleanup operations (used by `removeItem`) or for fetching all data for aggregation.
        *   **inputs**: `item` - The identifier of the item to look up.
        *   **outputs**: `rank` - Zero or more `Rank` record identifiers associated with the given `item`.
    *   `_getRanksByUser (user: User): (item: Item, score: Number)`
        *   **purpose**: To retrieve all the scores a specific user has submitted.
        *   **inputs**: `user` - The identifier of the user.
        *   **outputs**: `item`, `score` - Zero or more pairs of items and the scores the user assigned to them.
    *   `_getScoreForUserAndItem (user: User, item: Item): (score: Number)`
        *   **purpose**: To retrieve the specific score a single user gave to a single item.
        *   **inputs**: `user` - The user identifier. `item` - The item identifier.
        *   **outputs**: `score` - The numerical score, if one exists. Returns at most one result.


# prompt: update the above concept to follow  the new structure in "state"
# response:

Of course. Here is the updated concept with a revised `state` structure and consistent terminology throughout the document.

***

# Concept: Preferencing \[User, Item]

*   **concept**: Preferencing \[User, Item]

*   **purpose**: To allow users to assign a personal numerical score to a set of items, and to query these scores.

*   **principle**: Each user can assign at most one score to any given item. The concept maintains the relationship between users, items, and the scores they have assigned.

*   **state**:
    *   A set of `Preferences` with
        *   a `user` of type `User`
        *   an `item` of type `Item`
        *   a `score` of type `Number`
    *   *Constraint*: The pair (`user`, `item`) must be unique across all `Preferences`.

*   **actions**:
    *   `setScore (user: User, item: Item, score: Number): (preference: Preference)`
        *   **requires**: `score` must be a valid number.
        *   **effects**: Creates and returns a new `Preference` record linking the `user` and `item` with the given `score`. If a preference from that user for that item already exists, it is updated with the new score.
    *   `removeItem (item: Item)`
        *   **requires**: The item must be a valid identifier.
        *   **effects**: Removes **all** `Preference` records associated with the given `item`, regardless of the user who created them. This is typically used for cleanup when an item is deleted from another system.

*   **queries**:
    *   `_getPreferencesByItem (item: Item): (preference: Preference)`
        *   **purpose**: To find all individual preference records associated with a specific item. This is crucial for cleanup operations (used by `removeItem`) or for fetching all data for aggregation.
        *   **inputs**: `item` - The identifier of the item to look up.
        *   **outputs**: `preference` - Zero or more `Preference` records associated with the given `item`.
    *   `_getPreferencesByUser (user: User): (item: Item, score: Number)`
        *   **purpose**: To retrieve all the scores a specific user has submitted.
        *   **inputs**: `user` - The identifier of the user.
        *   **outputs**: `item`, `score` - Zero or more pairs of items and the scores the user assigned to them.
    *   `_getScoreForUserAndItem (user: User, item: Item): (score: Number)`
        *   **purpose**: To retrieve the specific score a single user gave to a single item.
        *   **inputs**: `user` - The user identifier. `item` - The item identifier.
        *   **outputs**: `score` - The numerical score, if one exists. Returns at most one result.

# prompt: use the following state 
"A set of `Users` with
        * a set of `Preferences` 
    * A set of `Preferences` with
        * an `item` of type `Item`
        * a `score` of type `Number`"
# response:

Of course. Here is the concept updated to use the requested state structure, while maintaining the consistent terminology from the previous version.

***