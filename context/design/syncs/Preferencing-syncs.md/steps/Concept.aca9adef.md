---
timestamp: 'Mon Nov 17 2025 23:49:01 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251117_234901.75a93770.md]]'
content_id: aca9adef3ae256060563e693966679afa73f3ec096f8a16850554e96dbc4b0b7
---

# Concept: CourseScheduling

**concept**: CourseScheduling \[User, Event]
**purpose**: Track events in a student's course schedule and compare with others
**principle**: If a user adds different events to their schedule, they can then compare schedules and see which events they have in common.

**types**:

* `MeetingTime`:
  * a set of `days` (e.g., {Tuesday, Thursday})
  * a `startTime` of type `Time`
  * an `endTime` of type `Time`

**state**:

* a set of Courses with
  * a name String
  * a set of lecture Events with
    * a MeetingTime
  * a set of recitation Events with
    * a MeetingTime
  * a set of lab Events with
    * a MeetingTime
* a set of Users with
  * a Schedule
* a set of Schedules with
  * a user User
  * a set of (name String (could be the Course name), Event, type: String  (Lecture/Recitation/Lab/other) ) tuples

**actions:**

* **`createSchedule (user: User): (schedule: Schedule)`**
  * **requires**: The given `user` does not already have a schedule.
  * **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
* **`addEvent (user: User, event: Event, name: String, type: String)`**
  * **requires**: The `user` has a schedule; the `event` isn't already in the schedule
  * **effects**: Adds the `event` to the `user`'s schedule with the corresponding name.
* **`removeEvent (user: User, event: Event)`**
  * **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
  * **effects**: Removes the `event` from the `user`'s schedule.
* `defineCourse (name: String, lectures: MeetingTime[], recitations: MeetingTime[], labs: MeetingTime[]): (course: Course)`
  * **requires**: For each meeting time provided, `startTime < endTime`.  Course with given name doesn't exist
  * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times. This is typically an administrative action.

**queries**:

* `_getAllCourses (): (courses: Course[])`
  * **effects**: Returns all `Course` objects in the catalog.
* `_getCourseDetails (courses: Course[]): (name: String, lectures: Event[], recitations: Event[], labs: Event[])[]`
  * **requires**: The specified `courses` must exist.
  * **effects**: Returns the name and time information of each course
* **`_getUserSchedule(user: User):(name: String, event: Event, type: String, times: MeetingTime)[]`**
  * **requires**: The `user` has a schedule.
  * **effects**: Returns a set of all events (id's) in the user's schedule with their names,
* **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**
  * **requires**: Both `user1` and `user2` have schedules.
  * **effects**: Returns the common event id's between the schedules of user1 and user

Notes:

* lab and recitation sets can be empty

* We were thinking of having this as two concepts, but felt it would be either redundant to have both or unclear how to sync them

* **concept**: Preferencing \[User, Item]

* **purpose**: To allow a user to assign a personal numerical score to a single item at a time, and to query this score.

* **principle**: Each user can assign a score to at most one item at any given time. Assigning a score to an item (either new or existing) replaces any previously held item and score for that user.

* **state**:
  * A set of `Users` with
    * an `item` of type `Item`
    * a `score` of type `Number`

* **actions**:
  * `addScore (user: User, item: Item, score: Number)`
    * **requires**: The `user` must not currently have an `item` and `score` assigned. The `score` must be a valid number.
    * **effects**: Assigns the given `item` and `score` to the `user`.
  * `updateScore (user: User, item: Item, score: Number)`
    * **requires**: The `user` must already have the specified `item` assigned. The `score` must be a valid number.
    * **effects**: Updates the `score` for the `user`'s assigned `item` to the new value.
  * `removeScore (user: User, item: Item)`
    * **requires**: The `user` must have the specified `item` assigned to them.
    * **effects**: Clears the `item` and `score` from the `user`'s record, removing the preference.

* **queries**:
  * `_getScore (user: User, item: Item): (score: Number)`
    * **requires**: `user` exists and `item` is associated with `user`
    * **outputs**: return `score` associated with `item`

  * `_getAllItems(user: User): (items: Item[])`
    * **requires** `user` exists
    * **effects**: list of Item `items` associated with the `user` is returned
