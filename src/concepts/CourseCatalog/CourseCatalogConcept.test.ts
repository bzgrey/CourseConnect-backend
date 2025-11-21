import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import CourseCatalogConcept from "./CourseCatalogConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("CourseCatalogConcept", async (t) => {
  await t.step("Action: defineCourse", async (t) => {
    await t.step(
      "should create a course when requirements are met",
      async () => {
        console.log("  - Testing: defineCourse success case");
        const [db, client] = await testDb();
        const catalog = new CourseCatalogConcept(db);

        const courseName = "Intro to Concepts";
        const events = [
          {
            type: "Lecture",
            times: {
              days: ["Monday", "Wednesday"],
              startTime: "10:00",
              endTime: "11:30",
            },
          },
          {
            type: "Recitation",
            times: { days: ["Friday"], startTime: "10:00", endTime: "11:00" },
          },
        ];

        console.log(`    Action: defineCourse({ name: "${courseName}" })`);
        const result = await catalog.defineCourse({ name: courseName, events });
        console.log("    Result:", result);

        assertEquals(
          (result as { error: string }).error,
          undefined,
          "Action should not return an error",
        );
        const { course } = result as { course: ID };
        assertExists(course);

        console.log("    Effect: Verifying course and events were created");
        const courseInfo = await catalog._getCourseInfo({ courses: [course] });
        console.log("    Query Result (_getCourseInfo):", courseInfo);

        assertEquals(courseInfo.length, 1);
        assertEquals(courseInfo[0].name, courseName);
        assertEquals(courseInfo[0].events.length, 2);
        assertEquals(
          courseInfo[0].events.some((e) => e.type === "Lecture"),
          true,
        );
        assertEquals(
          courseInfo[0].events.some((e) => e.type === "Recitation"),
          true,
        );

        await client.close();
      },
    );

    await t.step(
      "should fail if a course with the same name already exists",
      async () => {
        console.log(
          "  - Testing: defineCourse requirement failure (duplicate name)",
        );
        const [db, client] = await testDb();
        const catalog = new CourseCatalogConcept(db);

        const courseName = "Intro to Concepts";
        const events = [{
          type: "Lecture",
          times: { days: ["Monday"], startTime: "09:00", endTime: "10:00" },
        }];

        console.log(
          `    Action: defineCourse({ name: "${courseName}" }) - First call (should succeed)`,
        );
        await catalog.defineCourse({ name: courseName, events });

        console.log(
          `    Action: defineCourse({ name: "${courseName}" }) - Second call (should fail)`,
        );
        const result = await catalog.defineCourse({ name: courseName, events });
        console.log("    Result:", result);

        assertExists((result as { error: string }).error);
        assertEquals(
          (result as { error: string }).error,
          `Course with name '${courseName}' already exists`,
        );

        await client.close();
      },
    );

    await t.step(
      "should fail if an event has an invalid meeting time",
      async () => {
        console.log(
          "  - Testing: defineCourse requirement failure (invalid times)",
        );
        const [db, client] = await testDb();
        const catalog = new CourseCatalogConcept(db);

        const courseName = "Invalid Course";
        const events = [{
          type: "Lecture",
          times: { days: ["Tuesday"], startTime: "14:00", endTime: "13:00" },
        }];

        console.log(
          `    Action: defineCourse({ name: "${courseName}", events: [...] }) with endTime < startTime`,
        );
        const result = await catalog.defineCourse({ name: courseName, events });
        console.log("    Result:", result);

        assertExists((result as { error: string }).error);
        assertEquals(
          (result as { error: string }).error,
          "Invalid meeting time: startTime must be before endTime for event of type Lecture",
        );

        await client.close();
      },
    );
  });

  await t.step("Action: removeCourse", async (t) => {
    await t.step(
      "should remove a course and its associated events",
      async () => {
        console.log("  - Testing: removeCourse success case");
        const [db, client] = await testDb();
        const catalog = new CourseCatalogConcept(db);

        const courseName = "Temporary Course";
        const events = [{
          type: "Lab",
          times: { days: ["Thursday"], startTime: "15:00", endTime: "17:00" },
        }];

        const defineResult = await catalog.defineCourse({
          name: courseName,
          events,
        });
        const { course } = defineResult as { course: ID };
        assertExists(course);
        console.log(
          `    Setup: Created course '${courseName}' with ID ${course}`,
        );

        const courseInfoBefore = await catalog._getCourseInfo({
          courses: [course],
        });
        const eventId = courseInfoBefore[0].events[0].event;

        console.log(`    Action: removeCourse({ course: "${course}" })`);
        const removeResult = await catalog.removeCourse({ course });
        console.log("    Result:", removeResult);
        assertEquals((removeResult as { error: string }).error, undefined);

        console.log("    Effect: Verifying course and events were removed");
        const allCourses = await catalog._getAllCourses();
        const eventInfo = await catalog._getEventInfo({ event: eventId });

        console.log("    Query Result (_getAllCourses):", allCourses);
        console.log(
          `    Query Result (_getEventInfo for event ${eventId}):`,
          eventInfo,
        );

        assertEquals(allCourses.some((c) => c.course === course), false);
        assertEquals(eventInfo.length, 0);

        await client.close();
      },
    );

    await t.step("should fail if the course does not exist", async () => {
      console.log(
        "  - Testing: removeCourse requirement failure (course not found)",
      );
      const [db, client] = await testDb();
      const catalog = new CourseCatalogConcept(db);
      const nonExistentCourseId = "course:12345" as ID;

      console.log(
        `    Action: removeCourse({ course: "${nonExistentCourseId}" })`,
      );
      const result = await catalog.removeCourse({
        course: nonExistentCourseId,
      });
      console.log("    Result:", result);

      assertExists((result as { error: string }).error);
      assertEquals(
        (result as { error: string }).error,
        `Course with id '${nonExistentCourseId}' not found`,
      );

      await client.close();
    });
  });

  await t.step("Principle: define and access course information", async () => {
    console.log(
      "\n- Testing Principle: One can define courses with their given information and then access the information to each course",
    );
    const [db, client] = await testDb();
    const catalog = new CourseCatalogConcept(db);

    console.log("  Step 1: Define multiple courses in the catalog.");
    const course1 = {
      name: "Intro to Programming",
      events: [{
        type: "Lecture",
        times: { days: ["M", "W", "F"], startTime: "10:00", endTime: "11:00" },
      }],
    };
    const course2 = {
      name: "Data Structures",
      events: [
        {
          type: "Lecture",
          times: { days: ["T", "Th"], startTime: "14:30", endTime: "16:00" },
        },
        {
          type: "Lab",
          times: { days: ["W"], startTime: "13:00", endTime: "15:00" },
        },
      ],
    };

    console.log(`    Action: defineCourse({ name: "${course1.name}" })`);
    const result1 = await catalog.defineCourse(course1);
    const course1Id = (result1 as { course: ID }).course;

    console.log(`    Action: defineCourse({ name: "${course2.name}" })`);
    const result2 = await catalog.defineCourse(course2);
    const course2Id = (result2 as { course: ID }).course;

    console.log(
      "\n  Step 2: Access the information for all and individual courses.",
    );

    console.log("    Query: _getAllCourses()");
    const allCourses = await catalog._getAllCourses();
    console.log("    Result:", allCourses);

    assertEquals(allCourses.length, 2);
    assertEquals(allCourses.some((c) => c.name === course1.name), true);
    assertEquals(allCourses.some((c) => c.name === course2.name), true);

    console.log(`    Query: _getCourseInfo({ courses: ["${course2Id}"] })`);
    const dsCourseInfo = await catalog._getCourseInfo({ courses: [course2Id] });
    console.log("    Result:", dsCourseInfo);

    assertEquals(dsCourseInfo.length, 1);
    assertEquals(dsCourseInfo[0].name, course2.name);
    assertEquals(dsCourseInfo[0].events.length, 2);

    const labEvent = dsCourseInfo[0].events.find((e) => e.type === "Lab");
    assertExists(labEvent);
    const labEventId = labEvent.event;

    console.log(`    Query: _getEventInfo({ event: "${labEventId}" })`);
    const labEventInfo = await catalog._getEventInfo({ event: labEventId });
    console.log("    Result:", labEventInfo);
    assertEquals(labEventInfo.length, 1);
    assertEquals(labEventInfo[0].name, course2.name);
    assertEquals(labEventInfo[0].type, "Lab");

    console.log("\n- Principle successfully demonstrated.");
    await client.close();
  });
});
