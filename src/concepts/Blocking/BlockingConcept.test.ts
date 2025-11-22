
import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import BlockingConcept from "./BlockingConcept.ts";

Deno.test("BlockingConcept", async (t) => {
  const [db, client] = await testDb();
  const concept = new BlockingConcept(db);

  // Define some users for testing
  const userA = "user:A" as ID;
  const userB = "user:B" as ID;
  const userC = "user:C" as ID;

  await t.step("Action: blockUser", async (t) => {
    await t.step("should allow a user to block another user", async () => {
      console.log(`  - Test: ${userA} blocks ${userB}`);
      const result = await concept.blockUser({ blocker: userA, userToBlock: userB });
      assertEquals(result, {}, "Action should succeed with an empty object.");

      console.log("  - Confirming effects:");
      const isBlocked = await concept._isUserBlocked({ primaryUser: userA, secondaryUser: userB });
      assertEquals(isBlocked, [{ result: true }], `${userA} should have ${userB} blocked.`);
      console.log(`    - Verified: ${userA} has blocked ${userB}.`);

      const blockedList = await concept._blockedUsers({ user: userA });
      assertEquals(blockedList, [{ user: userB }], `_blockedUsers for ${userA} should contain ${userB}.`);
      console.log(`    - Verified: ${userA}'s block list contains ${userB}.`);
    });

    await t.step("should be idempotent (blocking the same user again has no new effect)", async () => {
      console.log(`  - Test: ${userA} blocks ${userB} again.`);
      const result = await concept.blockUser({ blocker: userA, userToBlock: userB });
      assertEquals(result, {}, "Action should succeed again.");

      console.log("  - Confirming effects:");
      const blockedList = await concept._blockedUsers({ user: userA });
      assertEquals(blockedList, [{ user: userB }], `Block list should still only contain ${userB} once.`);
      console.log(`    - Verified: ${userA}'s block list is unchanged and correct.`);
    });

    await t.step("should prevent a user from blocking themselves (violates requires)", async () => {
      console.log(`  - Test: ${userA} attempts to block ${userA}.`);
      const result = await concept.blockUser({ blocker: userA, userToBlock: userA });
      assertNotEquals(result, {}, "Action should fail.");
      assertEquals("error" in result, true, "Result should contain an error key.");
      console.log(`    - Verified: Action returned error: "${result.error}"`);

      console.log("  - Confirming no state change:");
      const isBlocked = await concept._isUserBlocked({ primaryUser: userA, secondaryUser: userA });
      assertEquals(isBlocked, [{ result: false }], "A user cannot be blocked by themselves.");
      console.log(`    - Verified: ${userA} has not blocked ${userA}.`);
    });
  });

  await t.step("Action: unblockUser", async (t) => {
    await t.step("should allow a user to unblock a previously blocked user", async () => {
      console.log(`  - Setup: Ensuring ${userA} has ${userC} blocked.`);
      await concept.blockUser({ blocker: userA, userToBlock: userC });

      console.log(`  - Test: ${userA} unblocks ${userC}.`);
      const result = await concept.unblockUser({ blocker: userA, userToUnblock: userC });
      assertEquals(result, {}, "Action should succeed.");

      console.log("  - Confirming effects:");
      const isBlocked = await concept._isUserBlocked({ primaryUser: userA, secondaryUser: userC });
      assertEquals(isBlocked, [{ result: false }], `${userA} should no longer have ${userC} blocked.`);
      console.log(`    - Verified: ${userA} no longer blocks ${userC}.`);
    });

    await t.step("should succeed even if the user was not blocked", async () => {
      console.log(`  - Test: ${userA} attempts to unblock ${userC}, who is not currently blocked.`);
      const result = await concept.unblockUser({ blocker: userA, userToUnblock: userC });
      assertEquals(result, {}, "Action should still succeed.");

      console.log("  - Confirming no state change:");
      const blockedList = await concept._blockedUsers({ user: userA });
      assertEquals(blockedList.some((u) => u.user === userC), false, "Block list should not contain the unblocked user.");
      console.log(`    - Verified: ${userC} is not on ${userA}'s block list.`);
    });
  });

  await t.step("Principle: If User A blocks User B, access from B to A is prevented", async () => {
    console.log("\n--- Testing Principle ---");
    console.log("Trace: User A blocks User B, preventing access. Then A unblocks B, restoring access.");

    // Ensure clean initial state: unblock userB if it was blocked in previous tests
    await concept.unblockUser({ blocker: userA, userToUnblock: userB });

    // Initial state: No blocks exist
    console.log(`1. Initial state: Verifying ${userA} has not blocked ${userB}.`);
    let isBlocked = await concept._isUserBlocked({ primaryUser: userA, secondaryUser: userB });
    assertEquals(isBlocked, [{ result: false }], "Initially, no block should exist.");
    console.log("   - Confirmed. Application would allow B to see A's info.");

    // Action: User A blocks User B
    console.log(`2. Action: ${userA} blocks ${userB}.`);
    await concept.blockUser({ blocker: userA, userToBlock: userB });

    // Verification: Block is active
    console.log(`3. Verification: Checking if ${userA} has now blocked ${userB}.`);
    isBlocked = await concept._isUserBlocked({ primaryUser: userA, secondaryUser: userB });
    assertEquals(isBlocked, [{ result: true }], "Block should now be active.");
    console.log("   - Confirmed. Application would now prevent B from seeing A's info.");
    console.log("   - This fulfills the first part of the principle.");

    // Action: User A unblocks User B
    console.log(`4. Action: ${userA} unblocks ${userB}.`);
    await concept.unblockUser({ blocker: userA, userToUnblock: userB });

    // Verification: Block is removed
    console.log(`5. Verification: Checking if ${userA} no longer blocks ${userB}.`);
    isBlocked = await concept._isUserBlocked({ primaryUser: userA, secondaryUser: userB });
    assertEquals(isBlocked, [{ result: false }], "Block should be removed.");
    console.log("   - Confirmed. Application would restore B's ability to see A's info.");
    console.log("--- Principle Test Complete ---\n");
  });

  await client.close();
});
