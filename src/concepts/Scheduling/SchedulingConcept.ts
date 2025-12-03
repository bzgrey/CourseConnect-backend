import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Define generic types for the concept
type User = ID;
type Event = ID;
type Schedule = ID;

// Define the prefix for MongoDB collections
const PREFIX = "Scheduling";

/**
 * State representation for the 'Users' set.
 * Corresponds to: a set of Users with a Schedule
 */
interface UserDoc {
  _id: User;
  schedule: Schedule;
}

/**
 * State representation for the 'Schedules' set.
 * Corresponds to: a set of Schedules with a set of Events
 */
interface ScheduleDoc {
  _id: Schedule;
  events: Event[];
}

/**
 * @concept Scheduling
 * @purpose Track events in one's schedule and compare with others
 */
export default class SchedulingConcept {
  public readonly users: Collection<UserDoc>;
  public readonly schedules: Collection<ScheduleDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection<UserDoc>(`${PREFIX}.users`);
    this.schedules = this.db.collection<ScheduleDoc>(`${PREFIX}.schedules`);
  }

  // --- ACTIONS ---

  /**
   * createSchedule (user: User): (schedule: Schedule)
   *
   * @requires The given `user` does not already have a schedule.
   * @effects Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
   */
  async createSchedule(
    { user }: { user: User },
  ): Promise<{ schedule: Schedule } | { error: string }> {
    const existingUser = await this.users.findOne({ _id: user });
    if (existingUser && existingUser.schedule) {
      return { error: `User ${user} already has a schedule.` };
    }

    const newScheduleId = freshID() as Schedule;

    await this.schedules.insertOne({
      _id: newScheduleId,
      events: [],
    });

    await this.users.insertOne({
      _id: user,
      schedule: newScheduleId,
    });

    return { schedule: newScheduleId };
  }

  /**
   * scheduleEvent (user: User, event: Event)
   *
   * @requires The `user` has a schedule.
   * @effects Adds the `event` to the `user`'s schedule.
   */
  async scheduleEvent(
    { user, event }: { user: User; event: Event },
  ): Promise<Empty | { error: string }> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return { error: `User ${user} does not have a schedule.` };
    }

    const scheduleId = userDoc.schedule;

    // Use $addToSet to add the event to the array only if it's not already present
    await this.schedules.updateOne(
      { _id: scheduleId },
      { $addToSet: { events: event } },
    );

    return {};
  }

  /**
   * unscheduleEvent (user: User, event: Event)
   *
   * @requires The `user` has a schedule, and the `event` is in the `user`'s schedule.
   * @effects Removes the `event` from the `user`'s schedule.
   */
  async unscheduleEvent(
    { user, event }: { user: User; event: Event },
  ): Promise<Empty | { error: string }> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return { error: `User ${user} does not have a schedule.` };
    }

    const scheduleId = userDoc.schedule;

    // Use $pull to remove all instances of the event from the array
    await this.schedules.updateOne(
      { _id: scheduleId },
      { $pull: { events: event } },
    );

    return {};
  }

  // --- QUERIES ---

  /**
   * _getUserSchedule(user: User): events: Event[]
   *
   * @requires The `user` has a schedule.
   * @effects Returns a set of all events (id's) in the user's schedule.
   */
  async _getUserSchedule(
    { user }: { user: User },
  ): Promise<{ event: Event }[] | { error: string }[]> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return [];
    }

    const scheduleDoc = await this.schedules.findOne({ _id: userDoc.schedule });
    if (!scheduleDoc) {
      // This indicates data inconsistency, which is an exceptional state.
      return [];
    }
    return scheduleDoc.events.map((eventId) => ({ event: eventId }));
  }

  /**
   * _getUserScheduleByCourses(user: User): courses: Course[]
   *
   * @requires The `user` has a schedule.
   * @effects Returns a set of all unique course IDs from events in the user's schedule.
   */
  async _getUserScheduleByCourses(
    { user }: { user: User },
  ): Promise<{ course: ID }[]> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      return [];
    }

    const scheduleDoc = await this.schedules.findOne({ _id: userDoc.schedule });
    if (!scheduleDoc) {
      return [];
    }

    // Get unique courses from events
    // Assuming events are stored with course information in CourseCatalog
    // We need to aggregate events to get their parent courses
    const pipeline = [
      {
        $match: {
          _id: { $in: scheduleDoc.events },
        },
      },
      {
        $group: {
          _id: "$course",
        },
      },
      {
        $project: {
          _id: 0,
          course: "$_id",
        },
      },
    ];

    const eventsCollection = this.db.collection("CourseCatalog.events");
    const courses = await eventsCollection.aggregate(pipeline).toArray();
    return courses as { course: ID }[];
  }

  /**
   * _getScheduleComparison (user1: User, user2: User): events: Event[]
   *
   * @requires Both `user1` and `user2` have schedules.
   * @effects Returns the common event id's between the schedules of user1 and user2.
   */
  async _getScheduleComparison(
    { user1, user2 }: { user1: User; user2: User },
  ): Promise<{ event: Event }[]> {
    const [user1Doc, user2Doc] = await Promise.all([
      this.users.findOne({ _id: user1 }),
      this.users.findOne({ _id: user2 }),
    ]);

    if (!user1Doc || !user2Doc) {
      return [];
    }

    const [schedule1, schedule2] = await Promise.all([
      this.schedules.findOne({ _id: user1Doc.schedule }),
      this.schedules.findOne({ _id: user2Doc.schedule }),
    ]);

    if (!schedule1 || !schedule2) {
      return [];
    }

    // Find the intersection of the two event arrays
    const events1Set = new Set(schedule1.events);
    const commonEvents = schedule2.events.filter((event) =>
      events1Set.has(event)
    );

    return commonEvents.map((event) => ({ event }));
  }
}
