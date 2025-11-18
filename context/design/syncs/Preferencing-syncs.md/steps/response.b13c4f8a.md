---
timestamp: 'Mon Nov 17 2025 23:46:37 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251117_234637.5754cb04.md]]'
content_id: b13c4f8adc747a98609bf5b46e14fc538ca2334c96129c29933539c76bcc0dfb
---

# response:

Excellent. Based on the documentation provided, here are proposals for several synchronizations between hypothetical `CourseScheduling` and `Preferencing` concepts. These are written in the high-level `sync` specification language, without the TypeScript implementation, as requested.

***

### 1. Notify Students When a Preferred Course Section Opens

This synchronization acts as a notification system. When a new section is added for a course, the system finds all students who have expressed a preference for that course and notifies them.

```sync
sync NotifyOnNewSectionForPreferredCourse
when
	CourseScheduling.addSection (course) : (section)
where
	in Preferencing: _getStudentsPreferringCourse(course) gets student
then
	Notification.notify (
		to: student,
		message: "A new section for your preferred course is available!"
	)
```

**Interaction:** An action in `CourseScheduling` (`addSection`) triggers a query on `Preferencing` (`_getStudentsPreferringCourse`), which then results in one or more actions in a `Notification` concept. The iteration over students happens automatically via the frames mechanism.

***

### 2. Auto-Enroll a Student from a Preference List When a Spot Opens

This implements a waitlist-like feature using preferences. When a student drops a course, the system checks the preference list for the highest-priority student who wants to enroll and automatically enrolls them.

```sync
sync AutoEnrollFromPreferenceOnDrop
when
	CourseScheduling.studentDropsCourse (course, section) : ()
where
	in Preferencing: _getNextInLineForCourse(course) gets waitlistStudent
then
	CourseScheduling.enrollStudent (student: waitlistStudent, course, section)
	Notification.notify (
		to: waitlistStudent,
		message: "You have been automatically enrolled from the preference list."
	)
```

**Interaction:** An action in `CourseScheduling` (`studentDropsCourse`) triggers a query on `Preferencing` (`_getNextInLineForCourse`). If a student is found, it triggers two `then` actions: one to enroll the new student in `CourseScheduling` and another to notify them.

***

### 3. Warn a Student if a New Preference Conflicts with Their Schedule

This provides immediate feedback to a user. When a student sets a new preference for a specific course section, the system immediately checks if it conflicts with their already-registered courses.

```sync
sync WarnOnPreferenceConflict
when
	Preferencing.setPreference (student, section) : ()
where
	in CourseScheduling: _getSectionTime(section) gets preferenceTime
	in CourseScheduling: _getStudentSchedule(student) gets scheduledSection
	in CourseScheduling: _getSectionTime(scheduledSection) gets scheduledTime
	preferenceTime conflicts with scheduledTime
then
	Notification.warn (
		to: student,
		message: "Your new preference conflicts with a course already on your schedule."
	)
```

**Interaction:** An action in `Preferencing` (`setPreference`) triggers multiple queries on `CourseScheduling` to retrieve time information and check for conflicts. The `where` clause contains the logic (conceptualized as `conflicts with`) to filter for frames where an overlap exists, triggering a warning notification if any such frame is found.

***

### 4. Generate a Draft Schedule Based on Preferences (Request/Response Flow)

This is a more complex user-facing feature that follows the request/response pattern. A student sends a request to generate a schedule, the system uses their preferences to assemble it, and then responds with the result. This would likely be split into two syncs.

**Part A: The Request**

This sync initiates the schedule generation logic.

```sync
sync GenerateScheduleRequest
when
	Requesting.request (path: "/schedule/generate", student) : (request)
where
	in Preferencing: _getPreferencesForUser(student) gets preferences
then
	CourseScheduling.generateScheduleFromPreferences (student, preferences)
```

**Part B: The Response**

This sync waits for the generation to complete and sends the result back to the original requester.

```sync
sync GenerateScheduleResponse
when
	Requesting.request (path: "/schedule/generate", student) : (request)
	CourseScheduling.generateScheduleFromPreferences (student) : (generatedSchedule)
then
	Requesting.respond (request, body: generatedSchedule)
```

**Interaction:** This pair of syncs demonstrates the flow-based matching.

1. A `Requesting.request` comes in. The first sync queries `Preferencing` to gather the necessary data (`preferences`).
2. It then triggers a potentially long-running or complex action in `CourseScheduling` (`generateScheduleFromPreferences`).
3. The second sync matches on both the original `Requesting.request` and the successful completion of the `generateSchedule...` action, ensuring the response is correlated to the correct request and contains the final schedule. An equivalent `...ResponseError` sync could handle the failure case.
