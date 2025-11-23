---
timestamp: 'Sun Nov 23 2025 10:07:00 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251123_100700.53366497.md]]'
content_id: dc77bedf75843465c614dec3f1e6a01ce9f617eb55230341b3f6cae17f153fb4
---

# file: src/concepts/CourseCatalog/CourseCatalogConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "CourseCatalog" + ".";

// Generic parameter from concept spec
type Event = ID;

// Locally defined types
type Course = ID;
type Time = string; // Represented as "HH:mm"

/**
 * Type for meeting time information
 */
interface MeetingTime {
  days: string[]; // e.g., ["Tuesday", "Thursday"]
  startTime: Time;
  endTime: Time;
}

/**
 * State for a set of Courses with
 * - a name String
 * - a set of Events
 */
interface CourseDoc {
  _id: Course;
  name: string;
  events: Event[];
}

/**
 * State for a set of Events with
 * - a Course (the course that this is part of)
 * - a type String (one of Lecture/Recitation/Lab)
 * - a MeetingTime
 */
interface EventDoc {
  _id: Event;
  course: Course;
  type: string;
  times: MeetingTime;
}

/**
 * @concept CourseCatalog
 * @purpose Track the courses offered in a school with all of the information for each course regarding times, class types, name
 */
export default class CourseCatalogConcept {
  public readonly courses: Collection<CourseDoc>;
  public readonly events: Collection<EventDoc>;

  constructor(private readonly db: Db) {
    this.courses = this.db.collection(PREFIX + "courses");
    this.events = this.db.collection(PREFIX + "events");
  }

  /**
   * Helper to convert "HH:mm" time string to minutes from midnight for comparison.
   */
  private timeToMinutes(time: Time): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * defineCourse (name: String, events: (type: String, times: MeetingTime)[]): (course: Course)
   *
   * **requires**: For each meeting time provided, `startTime < endTime`. Course with given name doesn't exist.
   * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times. This is typically an administrative action.
   */
  async defineCourse(
    { name, events }: { name: string; events: { type: string; times: MeetingTime }[] },
  ): Promise<{ course: Course } | { error: string }> {
    // Requires: Course with given name doesn't exist
    const existingCourse = await this.courses.findOne({ name });
    if (existingCourse) {
      return { error: `Course with name '${name}' already exists` };
    }

    // Requires: For each meeting time provided, startTime < endTime
    for (const event of events) {
      if (this.timeToMinutes(event.times.startTime) >= this.timeToMinutes(event.times.endTime)) {
        return { error: `Invalid meeting time: startTime must be before endTime for event of type ${event.type}` };
      }
    }

    // Effects: Creates a new course and its associated events
    const newCourseId = freshID() as Course;
    const newEventDocs: EventDoc[] = [];
    const newEventIds: Event[] = [];

    for (const event of events) {
      const newEventId = freshID() as Event;
      newEventIds.push(newEventId);
      newEventDocs.push({
        _id: newEventId,
        course: newCourseId,
        type: event.type,
        times: event.times,
      });
    }

    const newCourseDoc: CourseDoc = {
      _id: newCourseId,
      name,
      events: newEventIds,
    };

    await this.courses.insertOne(newCourseDoc);
    if (newEventDocs.length > 0) {
      await this.events.insertMany(newEventDocs);
    }

    return { course: newCourseId };
  }

  /**
   * removeCourse (course: Course)
   *
   * **requires**: course exists
   * **effects**: removes course from set of courses and each of its events from the set of events
   */
  async removeCourse({ course }: { course: Course }): Promise<Empty | { error: string }> {
    // Requires: course exists
    const courseDoc = await this.courses.findOne({ _id: course });
    if (!courseDoc) {
      return { error: `Course with id '${course}' not found` };
    }

    // Effects: removes course and its events
    if (courseDoc.events.length > 0) {
      await this.events.deleteMany({ _id: { $in: courseDoc.events } });
    }
    await this.courses.deleteOne({ _id: course });

    return {};
  }

  /**
   * _getAllCourses (): (courses: (course, name: String, events: (Event, type: String, times: MeetingTime))[])
   *
   * **effects**: Returns all `Courses` in the catalog with their information.
   */
  async _getAllCourses(): Promise<{
    course: Course;
    name: string;
    events: { event: Event; type: string; times: MeetingTime }[];
  }[]> {
    const pipeline = [
      {
        $lookup: {
          from: this.events.collectionName,
          localField: "events",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      {
        $project: {
          _id: 0,
          course: "$_id",
          name: "$name",
          events: {
            $map: {
              input: "$eventDetails",
              as: "e",
              in: {
                event: "$$e._id",
                type: "$$e.type",
                times: "$$e.times",
              },
            },
          },
        },
      },
    ];
    return await this.courses.aggregate(pipeline).toArray();
  }

  /**
   * _getCourseInfo (courses: Course[]): (name: String, events: (Event, type: String, times: MeetingTime))[]
   *
   * **requires**: courses exist
   * **effects**: returns the course info for each course
   */
  async _getCourseInfo({ courses }: { courses: Course[] }): Promise<{
    name: string;
    events: { event: Event; type: string; times: MeetingTime }[];
  }[]> {
    const pipeline = [
      {
        $match: {
          _id: { $in: courses },
        },
      },
      {
        $lookup: {
          from: this.events.collectionName,
          localField: "events",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$name",
          events: {
            $map: {
              input: "$eventDetails",
              as: "e",
              in: {
                event: "$$e._id",
                type: "$$e.type",
                times: "$$e.times",
              },
            },
          },
        },
      },
    ];
    return await this.courses.aggregate(pipeline).toArray();
  }

  /**
   * _getEventInfo (event: Event): (event: Event, name: String, type: String, times: MeetingTime)[]
   *
   * **requires**: event exists
   * **effects**: returns the MeetingTimes for given event
   */
  async _getEventInfo({ event }: { event: Event }): Promise<{
    event: Event;
    name: string;
    type: string;
    times: MeetingTime;
  }[]> {
    const eventDoc = await this.events.findOne({ _id: event });
    if (!eventDoc) {
      return [];
    }

    const courseDoc = await this.courses.findOne({ _id: eventDoc.course });
    if (!courseDoc) {
      // This indicates data inconsistency, but we return an empty array as per robust query behavior.
      return [];
    }

    return [
      {
        event: eventDoc._id,
        name: courseDoc.name,
        type: eventDoc.type,
        times: eventDoc.times,
      },
    ];
  }
}
```
