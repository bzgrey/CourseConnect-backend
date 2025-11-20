---
timestamp: 'Thu Nov 20 2025 11:10:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251120_111056.3ed81245.md]]'
content_id: a3481d52d0c208d7aece580ba7a1b7d25f78b2d7004ecba15c691f59f5082aa4
---

# concept: Friending

* **concept**: Friending \[User]
* **purpose**: To manage mutual, consent-based social connections between users.
* **principle**: If User A sends a friend request to User B, and User B accepts the request, then User A and User B will appear on each other's friends list.
* **state**:
  `pendingRequests: a set of (requester: User, requestee: User)`
  `friends: a set of {user1: User, user2: User}` (a symmetric relationship)
* **actions**:
  `requestFriend (requester: User, requestee: User)`
  **requires** `requester` and `requestee` are not already friends. A pending request from `requester` to `requestee` does not already exist. `requester` is not `requestee`.
  **effects** Adds the pair (`requester`, `requestee`) to the `pendingRequests` set.

  `acceptFriend (requester: User, requestee: User)`
  **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
  **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`. Adds the pair `{requester, requestee}` to the `friends` set.

  `rejectFriend (requester: User, requestee: User)`
  **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
  **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`.

  `removeFriend (remover: User, removed: User)`
  **requires** `remover` and `removed` are friends.
  **effects** Removes the pair `{remover, removed}` from the `friends` set.
* **queries**
  `_getAllFriendRequests (user:User):User[]`
  **effects** returns list of requestees for user

  `_getAllFriends (user:User):User[]`
  **effects** returns list of friends for user

  `_areTheyFriends(user1:User, user2:User): Boolean`
  **effects** returns true if {user1, user2} exists in friends otherwise false
