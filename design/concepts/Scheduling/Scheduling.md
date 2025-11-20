
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
    *   **requires**: The given `user` does not already have a schedule.
    *   **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
* **`addEvent (event: Event, name: String, type: String, time: MeetingTime, user?: User)`**
    *   **requires**: the `event` isn't already in the set of Events
    *   **effects**: Adds the `event` to the set of Events with the given info
* **`removeEvent (event: Event, user?: User)`**
    *   **requires**: The `event` is in set of events; If a user is given, then the event must have this user
    *   **effects**: Removes the `event` from the `user`'s schedule.
* scheduleEvent (user: User, event: Event)
    *   **requires**: The `user` has a schedule; the `event` is in the set of Events
    *   **effects**: Adds the `event` to the `user`'s schedule.
* **`unscheduleEvent (user: User, event: Event)`**
    *   **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
    *   **effects**: Removes the `event` from the `user`'s schedule.

**queries**:
* **`_getUserSchedule(user: User):(event: Event, name: String, type: String, times: MeetingTime)[]`**
    *   **requires**: The `user` has a schedule.
    *   **effects**: Returns a set of all events (id's) in the user's schedule with their names, types, and times
* **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**
    *   **requires**: Both `user1` and `user2` have schedules.
    *   **effects**: Returns the common event id's between the schedules of user1 and user

<!-- 
when 
    Requesting.request (path: /get-schedule, user)
where
    Scheduling._getUserSchedule(user) : (event)
    CourseCataloging._getCourse(event) : (name: String, type: String, times: MeetingTime)
    return frames.collectAs([name, type, times], results);
then
    Requesting.respond () -->
