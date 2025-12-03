---
timestamp: 'Tue Dec 02 2025 11:04:51 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251202_110451.4793aa23.md]]'
content_id: 492aca388a5897e47c19a610d4cafa9263467e53568b6a18235b16c1490a00d7
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
