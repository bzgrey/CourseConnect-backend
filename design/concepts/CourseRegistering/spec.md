[@concept-design-overview](../../background/concept-design-overview.md)
[@concept-specifications](../../background/concept-specifications.md)
[@ProblemFraming](../../FunctionalDesign/ProblemFraming.md)
# concept: CourseRegistering

*   **concept**: CourseRegistering \[Student, Course]
*   **purpose**: To allow a student to browse a catalog of available courses and build a personal, conflict-free schedule of desired courses for a term.
*   **principle**: If a catalog of courses with defined meeting times is available, a student can add desired courses to their personal schedule and remove them, and the system will prevent them from adding courses with conflicting times.
*   **state**:
    *   A set of `Courses` with
        *   a `name` of type `String`
        *   a set of `days` (e.g., {Monday, Wednesday})
        *   a `startTime` of type `Time`
        *   an `endTime` of type `Time`
    *   A set of `Registrations` with
        *   a `student` of type `Student`
        *   a `course` of type `Course`
*   **actions**:
    *   `defineCourse (name: String, days: Set<Day>, startTime: Time, endTime: Time): (course: Course)`
        *   **requires**: `startTime < endTime`.
        *   **effects**: Creates a new course in the catalog available for registration. This is typically an administrative action.
    *   `addCourse (student: Student, course: Course)`
        *   **requires**: The course must exist. The student must not already be registered for this course. The specified `course` must not have a time conflict with any other course for which the `student` has an existing `Registration`.
        *   **effects**: Creates a new `Registration` linking the `student` and the `course`.
    *   `removeCourse (student: Student, course: Course)`
        *   **requires**: A `Registration` linking the specified `student` and `course` must exist.
        *   **effects**: Removes the existing `Registration` for the `student` and `course`.


[@sync-CourseRegistration_Ranking_brainstorm](../../brainstorming/sync-CourseRegistration_Ranking_brainstorm.md)
# prompt: Based on the syncs, add a query section of actions to the concept spec above
# response:


# response:

Of course. Based on the functionality described and the common need to retrieve data for user interfaces and other syncs, here is the `CourseRegistering` concept specification with an added `queries` section.

The new section provides ways to read the state of the concept, such as retrieving the full course catalog or fetching the schedule for a particular student, which are essential for building a complete application.

# concept: CourseRegistering

*   **concept**: CourseRegistering \[Student, Course]
*   **purpose**: To allow a student to browse a catalog of available courses and build a personal, conflict-free schedule of desired courses for a term.
*   **principle**: If a catalog of courses with defined meeting times is available, a student can add desired courses to their personal schedule and remove them, and the system will prevent them from adding courses with conflicting times.
*   **state**:
    *   A set of `Courses` with
        *   a `name` of type `String`
        *   a set of `days` (e.g., {Monday, Wednesday})
        *   a `startTime` of type `Time`
        *   an `endTime` of type `Time`
    *   A set of `Registrations` with
        *   a `student` of type `Student`
        *   a `course` of type `Course`
*   **queries**:
    *   `_getAllCourses (): (course: Course)`
        *   **effects**: Returns all `Course` objects in the catalog.
    *   `_getCourse (course: Course): (course: Course)`
        *   **requires**: The specified `course` must exist.
        *   **effects**: Returns the full `Course` object matching the provided identifier.
    *   `_getRegistrationsForStudent (student: Student): (registration: Registration, course: Course)`
        *   **effects**: Returns all `Registration` records for the given `student`, along with the corresponding `Course` details for each registration.
*   **actions**:
    *   `defineCourse (name: String, days: Set<Day>, startTime: Time, endTime: Time): (course: Course)`
        *   **requires**: `startTime < endTime`.
        *   **effects**: Creates a new course in the catalog available for registration. This is typically an administrative action.
    *   `addCourse (student: Student, course: Course)`
        *   **requires**: The course must exist. The student must not already be registered for this course. The specified `course` must not have a time conflict with any other course for which the `student` has an existing `Registration`.
        *   **effects**: Creates a new `Registration` linking the `student` and the `course`.
    *   `removeCourse (student: Student, course: Course)`
        *   **requires**: A `Registration` linking the specified `student` and `course` must exist.
        *   **effects**: Removes the existing `Registration` for the `student` and `course`.

# prompt: for the state a set of Courses with ..., add a Recitation and Lecture identifiers, which have their own start, end times and days

# response:

Of course. Here is the updated `CourseRegistering` concept specification.

The `Course` definition within the `state` has been modified to include separate, structured identifiers for `Lecture` and an optional `Recitation`. This provides a more realistic and flexible model for university courses, where different components have their own schedules. The actions and principles have been updated accordingly to handle this new structure.

# concept: CourseRegistering

* **concept**: CourseRegistering \[Student, Course]
* **purpose**: To allow a student to browse a catalog of available courses and build a personal, conflict-free schedule of desired courses for a term.
* **principle**: If a catalog of courses with defined meeting times for lectures and recitations is available, a student can add desired courses to their personal schedule and remove them, and the system will prevent them from adding courses with conflicting meeting times.
* **types**:
  * `MeetingTime`:
    * a set of `days` (e.g., {Tuesday, Thursday})
    * a `startTime` of type `Time`
    * an `endTime` of type `Time`
* **state**:
  * A set of `Courses` with
    * a `name` of type `String`
    * a `lecture` of type `MeetingTime`
    * an optional `recitation` of type `MeetingTime`
  * A set of `Registrations` with
    * a `student` of type `Student`
    * a `course` of type `Course`
* **queries**:
  * `_getAllCourses (): (courses: Course[])`
    * **effects**: Returns all `Course` objects in the catalog.
  * `_getCourse (course: Course): (course: Course)`
    * **requires**: The specified `course` must exist.
    * **effects**: Returns the full `Course` object matching the provided identifier.
  * `_getRegistrationsForStudent (student: Student): (registration: Registration, course: Course)`
    * **effects**: Returns all `Registration` records for the given `student`, along with the corresponding `Course` details for each registration.
* **actions**:
  * `defineCourse (name: String, lecture: MeetingTime, recitation?: MeetingTime): (course: Course)`
    * **requires**: For each meeting time provided, `startTime < endTime`. 
    * **effects**: Creates a new course in the catalog with defined lecture and optional recitation times. This is typically an administrative action. 
  * `addCourse (student: Student, course: Course)`
    * **requires**: The course must exist. The student must not already be registered for this course. The lecture and recitation times of the specified `course` must not have a time conflict with the lecture or recitation times of any other course for which the `student` has an existing `Registration`.
    * **effects**: Creates a new `Registration` linking the `student` and the `course`.
  * `removeCourse (student: Student, course: Course)`
    * **requires**: A `Registration` linking the specified `student` and `course` must exist.
    * **effects**: Removes the existing `Registration` for the `student` and `course`.