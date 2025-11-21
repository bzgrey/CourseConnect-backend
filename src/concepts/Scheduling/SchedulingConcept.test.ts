import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import SchedulingConcept from "./SchedulingConcept.ts";
import { ID } from "@utils/types.ts";

// Define mock IDs for testing
const userA = "user:Alice" as ID;
const userB = "user:Bob" as ID;
const event1 = "event:concert" as ID;
const event2 = "event:meeting" as ID;
const event3 = "event:dinner" as ID;

Deno.test("SchedulingConcept: Actions and Principle", async (t) => {
  // Test `createSchedule` action
  await t.step("Action: createSchedule", async (t) => {
    const [db, client] = await testDb();
    const scheduling = new SchedulingConcept(db);

    await t.step("should create a new schedule for a user", async () => {
      console.log("  - Testing successful schedule creation for userA");
      const result = await scheduling.createSchedule({ user: userA });
      assertEquals(
        (result as { error: string }).error,
        undefined,
        "Expected a schedule ID, not an error.",
      );
      const { schedule } = result as { schedule: ID };
      assertExists(schedule);

      // Verify effects: check state in database
      const userDoc = await scheduling.users.findOne({ _id: userA });
      assertEquals(userDoc?.schedule, schedule);

      const scheduleDoc = await scheduling.schedules.findOne({ _id: schedule });
      assertEquals(scheduleDoc?.events, []);
      console.log(
        "  - Verified: user and schedule documents created correctly.",
      );
    });

    await t.step(
      "should fail if the user already has a schedule (requires)",
      async () => {
        console.log("  - Testing failure case: userA already has a schedule");
        // First, create a schedule
        await scheduling.createSchedule({ user: userA });
        // Then, try to create another one
        const result = await scheduling.createSchedule({ user: userA });
        const { error } = result as { error: string };
        assertExists(error);
        assertEquals(error, `User ${userA} already has a schedule.`);
        console.log("  - Verified: action returned the expected error.");
      },
    );

    await client.close();
  });

  // Test `scheduleEvent` and `unscheduleEvent` actions
  await t.step("Actions: scheduleEvent and unscheduleEvent", async (t) => {
    const [db, client] = await testDb();
    const scheduling = new SchedulingConcept(db);

    // Setup: create a schedule for userA
    const { schedule } = (await scheduling.createSchedule({ user: userA })) as {
      schedule: ID;
    };

    await t.step(
      "scheduleEvent should add an event to a user's schedule",
      async () => {
        console.log("  - Testing scheduling a new event for userA");
        const result = await scheduling.scheduleEvent({
          user: userA,
          event: event1,
        });
        assertEquals(result, {});

        // Verify effects
        const scheduleDoc = await scheduling.schedules.findOne({
          _id: schedule,
        });
        assertEquals(scheduleDoc?.events, [event1]);
        console.log("  - Verified: event was added to the schedule.");
      },
    );

    await t.step("scheduleEvent should not add a duplicate event", async () => {
      console.log("  - Testing scheduling the same event again for userA");
      await scheduling.scheduleEvent({ user: userA, event: event1 }); // First time
      await scheduling.scheduleEvent({ user: userA, event: event1 }); // Second time
      const scheduleDoc = await scheduling.schedules.findOne({ _id: schedule });
      assertEquals(scheduleDoc?.events.length, 1);
      console.log("  - Verified: schedule does not contain duplicate events.");
    });

    await t.step(
      "unscheduleEvent should remove an event from a user's schedule",
      async () => {
        console.log("  - Testing unscheduling an event for userA");
        await scheduling.scheduleEvent({ user: userA, event: event1 }); // Ensure it's there
        const result = await scheduling.unscheduleEvent({
          user: userA,
          event: event1,
        });
        assertEquals(result, {});

        // Verify effects
        const scheduleDoc = await scheduling.schedules.findOne({
          _id: schedule,
        });
        assertEquals(scheduleDoc?.events, []);
        console.log("  - Verified: event was removed from the schedule.");
      },
    );

    await t.step(
      "scheduleEvent should fail if user has no schedule (requires)",
      async () => {
        console.log(
          "  - Testing failure case: scheduling event for userB (no schedule)",
        );
        const result = await scheduling.scheduleEvent({
          user: userB,
          event: event1,
        });
        const { error } = result as { error: string };
        assertExists(error);
        assertEquals(error, `User ${userB} does not have a schedule.`);
        console.log("  - Verified: action returned the expected error.");
      },
    );

    await client.close();
  });

  // Test the concept's principle
  await t.step(
    "Principle: Users can compare schedules to find common events",
    async (t) => {
      const [db, client] = await testDb();
      const scheduling = new SchedulingConcept(db);
      console.log("  - Setting up principle test scenario...");

      // 1. Create schedules for two users
      console.log("  - Action: createSchedule for userA and userB");
      await scheduling.createSchedule({ user: userA });
      await scheduling.createSchedule({ user: userB });

      // 2. Add different events to their schedules, with one in common
      console.log("  - Action: schedule events for userA (concert, meeting)");
      await scheduling.scheduleEvent({ user: userA, event: event1 }); // concert
      await scheduling.scheduleEvent({ user: userA, event: event2 }); // meeting

      console.log("  - Action: schedule events for userB (meeting, dinner)");
      await scheduling.scheduleEvent({ user: userB, event: event2 }); // meeting
      await scheduling.scheduleEvent({ user: userB, event: event3 }); // dinner

      // 3. Verify their individual schedules using the query
      const scheduleA = await scheduling._getUserSchedule({ user: userA });
      assertEquals(scheduleA.sort(), [event1, event2].sort());

      const scheduleB = await scheduling._getUserSchedule({ user: userB });
      assertEquals(scheduleB.sort(), [event2, event3].sort());
      console.log("  - Verified: individual schedules are correct.");

      // 4. Compare schedules and check for the common event
      console.log("  - Query: _getScheduleComparison for userA and userB");
      const commonEvents = await scheduling._getScheduleComparison({
        user1: userA,
        user2: userB,
      });
      assertEquals(commonEvents, [event2]);
      console.log(
        "  - Verified: comparison correctly identified the common event (meeting). Principle holds.",
      );

      await client.close();
    },
  );
});
