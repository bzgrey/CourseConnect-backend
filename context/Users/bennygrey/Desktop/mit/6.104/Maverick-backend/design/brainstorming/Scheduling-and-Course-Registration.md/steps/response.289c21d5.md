---
timestamp: 'Sun Nov 16 2025 15:38:24 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_153824.c10d7fe4.md]]'
content_id: 289c21d5c49b62b3baf6ebb01f2756a9a7f6383836ef67e27c9f62227541b556
---

# response:

Excellent question. You've hit upon the very core of what makes concept design powerful, but also challenging. Your intuition is exactly right: the original `Scheduling` concept is too generic and doesn't contain enough information to be useful for its stated purpose, while the `CourseRegistering` concept is doing too much work and violating the principle of separation of concerns.

Let's break down how to improve this structure by applying the principles of concept design more rigorously.

### The Core Problem in the Original Design

1. **Violation of Separation of Concerns:** Your `CourseRegistering` concept is responsible for two distinct things:
   * Managing a catalog of courses and which students are registered for them.
   * Performing complex time-conflict validation logic.
     The time-conflict logic is a general, reusable "scheduling" concern, whereas managing course data is specific to this application's domain.

2. **Lack of Completeness and Utility:** Your `Scheduling` concept, by only dealing with opaque `Event` IDs, cannot fulfill its own purpose. To "track events in a person's schedule and compare" them, it *must* know about the properties of those events that are relevant to scheduling—namely, their timing. It is not a complete concept for scheduling because it lacks the state to perform its function.

### The Solution: Refactor into More Coherent Concepts

The solution is to redefine the concepts so that each one has a single, clear, and complete responsibility.

1. **A True `TimeScheduler` Concept**: We will replace the weak `Scheduling` concept with a powerful, reusable `TimeScheduler`. Its sole job is to manage time blocks for entities and prevent conflicts. It knows nothing about "courses" or "students," only about "owners" and "events" with start/end times.

2. **A Focused `CourseRegistration` Concept**: We will simplify the `CourseRegistration` concept. Its job is only to manage the catalog of courses and the list of registrations (who is registered for what). It will **no longer perform conflict checking**.

3. **Composition with Syncs**: We will use `syncs` to connect a user's *request* to register for a course to these two concepts. The sync will orchestrate the process: first, try to reserve the time slot in the `TimeScheduler`; if that succeeds, then create the registration in `CourseRegistration`.

***

### # concept: TimeScheduler (Improved)

This concept replaces the original `Scheduling` concept. It is generic and highly reusable for any time-management feature.

* **concept**: TimeScheduler \[Owner, Event]

* **purpose**: To manage and reserve blocks of time for events associated with an owner, ensuring no time conflicts occur.

* **principle**: If an owner attempts to schedule a new event, the action will only succeed if the new event's time block does not overlap with any of the owner's previously scheduled events.

* **types**:
  * `TimeSlot`:
    * `startTime` of type `DateTime`
    * `endTime` of type `DateTime`

* **state**:
  * A set of `ScheduledEvents` with
    * an `event` of type `Event` (the unique ID of the thing being scheduled)
    * an `owner` of type `Owner`
    * a `time` of type `TimeSlot`

* **actions**:
  * **`schedule (owner: Owner, event: Event, time: TimeSlot): (scheduledEvent: ScheduledEvent)`**
    * **requires**: The provided `time.startTime` must be before `time.endTime`. The `owner` must not have any other `ScheduledEvent` whose `time` overlaps with the new event's `time`. The `event` must not already be scheduled.
    * **effects**: Creates a new `ScheduledEvent` with the given owner, event, and time. Returns the new `ScheduledEvent`.

  * **`schedule (owner: Owner, event: Event, time: TimeSlot): (error: String)`**
    * **requires**: The `owner` *does* have a conflicting `ScheduledEvent`.
    * **effects**: Returns an error message indicating a time conflict.

  * **`unschedule (event: Event)`**
    * **requires**: A `ScheduledEvent` for the given `event` exists.
    * **effects**: Removes the `ScheduledEvent` associated with the `event`.

* **queries**:
  * **`_getScheduleForOwner (owner: Owner): (scheduledEvents: ScheduledEvent[])`**
    * **effects**: Returns all `ScheduledEvent` objects for the given `owner`.
  * **`_getCommonEvents (owner1: Owner, owner2: Owner): (events: Event[])`**
    * **effects**: Returns the set of `Event` IDs that are present in the schedules of both `owner1` and `owner2`.

***

### # concept: CourseRegistration (Improved)

This concept is now simpler and more focused. Note the `addCourse` action no longer has the complex conflict-checking `requires` clause.

* **concept**: CourseRegistering \[Student, Course]
* **purpose**: To allow a student to browse a catalog of available courses and maintain a record of their course registrations for a term.
* **principle**: A student can be registered for any course in the catalog, and this registration can be added or removed.
* **types**: (Same as before)
* **state**: (Same as before)
  * A set of `Courses` with a `name`, `lecture` time, and optional `recitation` time.
  * A set of `Registrations` with a `student` and a `course`.
* **queries**: (Same as before)
* **actions**:
  * `defineCourse (...)`: (Same as before)
  * **`register (student: Student, course: Course): (registration: Registration)`**
    * **requires**: The course must exist. The student must not already be registered for this course.
    * **effects**: Creates a new `Registration` linking the `student` and the `course`. Returns the new `Registration`.
  * **`unregister (student: Student, course: Course)`**
    * **requires**: A `Registration` linking the specified `student` and `course` must exist.
    * **effects**: Removes the existing `Registration` for the `student` and `course`.

***

### How to Achieve the Goal: Composition via Synchronization

Now that we have two independent, robust, and reusable concepts, we compose them using `syncs` to create the desired application behavior. This logic does not live inside either concept, but in the space between them.

We assume a user's intention is captured in the `Request` pseudo-concept.

**Sync for Adding a Course**

This sync coordinates the two concepts. It tries to schedule both the lecture and recitation. If both succeed, it finalizes the registration.

```
sync AttemptCourseRegistration
when
    Request.addCourse (s, c)
where
    in CourseRegistration: course c has lecture l
    in CourseRegistration: course c has recitation r  // (handle optional case)
then
    TimeScheduler.schedule (owner: s, event: l.id, time: l.time) // Schedule the lecture
    TimeScheduler.schedule (owner: s, event: r.id, time: r.time) // Schedule the recitation

sync FinalizeCourseRegistration
when
    TimeScheduler.schedule (owner: s, event: l.id, ...)
    TimeScheduler.schedule (owner: s, event: r.id, ...)
where
    in CourseRegistration: course c has lecture l and recitation r
then
    CourseRegistration.register (student: s, course: c)
```

*(Note: A real-world sync engine might combine these or use a workflow. The key idea is that the successful scheduling actions trigger the registration action.)*

**If a time conflict exists:**

1. The `Request.addCourse` action occurs.
2. The `AttemptCourseRegistration` sync runs.
3. It calls `TimeScheduler.schedule(...)`.
4. The `requires` clause of `TimeScheduler.schedule` fails due to a conflict. The action does not occur, and instead, the overloaded action returning an `(error: "...")` result is produced.
5. The `when` clause of the `FinalizeCourseRegistration` sync never matches, because the successful `TimeScheduler.schedule` actions never happened.
6. The `CourseRegistration.register` action is never called. The application can then report the conflict error to the user.

**Sync for Removing a Course**

When a student removes a course, we must also free up their time slots in the scheduler.

```
sync RemoveCourseRegistration
when
    Request.removeCourse (s, c)
where
    in CourseRegistration: registration for student s and course c exists
    in CourseRegistration: course c has lecture l and recitation r
then
    CourseRegistration.unregister (student: s, course: c)
    TimeScheduler.unschedule (event: l.id)
    TimeScheduler.unschedule (event: r.id)
```

### Summary of Improvements

By restructuring this way, you gain all the benefits of concept design:

1. **Improved Separation of Concerns**: `TimeScheduler` only handles time. `CourseRegistration` only handles registrations. The logic is clean.
2. **Greater Reusability**: The `TimeScheduler` concept is now a general-purpose utility. You could reuse it to schedule appointments, reserve meeting rooms, or plan office hours, all without touching the `CourseRegistration` code.
3. **Simpler and More Robust Concepts**: Each concept is simpler because it does less. The `requires` clauses are easier to reason about, making the concepts more robust and easier to test in isolation.
4. **Clear Application Logic**: The complex interaction logic is now explicitly defined in the `syncs`, making it clear how the concepts work together to achieve the application's goals.
