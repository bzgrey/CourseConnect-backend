---
timestamp: 'Tue Nov 18 2025 19:55:27 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251118_195527.45b213f0.md]]'
content_id: 5cc27245e221c82a1e7dbf6ed2ee653fecb736a038691d36d6c54f518b83a8b9
---

# prompt: revise the above given the defintions of the following concepts

* **concept**: Blocking \[User]
* **purpose**: To empower users to prevent specific individuals from viewing their information, even if they are in a shared group or context.
* **principle**: If User A blocks User B, then even if they are both members of the same group, any application feature that tries to show User A's schedule to User B will fail or show nothing.
* **state**:
  * A set of blockLists with:
    * a `user`:User
    * a `blockedUsers` list of Users
* **actions**:
  * `blockUser (blocker: User, userToBlock: User)`
    * **requires** blocker is not userToBlock
    * **effects** If blocker exists as a user in `blockLists`, add `userToBlock` to `blockedUsers` for the entry of blockLists with user==blocker if userToBlock isn't already in the `blockedUsers` list. Otherwise create a new blockLists entry with user=blocker, and the list \[userToBlock]
  * `unblockUser (blocker: User, userToUnblock: User)`
    * **requires** `userToUnblock` is in the `blockedUsers` list for the entry in blockLists where `user` is `blocker`
    * **effects** Removes the pair `userToUnblock` from the `blockedUsers` list.
* **queries**:
  * `_isUserBlocked(primaryUser: User, secondaryUser: User): [Boolean]`
    * **effects** Returns true if `primaryUser` is a user in a blockLists entry and `secondaryUser` is in that entry’s `blockedUsers` list.
  * `blockedUsers(user:User):Users[]`
    * **effects** returns blockedUsers for blockLists entry with `user`, and if one doesn't exist return an empty list
