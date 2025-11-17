---
timestamp: 'Sun Nov 16 2025 16:05:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_160554.fec4d25b.md]]'
content_id: 1214d58096bebff66f0b151e229c360e2f3f895a8ed81ba7ab0e96f78d1dfd39
---

# response:

* `createGroup (name: String): (group: Group)`
  * **requires**: no Group exists with the given `name`.
  * **effects**: "creates a new Group `g`; sets its `name` to the given `name` and its set of members to empty; returns `g` as `group`."

* `deleteGroup (group: Group)`
  * **requires**: the given `group` exists.
  * **effects**: "deletes the given `group` and its association with its members."

* `renameGroup (group: Group, newName: String)`
  * **requires**: the given `group` exists and no other Group has the `newName`.
  * **effects**: "updates the `name` of the `group` to `newName`."

* `addMember (group: Group, member: Member)`
  * **requires**: the given `group` exists and the `member` is not already in the `group`.
  * **effects**: "adds the `member` to the set of members of the `group`."

* `removeMember (group: Group, member: Member)`
  * **requires**: the given `group` exists and the `member` is currently in the `group`.
  * **effects**: "removes the `member` from the set of members of the `group`."
