---
timestamp: 'Tue Nov 18 2025 12:41:35 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251118_124135.4df0e2a2.md]]'
content_id: b8d8cb365b3c26276ce24a8d28a26a14d14fe042335d8d107edc2b1b59cb5947
---

# file: src/concepts/CourseScheduling/CourseSchedulingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "CourseScheduling" + ".";

// Generic types from concept signature
type User = ID;
type Event = ID;

// Custom types from concept spec
type Course = ID;
type Schedule = ID;

type Time = string; // e.g., "14:30" for 2:30 PM

/**
 * Type for a meeting time, including days of the week and start/end times.
 */
interface MeetingTime {
  days: string[]; // e.g., ["Tuesday", "Thursday"]
  startTime: Time;
  endTime: Time;
}

// Collection interface definitions based on concept state

/**
 * a set of Courses with
 *   a name String
 *   a set of lecture Events
 *   a set of recitation Events
 *   a set of lab Events
 */
interface CourseDoc {
  _id: Course;
  name: string;
  lectures: Event[];
  recitations: Event[];
  labs: Event[];
}

/**
 * An Event, which simply contains a MeetingTime.
 */
interface EventDoc {
  _id: Event;
  meetingTime: MeetingTime;
}

/**
 * a set of Users with
 *   a Schedule
 */
interface UserDoc {
  _id: User;
  schedule: Schedule;
}

/**
 * a set of Schedules with
 *   a user User
 *   a set of (name, Event, type) tuples
 */
interface ScheduleDoc {
  _id: Schedule;
  user: User;
  events: {
    name: string; // Course name or custom name
    event: Event;
    type: string; // "Lecture", "Recitation", "Lab", "Other"
  }[];
}

/**
 * @concept CourseScheduling [User, Event]
 * @purpose Track events in a student's course schedule and compare with others
 * @principle If a user adds different events to their schedule, they can then compare schedules and see which events they have in common.
 */
export default class CourseSchedulingConcept {
  public readonly courses: Collection<CourseDoc>;
  public readonly events: Collection<EventDoc>;
  public readonly users: Collection<UserDoc>;
  public readonly schedules: Collection<ScheduleDoc>;

  constructor(private readonly db: Db) {
    this.courses = this.db.collection(PREFIX + "courses");
    this.events = this.db.collection(PREFIX + "events");
    this.users = this.db.collection(PREFIX + "users");
    this.schedules = this.db.collection(PREFIX + "schedules");
  }

  /**
   * createSchedule (user: User): (schedule: Schedule)
   *
   * **requires**: The given `user` does not already have a schedule.
   * **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
   */
  async createSchedule({ user }: { user: User }): Promise<{ schedule: Schedule } | { error: string }> {
    const existingUser = await this.users.findOne({ _id: user });
    if (existingUser && existingUser.schedule) {
      return { error: `User ${user} already has a schedule.` };
    }

    const newScheduleId = freshID() as Schedule;

    await this.schedules.insertOne({
      _id: newScheduleId,
      user: user,
      events: [],
    });

    await this.users.updateOne({ _id: user }, { $set: { schedule: newScheduleId } }, { upsert: true });

    return { schedule: newScheduleId };
  }

  /**
   * addEvent (user: User, event: Event, name: String, type: String)
   *
   * **requires**: The `user` has a schedule; the `event` isn't already in the schedule
   * **effects**: Adds the `event` to the `user`'s schedule with the corresponding name and type.
   */
  async addEvent({ user, event, name, type }: { user: User; event: Event; name: string; type: string }): Promise<Empty | { error: string }> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc || !userDoc.schedule) {
      return { error: `User ${user} does not have a schedule.` };
    }
    const scheduleId = userDoc.schedule;

    const scheduleDoc = await this.schedules.findOne({ _id: scheduleId, "events.event": event });
    if (scheduleDoc) {
      return { error: `Event ${event} is already in the user's schedule.` };
    }

    const eventDoc = await this.events.findOne({ _id: event });
    if (!eventDoc) {
      return { error: `Event with id ${event} not found.` };
    }

    await this.schedules.updateOne({ _id: scheduleId }, { $push: { events: { event, name, type } } });

    return {};
  }

  /**
   * removeEvent (user: User, event: Event)
   *
   * **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
   * **effects**: Removes the `event` from the `user`'s schedule.
   */
  async removeEvent({ user, event }: { user: User; event: Event }): Promise<Empty | { error: string }> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc || !userDoc.schedule) {
      return { error: `User ${user} does not have a schedule.` };
    }
    const scheduleId = userDoc.schedule;

    const scheduleDoc = await this.schedules.findOne({ _id: scheduleId, "events.event": event });
    if (!scheduleDoc) {
      return { error: `Event ${event} is not in the user's schedule.` };
    }

    await this.schedules.updateOne({ _id: scheduleId }, { $pull: { events: { event: event } } });

    return {};
  }

  /**
   * defineCourse (name: String, lectures: MeetingTime[], recitations: MeetingTime[], labs: MeetingTime[]): (course: Course)
   *
   * **requires**: For each meeting time provided, `startTime < endTime`. Course with given name doesn't exist.
   * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times.
   */
  async defineCourse({ name, lectures, recitations, labs }: { name: string; lectures: MeetingTime[]; recitations: MeetingTime[]; labs: MeetingTime[] }): Promise<{ course: Course } | { error: string }> {
    const allTimes = [...lectures, ...recitations, ...labs];
    for (const mt of allTimes) {
      if (mt.startTime >= mt.endTime) {
        return { error: `Invalid meeting time: startTime ${mt.startTime} must be before endTime ${mt.endTime}.` };
      }
    }

    const existingCourse = await this.courses.findOne({ name });
    if (existingCourse) {
      return { error: `Course with name "${name}" already exists.` };
    }

    const createEventDocs = (times: MeetingTime[]) => times.map((meetingTime) => ({ _id: freshID() as Event, meetingTime }));

    const lectureEventDocs = createEventDocs(lectures);
    const recitationEventDocs = createEventDocs(recitations);
    const labEventDocs = createEventDocs(labs);

    const allEventDocs = [...lectureEventDocs, ...recitationEventDocs, ...labEventDocs];
    if (allEventDocs.length > 0) {
      await this.events.insertMany(allEventDocs);
    }

    const newCourseId = freshID() as Course;
    await this.courses.insertOne({
      _id: newCourseId,
      name: name,
      lectures: lectureEventDocs.map((e) => e._id),
      recitations: recitationEventDocs.map((e) => e._id),
      labs: labEventDocs.map((e) => e._id),
    });

    return { course: newCourseId };
  }

  /**
   * _getAllCourses (): (courses: Course[])
   *
   * **effects**: Returns all `Course` objects in the catalog.
   */
  async _getAllCourses(): Promise<CourseDoc[]> {
    return this.courses.find().toArray();
  }

  /**
   * _getCourseDetails (courses: Course[]): (name: String, lectures: Event[], recitations: Event[], labs: Event[])[]
   *
   * **requires**: The specified `courses` must exist.
   * **effects**: Returns the name and time information of each course.
   */
  async _getCourseDetails({ courses }: { courses: Course[] }): Promise<{ name: string; lectures: Event[]; recitations: Event[]; labs: Event[]; }[]> {
    const courseDocs = await this.courses.find({ _id: { $in: courses } }).project({ name: 1, lectures: 1, recitations: 1, labs: 1, _id: 0 }).toArray();
    return courseDocs as { name: string; lectures: Event[]; recitations: Event[]; labs: Event[]; }[];
  }

  /**
   * _getUserSchedule(user: User):(name: String, event: Event, type: String, times: MeetingTime)[]
   *
   * **requires**: The `user` has a schedule.
   * **effects**: Returns a set of all events in the user's schedule with their names and times.
   */
  async _getUserSchedule({ user }: { user: User }): Promise<{ name: string; event: Event; type: string; times: MeetingTime; }[]> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc || !userDoc.schedule) {
      return [];
    }

    const pipeline = [
      { $match: { _id: userDoc.schedule } },
      { $unwind: "$events" },
      {
        $lookup: {
          from: this.events.collectionName,
          localField: "events.event",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          _id: 0,
          name: "$events.name",
          event: "$events.event",
          type: "$events.type",
          times: "$eventDetails.meetingTime",
        },
      },
    ];

    return this.schedules.aggregate(pipeline).toArray() as Promise<{ name: string; event: Event; type: string; times: MeetingTime; }[]>;
  }

  /**
   * _getScheduleComparison (user1: User, user2: User): (events: Event[])
   *
   * **requires**: Both `user1` and `user2` have schedules.
   * **effects**: Returns the common event id's between the schedules of user1 and user2.
   */
  async _getScheduleComparison({ user1, user2 }: { user1: User; user2: User }): Promise<{ events: Event[] }[]> {
    const [schedule1, schedule2] = await Promise.all([this.schedules.findOne({ user: user1 }), this.schedules.findOne({ user: user2 })]);

    if (!schedule1 || !schedule2) {
      return [];
    }

    const events1 = new Set(schedule1.events.map((e) => e.event));
    const commonEvents: Event[] = schedule2.events.filter((e) => events1.has(e.event)).map((e) => e.event);

    // The return type `{ events: Event[] }[]` is unusual, but follows the guide's interpretation of query signatures.
    // It returns a single-element array containing an object with the list of common events.
    return [{ events: commonEvents }];
  }
}
```
