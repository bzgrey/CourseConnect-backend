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
    *   **requires**: The given `user` does not already have a schedule.
    *   **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
* **`addEvent (user: User, event: Event, name: String, type: String)`**
    *   **requires**: The `user` has a schedule; the `event` isn't already in the schedule
    *   **effects**: Adds the `event` to the `user`'s schedule with the corresponding name.
* **`removeEvent (user: User, event: Event)`**
    *   **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
    *   **effects**: Removes the `event` from the `user`'s schedule.
* `defineCourse (name: String, lectures: MeetingTime[], recitations: MeetingTime[], labs: MeetingTime[]): (course: Course)`
    * **requires**: For each meeting time provided, `startTime < endTime`.  Course with given name doesn't exist
    * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times. This is typically an administrative action. 

**queries**: 
*  `_getAllCourses (): (courses: Course[])`
    * **effects**: Returns all `Course` objects in the catalog.
* `_getCourseDetails (courses: Course[]): (name: String, lectures: Event[], recitations: Event[], labs: Event[])[]`
    * **requires**: The specified `courses` must exist.
    * **effects**: Returns the name and time information of each course
* **`_getUserSchedule(user: User):(name: String, event: Event, type: String, times: MeetingTime)[]`**
    *   **requires**: The `user` has a schedule.
    *   **effects**: Returns a set of all events (id's) in the user's schedule with their names, 
* **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**
    *   **requires**: Both `user1` and `user2` have schedules.
    *   **effects**: Returns the common event id's between the schedules of user1 and user

Notes: 	
* lab and recitation sets can be empty
* We were thinking of having this as two concepts, but felt it would be either redundant to have both or unclear how to sync them