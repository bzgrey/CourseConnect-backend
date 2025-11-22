---
timestamp: 'Sat Nov 22 2025 12:37:30 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251122_123730.48faad75.md]]'
content_id: 41c970d69ba63dfd21b30d55a8a2bbf325faf1b5ee79d7f2075e688323517ac0
---

# trace:

The operational principle for the `Blocking` concept is: *If User A blocks User B, then even if they are both members of the same group, any application feature that tries to show User A's schedule to User B will fail or show nothing.*

A test trace demonstrating this principle would follow these steps, simulating how an application would use the concept's queries to enforce the block:

1. **Initial State**: The application checks if User A blocks User B before showing User A's information to User B.
   * **Query**: `_isUserBlocked({ primaryUser: "user:A", secondaryUser: "user:B" })`
   * **Expected Result**: `[{ result: false }]`.
   * **Application Logic**: The result is false, so the application proceeds to show User A's information to User B.

2. **User A performs an action**: User A decides to block User B.
   * **Action**: `blockUser({ blocker: "user:A", userToBlock: "user:B" })`
   * **Expected Result**: `{}` (success).
   * **State Change**: A `BlockList` entry is created for User A, containing User B in its `blockedUsers` list.

3. **Subsequent Check**: The application again attempts to show User A's information to User B. It first checks for a block.
   * **Query**: `_isUserBlocked({ primaryUser: "user:A", secondaryUser: "user:B" })`
   * **Expected Result**: `[{ result: true }]`.
   * **Application Logic**: The result is true. The application now hides User A's information from User B, fulfilling the principle.

4. **User A reverses the action**: User A decides to unblock User B.
   * **Action**: `unblockUser({ blocker: "user:A", userToUnblock: "user:B" })`
   * **Expected Result**: `{}` (success).
   * **State Change**: User B is removed from User A's `blockedUsers` list.

5. **Final Check**: The application once more tries to show User A's information to User B.
   * **Query**: `_isUserBlocked({ primaryUser: "user:A", secondaryUser: "user:B" })`
   * **Expected Result**: `[{ result: false }]`.
   * **Application Logic**: The result is false again, so the application resumes showing User A's information to User B.

This trace demonstrates the complete lifecycle of a block, showing how the `blockUser` action establishes the condition required by the principle, how the `_isUserBlocked` query is used to enforce it, and how the `unblockUser` action reverts the state.
