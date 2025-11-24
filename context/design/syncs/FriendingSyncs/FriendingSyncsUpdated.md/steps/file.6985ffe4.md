---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 6985ffe45fd8459bfa2200232052bdd2f70420ea408b3b11afefc0eb41d452af
---

# file: src/concepts/Scheduling/SchedulingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Scheduling" + ".";
type User = ID;
type Event = ID;

interface Schedule {
  _id: ID;
  user: User;
  events: Event[];
}

export default class SchedulingConcept {
  schedules: Collection<Schedule>;

  constructor(private readonly db: Db) {
    this.schedules = this.db.collection(PREFIX + "schedules");
  }

  async createSchedule({ user }: { user: User }): Promise<{ schedule: ID } | { error: string }> {
    const existing = await this.schedules.findOne({ user });
    if (existing) return { error: "User already has a schedule" };

    const id = freshID();
    await this.schedules.insertOne({ _id: id, user, events: [] });
    return { schedule: id };
  }

  async scheduleEvent({ user, event }: { user: User; event: Event }): Promise<Empty | { error: string }> {
    const res = await this.schedules.updateOne(
      { user },
      { $addToSet: { events: event } }
    );
    if (res.matchedCount === 0) return { error: "User has no schedule" };
    return {};
  }

  async unscheduleEvent({ user, event }: { user: User; event: Event }): Promise<Empty | { error: string }> {
    const res = await this.schedules.updateOne(
      { user },
      { $pull: { events: event } }
    );
    if (res.matchedCount === 0) return { error: "User has no schedule" };
    return {};
  }

  async _getUserSchedule({ user }: { user: User }): Promise<{ events: Event[] }[]> {
    const schedule = await this.schedules.findOne({ user });
    if (!schedule) return [];
    return [{ events: schedule.events }];
  }

  async _getScheduleComparison({ user1, user2 }: { user1: User; user2: User }): Promise<{ events: Event[] }[]> {
    const s1 = await this.schedules.findOne({ user: user1 });
    const s2 = await this.schedules.findOne({ user: user2 });

    if (!s1 || !s2) return [];

    const common = s1.events.filter(e => s2.events.includes(e));
    return [{ events: common }];
  }
}
```
