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
