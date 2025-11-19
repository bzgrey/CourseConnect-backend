---
timestamp: 'Tue Nov 18 2025 19:55:27 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251118_195527.45b213f0.md]]'
content_id: 8a56d30d467f4b14f203b4ceff6fa086fd82fe1db05a9685dc65da6329d0ed01
---

# concept: CourseCatalog

**concept:** CourseCatalog\[Event]

**types**:

* `MeetingTime`:
  * a set of `days` (e.g., {Tuesday, Thursday})
  * a `startTime` of type `Time`
  * an `endTime` of type `Time`

**state**:

* a set of Courses with
  * a name String
  * a set of Events
* a set of Events with
  * a type String (one of Lecture/Recitation/Lab)
  * a MeetingTime

**actions**:

* `defineCourse (name: String, events: (Event, type: String, times: MeetingTime)): (course: Course)`
  * **requires**: For each meeting time provided, `startTime < endTime`.  Course with given name doesn't exist
  * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times. This is typically an administrative action.

**queries:**

* \_getCourseInfo (courses: Course\[]): ((name: String, events: (Event, type: String, times: MeetingTime))\[])
  * **requires:** courses exist
  * **effects:** returns the course info for each course
* \_getEventTimes (events: Event\[]): ((event, times: MeetingTime)\[])
  * **requires:** each event exists
  * **effects:** returns the MeetingTimes for each given event
