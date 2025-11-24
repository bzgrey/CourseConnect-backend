---
timestamp: 'Sun Nov 23 2025 20:16:44 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_201644.402e3bf8.md]]'
content_id: 4a506fe24bd4c1193137621b931f4aac5c17d0369145fb68f3cd00d7a7b18042
---

# concept: Scheduling

**concept**: Scheduling \[User, Event]
**purpose**: Track events in one's schedule and compare with others
**principle**: If a user adds different events to their schedule, they can then compare schedules and see which events they have in common.

**state**:

* a set of Users with
  * a Schedule
* a set of Schedules with
  * a set of Events

**actions:**

* **`createSchedule (user: User): (schedule: Schedule)`**
  * **requires**: The given `user` does not already have a schedule.
  * **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
* scheduleEvent (user: User, event: Event)
  * **requires**: The `user` has a schedule
  * **effects**: Adds the `event` to the `user`'s schedule.
* **`unscheduleEvent (user: User, event: Event)`**
  * **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
  * **effects**: Removes the `event` from the `user`'s schedule.

**queries**:

* **`_getUserSchedule(user: User): events: Event[]`**
  * **requires**: The `user` has a schedule.
  * **effects**: Returns a set of all events (id's) in the user's schedule
* **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**
  * **requires**: Both `user1` and `user2` have schedules.
  * **effects**: Returns the common event id's between the schedules of user1 and user

## Sessioning:

Specification:
