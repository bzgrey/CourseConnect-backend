---
timestamp: 'Sun Nov 16 2025 15:37:32 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_153732.63eb0cb9.md]]'
content_id: e1a5163048f1dd72fd843906ebfb4711dbdf5d1af3d77086a957a5c0930297bb
---

# concept: Scheduling

* **concept**: Scheduling \[User, Event]

* **purpose**: Track events in a person's schedule and compare with others

* **principle**: If a user adds different events to their schedule, they can then compare schedules and see which events they have in common.

* **state**:

  ```
  a set of Users with
    a schedule Schedule

  a set of Schedules with
    an events set of Events

  ```

* **actions**

  **`createSchedule (user: User): (schedule: Schedule)`**

  * **requires**: The given `user` does not already have a schedule.
  * **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.

  **`addEvent (user: User, event: Event)`**

  * **requires**: The `user` has a schedule; the `event` isn't already in the schedule
  * **effects**: Adds the `event` to the `user`'s schedule.

  **`removeEvent (user: User, event: Event)`**

  * **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
  * **effects**: Removes the `event` from the `user`'s schedule.

  **`deleteEvent (event: Event)`**

  * **requires**: The `event` exists.
  * **effects**: removes the `event` from any Schedule that contains it.

* **queries**: Reads of the concept state.

  **`_getUserSchedule (user: User): events: Event[]`**

  * **requires**: The `user` has a schedule.
  * **effects**: Returns a set of all events (id's) in the user's schedule

  **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**

  * **requires**: Both `user1` and `user2` have schedules.
  * **effects**: Returns the common event id's between the schedules of user1 and user2
