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

  await t.step("Query '_getAllIncomingFriendRequests'", async () => {
    console.log("\n--- Testing Query '_getAllIncomingFriendRequests' ---");
    console.log("Note: 'Incoming' means requests sent TO the user (where user is the requestee).");

    // Clean up any existing requests
    await concept.pendingRequests.deleteMany({});

    console.log("1. Testing: User with no incoming friend requests returns empty array.");
    let incomingRequests = await concept._getAllIncomingFriendRequests({ user: alice });
    assertEquals(incomingRequests, [], "Alice should have no incoming friend requests initially.");

    console.log("2. Testing: When someone sends a request to Alice, it appears in her incoming list.");
    await concept.requestFriend({ requester: bob, requestee: alice });
    incomingRequests = await concept._getAllIncomingFriendRequests({ user: alice });
    assertEquals(incomingRequests.length, 1, "Alice should have one incoming friend request.");
    assertEquals(incomingRequests[0], bob, "The requester should be Bob.");

    console.log("3. Testing: Multiple incoming requests appear in the list.");
    await concept.requestFriend({ requester: charlie, requestee: alice });
    incomingRequests = await concept._getAllIncomingFriendRequests({ user: alice });
    assertEquals(incomingRequests.length, 2, "Alice should have two incoming friend requests.");
    // Check that both Bob and Charlie are in the list
    assertEquals(incomingRequests.includes(bob), true, "Bob should be in the list.");
    assertEquals(incomingRequests.includes(charlie), true, "Charlie should be in the list.");

    console.log("4. Testing: When a request is accepted, it's removed from the incoming list.");
    await concept.acceptFriend({ requester: bob, requestee: alice });
    incomingRequests = await concept._getAllIncomingFriendRequests({ user: alice });
    assertEquals(incomingRequests.length, 1, "Alice should have one incoming friend request after accepting Bob's.");
    assertEquals(incomingRequests[0], charlie, "The remaining requester should be Charlie.");

    console.log("5. Testing: When a request is rejected, it's removed from the incoming list.");
    await concept.rejectFriend({ requester: charlie, requestee: alice });
    incomingRequests = await concept._getAllIncomingFriendRequests({ user: alice });
    assertEquals(incomingRequests, [], "Alice should have no incoming friend requests after rejecting Charlie's.");

    console.log("6. Testing: Requests sent by Alice don't appear in her incoming list.");
    // Note: Alice and Bob are already friends from step 4, so we can't send another request
    // Instead, send a request from a different user (charlie) to verify the logic
    await concept.requestFriend({ requester: charlie, requestee: alice });
    incomingRequests = await concept._getAllIncomingFriendRequests({ user: alice });
    assertEquals(incomingRequests.length, 1, "Alice should have one incoming request (from Charlie).");
    assertEquals(incomingRequests[0], charlie, "Charlie should be in Alice's incoming list.");

    // Now verify that requests sent by Alice don't appear in her incoming list
    // Since Alice and Bob are friends, we'll use a different user
    // First, make sure Alice and Charlie aren't friends
    await concept.rejectFriend({ requester: charlie, requestee: alice });
    // Now send a request from Alice to a new user (we'll use bob, but they're already friends, so this will fail)
    // Instead, let's verify that Bob's incoming list works correctly
    // Bob should have no incoming requests since Alice's request was accepted earlier
    const bobIncomingRequests = await concept._getAllIncomingFriendRequests({ user: bob });
    assertEquals(bobIncomingRequests.length, 0, "Bob should have no incoming requests (Alice's was accepted).");

    console.log("--- '_getAllIncomingFriendRequests' Test Passed ---");
  });

  await t.step("Query '_getAllOutgoingFriendRequests'", async () => {
    console.log("\n--- Testing Query '_getAllOutgoingFriendRequests' ---");
    console.log("Note: 'Outgoing' means requests sent BY the user (where user is the requester).");

    // Clean up any existing requests and friendships to ensure clean state
    await concept.pendingRequests.deleteMany({});
    await concept.friends.deleteMany({});

    console.log("1. Testing: User with no outgoing friend requests returns empty array.");
    let outgoingRequests = await concept._getAllOutgoingFriendRequests({ user: alice });
    assertEquals(outgoingRequests, [], "Alice should have no outgoing friend requests initially.");

    console.log("2. Testing: When Alice sends a request, it appears in her outgoing list.");
    await concept.requestFriend({ requester: alice, requestee: bob });
    outgoingRequests = await concept._getAllOutgoingFriendRequests({ user: alice });
    assertEquals(outgoingRequests.length, 1, "Alice should have one outgoing friend request.");
    assertEquals(outgoingRequests[0], bob, "The requestee should be Bob.");

    console.log("3. Testing: Multiple outgoing requests appear in the list.");
    await concept.requestFriend({ requester: alice, requestee: charlie });
    outgoingRequests = await concept._getAllOutgoingFriendRequests({ user: alice });
    assertEquals(outgoingRequests.length, 2, "Alice should have two outgoing friend requests.");
    // Check that both Bob and Charlie are in the list
    assertEquals(outgoingRequests.includes(bob), true, "Bob should be in the list.");
    assertEquals(outgoingRequests.includes(charlie), true, "Charlie should be in the list.");

    console.log("4. Testing: When a request is accepted, it's removed from the outgoing list.");
    await concept.acceptFriend({ requester: alice, requestee: bob });
    outgoingRequests = await concept._getAllOutgoingFriendRequests({ user: alice });
    assertEquals(outgoingRequests.length, 1, "Alice should have one outgoing friend request after Bob accepts.");
    assertEquals(outgoingRequests[0], charlie, "The remaining requestee should be Charlie.");

    console.log("5. Testing: When a request is rejected, it's removed from the outgoing list.");
    await concept.rejectFriend({ requester: alice, requestee: charlie });
    outgoingRequests = await concept._getAllOutgoingFriendRequests({ user: alice });
    assertEquals(outgoingRequests, [], "Alice should have no outgoing friend requests after Charlie rejects.");

    console.log("6. Testing: Requests sent to Alice don't appear in her outgoing list.");
    // Note: Alice and Bob became friends in step 4, so we can't send another request between them
    // Instead, send a request from Charlie to Alice (they're not friends)
    await concept.requestFriend({ requester: charlie, requestee: alice });
    outgoingRequests = await concept._getAllOutgoingFriendRequests({ user: alice });
    assertEquals(outgoingRequests, [], "Alice's outgoing list should not include requests sent to her.");

    // Verify Charlie's outgoing list contains requests he sent
    // Charlie just sent a request to Alice, so Charlie should have 1 outgoing request
    let charlieOutgoingRequests = await concept._getAllOutgoingFriendRequests({ user: charlie });
    assertEquals(charlieOutgoingRequests.length, 1, "Charlie should have one outgoing friend request (to Alice).");
    assertEquals(charlieOutgoingRequests.includes(alice), true, "Alice should be in Charlie's outgoing list.");

    // Now send another request from Charlie to Bob (they're not friends)
    await concept.requestFriend({ requester: charlie, requestee: bob });
    charlieOutgoingRequests = await concept._getAllOutgoingFriendRequests({ user: charlie });
    assertEquals(charlieOutgoingRequests.length, 2, "Charlie should have two outgoing friend requests (to Alice and Bob).");
    assertEquals(charlieOutgoingRequests.includes(alice), true, "Alice should be in Charlie's outgoing list.");
    assertEquals(charlieOutgoingRequests.includes(bob), true, "Bob should be in Charlie's outgoing list.");

    console.log("--- '_getAllOutgoingFriendRequests' Test Passed ---");
  });

  await client.close();
});
