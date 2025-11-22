---
timestamp: 'Sat Nov 22 2025 13:01:14 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251122_130114.94980ea5.md]]'
content_id: 2b6c4d8b9ebdd3b81b738748f06b4e0b916b60abcfb0dc7c190470521ce3ee62
---

# file: src/concepts/friending/FriendingConcept.test.ts

```typescript
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import FriendingConcept from "./FriendingConcept.ts";
import { assertEquals, assertNotEquals } from "jsr:@std/assert";

// Mock User IDs for testing
const alice = "user:Alice" as ID;
const bob = "user:Bob" as ID;
const charlie = "user:Charlie" as ID;

Deno.test("FriendingConcept", async (t) => {
  const [db, client] = await testDb();
  const concept = new FriendingConcept(db);

  await t.step("Principle: A successful friend request and acceptance flow", async () => {
    console.log("\n--- Testing Principle: Successful Friending Flow ---");
    console.log("Scenario: Alice sends a friend request to Bob, and Bob accepts.");

    // Initial state check
    console.log("1. Verifying initial state: Alice and Bob are not friends.");
    let areFriends = await concept._areTheyFriends({ user1: alice, user2: bob });
    assertEquals(areFriends, [{ areFriends: false }], "Alice and Bob should not be friends initially.");
    let aliceFriends = await concept._getAllFriends({ user: alice });
    assertEquals(aliceFriends, [], "Alice's friend list should be empty.");

    // Action: Alice requests to friend Bob
    console.log("2. Action: Alice sends a friend request to Bob.");
    const requestResult = await concept.requestFriend({ requester: alice, requestee: bob });
    assertEquals(requestResult, {}, "requestFriend should succeed.");

    // Effect: A pending request is created
    console.log("3. Verifying effect: A pending request from Alice to Bob should exist.");
    const pendingRequests = await concept.pendingRequests.find({ requester: alice, requestee: bob }).toArray();
    assertEquals(pendingRequests.length, 1, "A single pending request should exist in the collection.");
    assertEquals(pendingRequests[0].requester, alice);
    assertEquals(pendingRequests[0].requestee, bob);

    // Action: Bob accepts the friend request
    console.log("4. Action: Bob accepts Alice's friend request.");
    const acceptResult = await concept.acceptFriend({ requester: alice, requestee: bob });
    assertEquals(acceptResult, {}, "acceptFriend should succeed.");

    // Effect: The pending request is removed
    console.log("5. Verifying effect: The pending request should be removed.");
    const remainingRequests = await concept.pendingRequests.find({ requester: alice, requestee: bob }).toArray();
    assertEquals(remainingRequests.length, 0, "Pending request should be deleted after acceptance.");

    // Effect: Alice and Bob are now friends
    console.log("6. Verifying effect: Alice and Bob are now friends.");
    areFriends = await concept._areTheyFriends({ user1: alice, user2: bob });
    assertEquals(areFriends, [{ areFriends: true }], "Alice and Bob should now be friends.");

    // Effect: They appear in each other's friend lists
    console.log("7. Verifying effect: Bob should be in Alice's friend list.");
    aliceFriends = await concept._getAllFriends({ user: alice });
    assertEquals(aliceFriends, [{ friend: bob }]);

    console.log("8. Verifying effect: Alice should be in Bob's friend list.");
    const bobFriends = await concept._getAllFriends({ user: bob });
    assertEquals(bobFriends, [{ friend: alice }]);

    console.log("--- Principle Test Passed ---");
  });

  await t.step("Scenario: Friend request rejection", async () => {
    console.log("\n--- Testing Scenario: Friend Request Rejection ---");
    console.log("Scenario: Alice sends a friend request to Charlie, and Charlie rejects it.");

    // Action: Alice sends request to Charlie
    console.log("1. Action: Alice sends a friend request to Charlie.");
    await concept.requestFriend({ requester: alice, requestee: charlie });

    // Verification: Request exists
    let pendingRequest = await concept.pendingRequests.findOne({ requester: alice, requestee: charlie });
    assertNotEquals(pendingRequest, null, "Pending request from Alice to Charlie should exist.");

    // Action: Charlie rejects the request
    console.log("2. Action: Charlie rejects Alice's request.");
    const rejectResult = await concept.rejectFriend({ requester: alice, requestee: charlie });
    assertEquals(rejectResult, {}, "rejectFriend should succeed.");

    // Verification: Request is gone
    console.log("3. Verifying effect: The pending request should be removed.");
    pendingRequest = await concept.pendingRequests.findOne({ requester: alice, requestee: charlie });
    assertEquals(pendingRequest, null, "Pending request should be gone after rejection.");

    // Verification: They are not friends
    console.log("4. Verifying effect: Alice and Charlie should not be friends.");
    const areFriends = await concept._areTheyFriends({ user1: alice, user2: charlie });
    assertEquals(areFriends, [{ areFriends: false }]);
    console.log("--- Rejection Scenario Passed ---");
  });

  await t.step("Scenario: Removing a friend", async () => {
    console.log("\n--- Testing Scenario: Removing a Friend ---");
    console.log("Scenario: Alice and Bob are friends, then Bob removes Alice as a friend.");

    // Pre-condition is that Alice and Bob are friends, which is true from the principle test.
    console.log("1. Pre-condition check: Alice and Bob are friends.");
    let areFriends = await concept._areTheyFriends({ user1: alice, user2: bob });
    assertEquals(areFriends, [{ areFriends: true }]);

    // Action: Bob removes Alice
    console.log("2. Action: Bob removes Alice as a friend.");
    const removeResult = await concept.removeFriend({ remover: bob, removed: alice });
    assertEquals(removeResult, {}, "removeFriend should succeed.");

    // Verification: They are no longer friends
    console.log("3. Verifying effect: Alice and Bob are no longer friends.");
    areFriends = await concept._areTheyFriends({ user1: alice, user2: bob });
    assertEquals(areFriends, [{ areFriends: false }]);

    console.log("4. Verifying effect: Their friend lists are now empty.");
    const aliceFriends = await concept._getAllFriends({ user: alice });
    assertEquals(aliceFriends.length, 0); // Alice's only friend was bob
    const bobFriends = await concept._getAllFriends({ user: bob });
    assertEquals(bobFriends.length, 0); // Bob's only friend was alice
    console.log("--- Removal Scenario Passed ---");
  });

  await t.step("Action 'requestFriend' requirements", async () => {
    console.log("\n--- Testing Action 'requestFriend' Requirements ---");

    console.log("1. Testing requires: requester is not requestee.");
    let result = await concept.requestFriend({ requester: alice, requestee: alice });
    assertEquals(result, { error: "Cannot send a friend request to oneself." });

    console.log("2. Testing requires: not already friends.");
    // Make Alice and Bob friends again
    await concept.requestFriend({ requester: alice, requestee: bob });
    await concept.acceptFriend({ requester: alice, requestee: bob });
    result = await concept.requestFriend({ requester: alice, requestee: bob });
    assertEquals(result, { error: "Users are already friends." });

    console.log("3. Testing requires: pending request does not already exist.");
    // Unfriend them, then send a request
    await concept.removeFriend({ remover: alice, removed: bob });
    await concept.requestFriend({ requester: bob, requestee: alice });
    result = await concept.requestFriend({ requester: bob, requestee: alice });
    assertEquals(result, { error: "A friend request already exists." });
    console.log("--- 'requestFriend' Requirements Test Passed ---");
  });

  await t.step("Action 'acceptFriend', 'rejectFriend', 'removeFriend' requirements", async () => {
    console.log("\n--- Testing Requirements for Other Actions ---");

    // Clean up state from previous test
    await concept.rejectFriend({ requester: bob, requestee: alice });

    console.log("1. Testing 'acceptFriend' requires: pending request exists.");
    let result = await concept.acceptFriend({ requester: alice, requestee: bob });
    assertEquals(result, { error: "No pending friend request found." });

    console.log("2. Testing 'rejectFriend' requires: pending request exists.");
    result = await concept.rejectFriend({ requester: alice, requestee: bob });
    assertEquals(result, { error: "No pending friend request found to reject." });

    console.log("3. Testing 'removeFriend' requires: users are friends.");
    result = await concept.removeFriend({ remover: alice, removed: bob });
    assertEquals(result, { error: "These users are not friends." });
    console.log("--- Other Actions Requirements Test Passed ---");
  });

  await client.close();
});
```
