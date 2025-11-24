---
timestamp: 'Sun Nov 23 2025 21:20:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251123_212017.9c3c2991.md]]'
content_id: 129e29ed5f19042c174796f06c6d54bf4e5c59a16e7e1d7c78a77dd296ee035c
---

# file: src/concepts/Scheduling/SchedulingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Scheduling.";

// Generic types
type User = ID;
type Event = ID;
type Schedule = ID;

/**
 * state:
 * a set of Users with
 *   a Schedule
 * a set of Schedules with
 *   a set of Events
 *
 * Implementation:
 * We map this to a single collection where the document represents the Schedule,
 * uniquely tied to a User, containing an array of Events.
 */
interface ScheduleDoc {
  _id: Schedule;
  user: User;
  events: Event[];
}

export default class SchedulingConcept {
  schedules: Collection<ScheduleDoc>;

  constructor(private readonly db: Db) {
    this.schedules = this.db.collection(PREFIX + "schedules");
  }

  /**
   * createSchedule (user: User): (schedule: Schedule)
   *
   * **requires**: The given `user` does not already have a schedule.
   * **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
   */
  async createSchedule(
    { user }: { user: User },
  ): Promise<{ schedule: Schedule } | { error: string }> {
    const existing = await this.schedules.findOne({ user });
    if (existing) {
      return { error: "User already has a schedule" };
    }

    const _id = freshID();
    await this.schedules.insertOne({
      _id,
      user,
      events: [],
    });

    return { schedule: _id };
  }

  /**
   * scheduleEvent (user: User, event: Event)
   *
   * **requires**: The `user` has a schedule
   * **effects**: Adds the `event` to the `user`'s schedule.
   */
  async scheduleEvent(
    { user, event }: { user: User; event: Event },
  ): Promise<Empty | { error: string }> {
    const result = await this.schedules.updateOne(
      { user },
      { $addToSet: { events: event } },
    );

    if (result.matchedCount === 0) {
      return { error: "User does not have a schedule" };
    }

    return {};
  }

  /**
   * unscheduleEvent (user: User, event: Event)
   *
   * **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
   * **effects**: Removes the `event` from the `user`'s schedule.
   */
  async unscheduleEvent(
    { user, event }: { user: User; event: Event },
  ): Promise<Empty | { error: string }> {
    const result = await this.schedules.updateOne(
      { user },
      { $pull: { events: event } },
    );

    if (result.matchedCount === 0) {
      return { error: "User does not have a schedule" };
    }

    return {};
  }

  /**
   * _getUserSchedule(user: User): events: Event[]
   *
   * **requires**: The `user` has a schedule.
   * **effects**: Returns a set of all events (id's) in the user's schedule
   */
  async _getUserSchedule(
    { user }: { user: User },
  ): Promise<Array<{ events: Event[] }>> {
    const doc = await this.schedules.findOne({ user });
    if (!doc) {
      return [];
    }
    return [{ events: doc.events }];
  }

  /**
   * _getScheduleComparison (user1: User, user2: User): events: Event[]
   *
   * **requires**: Both `user1` and `user2` have schedules.
   * **effects**: Returns the common event id's between the schedules of user1 and user2
   */
  async _getScheduleComparison(
    { user1, user2 }: { user1: User; user2: User },
  ): Promise<Array<{ events: Event[] }>> {
    const s1 = await this.schedules.findOne({ user: user1 });
    const s2 = await this.schedules.findOne({ user: user2 });

    if (!s1 || !s2) {
      return [];
    }

    // Calculate intersection
    const set2 = new Set(s2.events);
    const intersection = s1.events.filter((e) => set2.has(e));

    return [{ events: intersection }];
  }
}
```
