---
timestamp: 'Fri Nov 14 2025 12:25:58 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251114_122558.e1886659.md]]'
content_id: 56d0d8ee50724e0ade89d305882d4f87d3ec7b8da34d895432ed9d4b769c76c1
---

# response:

Of course. Based on the principles of Concept Design you've provided, here is a specification for a `CourseRegistering` concept.

***

### **Concept: CourseRegistering**

#### **Purpose**

To manage the enrollment of students in capacity-constrained course sections for a given academic term.

#### **State**

The concept is polymorphic over `Student` and `CourseSection` identifiers. It knows nothing about students (e.g., their names, majors) or course sections (e.g., their titles, meeting times) beyond their unique identities.

* **`sections`**: A set of `CourseSection` identifiers that are available for registration.
* **`capacityOf [s: CourseSection] -> Integer`**: A mapping from a course section to its maximum enrollment capacity.
* **`registrations [s: CourseSection] -> Set<Student>`**: A mapping from a course section to the set of students currently registered for it.
* **`waitlists [s: CourseSection] -> List<Student>`**: A mapping from a course section to an ordered list of students on its waitlist.

#### **Actions**

**User Actions:** These actions are typically initiated by a user (e.g., a student).

* **`register (s: Student, c: CourseSection)`**:
  * **Description**: Attempts to register a given student `s` for a course section `c`.
  * **Behavior**:
    * If the section `c` is not in `sections`, the action has no effect.
    * If the student `s` is already registered for `c`, the action has no effect.
    * If the number of registered students for `c` is less than its `capacityOf`, the student `s` is added to the `registrations` for `c`. The `registrationConfirmed` output action occurs.
    * If the course is full, the student `s` is added to the end of the `waitlists` for `c`, provided they are not already on it. The `waitlistConfirmed` output action occurs.

* **`drop (s: Student, c: CourseSection)`**:
  * **Description**: Removes a student `s` from a course section `c` or its waitlist.
  * **Behavior**:
    * If the student `s` is in the `registrations` for `c`, they are removed. The `dropConfirmed` output action occurs.
    * If the student `s` is on the `waitlists` for `c`, they are removed. The `dropConfirmed` output action occurs.
    * Otherwise, the action has no effect.

**Output Actions:** These actions occur spontaneously as a result of other actions within this concept. They signal that a state change has occurred, allowing syncs to trigger behavior in other concepts (like notifications).

* **`registrationConfirmed (s: Student, c: CourseSection)`**: Occurs when a student `s` is successfully registered in section `c`.
* **`waitlistConfirmed (s: Student, c: CourseSection, position: Integer)`**: Occurs when a student `s` is successfully added to the waitlist for section `c` at the given `position`.
* **`dropConfirmed (s: Student, c: CourseSection)`**: Occurs when a student `s` successfully drops section `c`.
* **`promotedFromWaitlist (s: Student, c: CourseSection)`**: Occurs when a student `s` is moved from the waitlist into the registered list for section `c`.

#### **Example Usage with Syncs**

The `CourseRegistering` concept is fully independent. Its utility in an application is realized by composing it with other concepts via synchronizations.

**1. Authorizing a Registration Request**

This sync connects a user's request to the `register` action, but only if they are properly authenticated. It uses the `Request` pseudo-concept and a `Session` concept.

```
sync AuthorizeRegistration
when
    Request.registerForCourse (c, s_id)
where
    in Session: user of session s_id is u
then
    CourseRegistering.register (u, c)
```

**2. Handling Prerequisites**

This sync prevents registration if a student hasn't met the prerequisites. It demonstrates composition with `StudentRecords` and `CourseCatalog` concepts. The `CourseRegistering` concept itself knows nothing about prerequisites.

```
sync EnforcePrerequisites
when
    Request.registerForCourse (c, s_id)
where
    in Session: user of session s_id is u
    in CourseCatalog: prereq for c is p
    in StudentRecords: u has not completed p // Note the negation
then
    // No "then" action. The request is simply ignored, preventing registration.
    // Alternatively, a 'registrationFailed' action could be triggered in a 'UI' concept.
```

**3. Automatic Promotion from Waitlist**

When a student drops a course that has a waitlist, the first person on the waitlist is automatically registered. This sync is triggered by an action *within the same concept*.

```
sync PromoteFromWaitlist
when
    CourseRegistering.drop (s, c)
where
    in CourseRegistering: waitlists[c] is [first_student, ...] // The waitlist is not empty
then
    CourseRegistering.register (first_student, c)
```

**4. Notifying a Student of Successful Registration**

This sync uses an output action (`promotedFromWaitlist`) to trigger a notification in a separate `Notification` concept.

```
sync NotifyOnPromotion
when
    CourseRegistering.promotedFromWaitlist (s, c)
where
    in UserProfile: name of c is course_name
then
    Notification.notify (s, "You have been registered for " + course_name + " from the waitlist!")
```

#### **Design Rationale & Adherence to Principles**

* **Independence & Polymorphism**: The concept is defined without reference to `StudentRecords`, `CourseCatalog`, `Notification`, or any other concept. It operates on opaque identifiers for `Student` and `CourseSection`, making it highly reusable for registering any kind of entity for any kind of event (e.g., users for workshops, employees for training).
* **Separation of Concerns**: This concept is *only* concerned with managing lists of attendees, waitlisted individuals, and capacity. It explicitly does not handle concerns like course details (title, time), student records (grades, major), or authentication. Those are delegated to other concepts and composed via syncs.
* **Completeness**: Within its defined purpose, the concept is complete. It contains all the logic needed to manage registration, dropping, and waitlisting. It does not "call out" to another concept to check for an open seat; that logic is self-contained. The automatic promotion from the waitlist is handled internally, triggered by a `drop` action.
* **Familiarity**: The user-facing protocol (`register`, `drop`) is simple, intelligible, and mimics the real-world process of course registration.
