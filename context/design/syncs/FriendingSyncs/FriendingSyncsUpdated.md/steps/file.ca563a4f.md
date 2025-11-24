---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: ca563a4fd2742c5a8479e63238004dc0291c1ce5a576699a0640cc4b9a0c3366
---

# file: src/concepts/CourseCatalog/CourseCatalogConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "CourseCatalog" + ".";

// Event here is the specific instance (e.g., CS101 Lecture A)
type EventID = ID;

interface MeetingTime {
  days: string[]; // e.g. ["Monday", "Wednesday"]
  startTime: string; // "14:00"
  endTime: string; // "15:30"
}

interface CourseEvent {
  _id: EventID;
  type: string; // "Lecture", "Recitation", "Lab"
  times: MeetingTime;
}

interface Course {
  _id: ID;
  name: string;
  events: CourseEvent[];
}

export default class CourseCatalogConcept {
  courses: Collection<Course>;

  constructor(private readonly db: Db) {
    this.courses = this.db.collection(PREFIX + "courses");
  }

  async defineCourse({ name, events }: { name: string; events: Array<{ type: string; times: MeetingTime }> }): Promise<{ course: ID } | { error: string }> {
    const existing = await this.courses.findOne({ name });
    if (existing) return { error: "Course with this name already exists" };

    const courseEvents: CourseEvent[] = events.map(e => ({
      _id: freshID(),
      type: e.type,
      times: e.times
    }));

    const courseId = freshID();
    await this.courses.insertOne({
      _id: courseId,
      name,
      events: courseEvents
    });

    return { course: courseId };
  }

  async removeCourse({ course }: { course: ID }): Promise<Empty | { error: string }> {
    const res = await this.courses.deleteOne({ _id: course });
    if (res.deletedCount === 0) return { error: "Course not found" };
    return {};
  }

  async _getAllCourses(_: Empty): Promise<{ course: ID, name: string, events: CourseEvent[] }[]> {
    const all = await this.courses.find({}).toArray();
    return all.map(c => ({
      course: c._id,
      name: c.name,
      events: c.events
    }));
  }

  async _getCourseInfo({ courses }: { courses: ID[] }): Promise<{ name: string, events: CourseEvent[] }[]> {
    const found = await this.courses.find({ _id: { $in: courses } }).toArray();
    return found.map(c => ({ name: c.name, events: c.events }));
  }
  
  // Helper to find an event within courses
  async _getEventInfo({ event }: { event: EventID }): Promise<{ event: EventID, name: string, type: string, times: MeetingTime }[]> {
    const course = await this.courses.findOne({ "events._id": event });
    if (!course) return [];
    const evt = course.events.find(e => e._id === event);
    if (!evt) return [];
    
    return [{
        event: evt._id,
        name: course.name,
        type: evt.type,
        times: evt.times
    }];
  }
}
```
