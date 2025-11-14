---
timestamp: 'Fri Nov 14 2025 12:29:24 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251114_122924.356b5918.md]]'
content_id: 2c52cef7ecd06e81a210d4699403c127f3e47768855d5e602ad6fbebc172da23
---

# response:

Of course. Here is the specification for the `CourseRegistering` concept, reformatted to match your provided example.

***

### **concept: CourseRegistering**

* **concept**: CourseRegistering \[Student, CourseSection]
* **purpose**: To manage the enrollment of students in capacity-constrained course sections for a given academic term.
* **principle**: If a course section with a defined capacity is available, and a student registers for it, then the student is enrolled if there is space, or placed on a waitlist if the section is full.
* **state**:
  * A set of `CourseSections` with
    * a `capacity` of type `Integer`
    * a set of `registeredStudents` of type `Student`
    * an ordered list of `waitlistedStudents` of type `Student`
* **actions**:
  * `addSection (section: CourseSection, capacity: Integer)`
    * **requires**: The section must not already exist. `capacity` must be a non-negative integer.
    * **effects**: Creates a new course section record with the given capacity, an empty set of registered students, and an empty waitlist.
  * `register (student: Student, section: CourseSection)`
    * **requires**: The section must exist. The student must not already be registered for or on the waitlist for the section.
    * **effects**: If the number of `registeredStudents` is less than the section's `capacity`, adds the student to the set of `registeredStudents`. Otherwise, adds the student to the end of the `waitlistedStudents` list.
  * `drop (student: Student, section: CourseSection)`
    * **requires**: The section must exist.
    * **effects**: If the student is in the `registeredStudents` set, they are removed. If the `waitlistedStudents` list is not empty, the first student from the waitlist is removed from the waitlist and added to the `registeredStudents` set. If the student is on the `waitlistedStudents` list, they are removed from the list.
