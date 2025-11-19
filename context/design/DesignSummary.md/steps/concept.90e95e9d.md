---
timestamp: 'Tue Nov 18 2025 19:55:27 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251118_195527.45b213f0.md]]'
content_id: 90e95e9d0e014ebf8e73ea211e573130ffccf4ff2d0bdaf67d3c442d709c9cd9
---

# concept: Scheduling

**concept**: Scheduling \[User, Event]
**purpose**: Track events in one's schedule and compare with others
**principle**: If a user adds different events to their schedule, they can then compare schedules and see which events they have in common.

**types**:

* `MeetingTime`:
  * a set of `days` (e.g., {Tuesday, Thursday})
  * a `startTime` of type `Time`
  * an `endTime` of type `Time`

**state**:

* a set of Users with
  * a Schedule
* a set of Schedules with
  * a user User
  * a set of Events
* a set of Events with
  * a name String (could be the Course name)
  * a type String (Lecture/Recitation/Lab/other)
  * a MeetingTime
  * an optional user User

**actions:**

* **`createSchedule (user: User): (schedule: Schedule)`**
  * **requires**: The given `user` does not already have a schedule.
  * **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
* **`addEvent (event: Event, name: String, type: String, time: MeetingTime, user?: User)`**
  * **requires**: the `event` isn't already in the set of Events
  * **effects**: Adds the `event` to the set of Events with the given info
* **`removeEvent (event: Event, user?: User)`**
  * **requires**: The `event` is in set of events; If a user is given, then the event must have this user
  * **effects**: Removes the `event` from the `user`'s schedule.
* scheduleEvent (user: User, event: Event)
  * **requires**: The `user` has a schedule; the `event` is in the set of Events
  * **effects**: Adds the `event` to the `user`'s schedule.
* **`unscheduleEvent (user: User, event: Event)`**
  * **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
  * **effects**: Removes the `event` from the `user`'s schedule.

**queries**:

* **`_getUserSchedule(user: User):(event: Event, name: String, type: String, times: MeetingTime)[]`**
  * **requires**: The `user` has a schedule.
  * **effects**: Returns a set of all events (id's) in the user's schedule with their names, types, and times

* **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**
  * **requires**: Both `user1` and `user2` have schedules.
  * **effects**: Returns the common event id's between the schedules of user1 and user

* **concept**: Friending \[User]

* **purpose**: To manage mutual, consent-based social connections between users.

* **principle**: If User A sends a friend request to User B, and User B accepts the request, then User A and User B will appear on each other's friends list.

* **state**:
  `pendingRequests: a set of (requester: User, requestee: User)`
  `friends: a set of {user1: User, user2: User}` (a symmetric relationship)

* **actions**:
  `requestFriend (requester: User, requestee: User)`
  **requires** `requester` and `requestee` are not already friends. A pending request from `requester` to `requestee` does not already exist. `requester` is not `requestee`.
  **effects** Adds the pair (`requester`, `requestee`) to the `pendingRequests` set.

  `acceptFriend (requester: User, requestee: User)`
  **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
  **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`. Adds the pair `{requester, requestee}` to the `friends` set.

  `rejectFriend (requester: User, requestee: User)`
  **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
  **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`.

  `removeFriend (remover: User, removed: User)`
  **requires** `remover` and `removed` are friends.
  **effects** Removes the pair `{remover, removed}` from the `friends` set.

* **queries**
  `_getAllFriendRequests (user:User):User[]`
  **effects** returns list of requestees for user

  `_getAllFriends (user:User):User[]`
  **effects** returns list of friends for user

  `_areTheyFriends(user1:User, user2:User): Boolean`
  **effects** returns true if {user1, user2} exists in friends otherwise false
