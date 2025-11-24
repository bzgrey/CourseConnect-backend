---
timestamp: 'Sun Nov 23 2025 20:16:44 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_201644.402e3bf8.md]]'
content_id: b2cd7dca8e700ed40a3baf63a06ab4d0fa3e7d02e11490558717b0f02f6f1b2a
---

# concept: CourseCatalog

**concept:** CourseCatalog\[Event]
**purpose**: Track the courses offered in a school with all of the information for each course regarding times, class types, name
**principle**: One can define courses with their given information and then access the information to each course

**types**:

* `MeetingTime`:
  * a set of `days` (e.g., {Tuesday, Thursday})
  * a `startTime` of type `Time`
  * an `endTime` of type `Time`

**state**:

* a set of Courses with
  * a name String
  * a set of Events
  * other information
* a set of Events with
  * a Course (the course that this is part of)
  * a type String (one of Lecture/Recitation/Lab)
  * a MeetingTime

**actions**:

* `defineCourse (name: String, events: (Event, type: String, times: MeetingTime)[]): (course: Course)`
  * **requires**: For each meeting time provided, `startTime < endTime`.  Course with given name doesn't exist
  * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times. This is typically an administrative action.
* removeCourse (course: Course)
  * requires: course exists
  * effects: removes course from set of course and each of its events from the set of events

**queries:**

* `_getAllCourses (): (courses: (course, name: String, events: (Event, type: String, times: MeetingTime))[])`
  * **effects**: Returns all `Courses` in the catalog with their information.
* \_getCourseInfo (courses: Course\[]): (name: String, events: (Event, type: String, times: MeetingTime))\[]
  * **requires:** courses exist
  * **effects:** returns the course info for each course
* \_getEventInfo (event: Event): (event: Event, name: String, type: String, times: MeetingTime)\[]
  * **requires:** event exists
  * **effects:** returns the MeetingTimes for given event

## Scheduling:

Specification:
