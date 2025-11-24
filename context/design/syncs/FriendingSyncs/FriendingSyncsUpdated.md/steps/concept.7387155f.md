---
timestamp: 'Sun Nov 23 2025 20:16:44 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_201644.402e3bf8.md]]'
content_id: 7387155f9fd89478014d4ee52116928e23e191ef870c481572ef001605a8e94e
---

# concept: Grouping \[User]

* **purpose**: Manage the lifecycle of groups and their membership.

* **principle**: An admins creates a private Group, allowing future users to request to join, inviting and removing members, and managing member roles (such as owner or administrator). It provides the fundamental mechanics of association that can be used for a wide variety of features, such as team collaboration, social clubs, or access control lists.

* **state**:
  * a set of `Group`s with
    * a `name` String
    * a `members` set of User
    * a `memberRoles` map from User to Role (`ADMIN` | `MEMBER`)
    * a `requests` set of User (e.g., `User` requesting to join)

* **actions**:

* `createGroup (name: String, admin: User): (group: Group)`
  * **requires**: no Group exists with the given `name`.
  * **effects**: create new `group` with `name` name, `admin` as only member in `members`, `admin` having role `ADMIN` in `memberRoles`, and returns `group`.

* `deleteGroup (group: Group)`
  * **requires**: the given `group` exists.
  * **effects**: deletes the given `group` and its association with its members.

* `renameGroup (group: Group, newName: String)`
  * **requires**: the given `group` exists and no other Group has the `newName`.
  * **effects**: updates the `name` of the `group` to `newName`.

* `confirmRequest (group: Group, requester: User)`
  * **requires**: the given `group` exists and `group.requests` contains `requester`.
  * **effects**: adds the `requester` to `group.members`, adds `requester` to `group.memberRoles` as `MEMBER`, deletes associated `requester` `group.requests`.

* `declineRequest (group: Group, requester: User)`
  * **requires**: the given `group` exists and `group.requests` contains `requester`.
  * **effects**: deletes the `requester` from `group.requests`.

* `requestToJoin (group: Group, requester: User)`
  * **requires**: the given `group` exists and the `requester` isn't already in `group`.
  * **effects**: creates request in `group.requests` for \`requester.

* `adjustRole (group: Group, member: User, newRole: String)`
  * **requires**: `group` exists, `group.members` contains `member`, and `newRole` is `ADMIN` | `MEMBER`
  * **effects**: updates `group.memberRoles` for `member` to be `newRole`

* `removeMember (group: Group, member: User)`
  * **requires**: `group` exists, `group.members` contains `member`
  * **effects**: remove `member` from `group.memberRoles`

* **queries**:

* `_getMembers (group: Group): (members: set of User)`
  * **requires** `group` exists
  * **effects** returns the set of all users in the `members` set of the given `group`

* `isGroupMember (group: Group, user: User): (inGroup: bool)`
  * **requires** `group` exists
  * **effects** returns true if `user` in `group.members` else false

* `_getAdmins (group: Group): (admins: set of User)`
  * **requires** `group` exists
  * **effects** returns the set of all users in the `admins` set of the given `group`

* `isGroupAdmin (group: Group, user: User): (isAdmin: bool)`
  * **requires** `group` exists
  * **effects** returns true if `user` in `group.members` and has `ADMIN` in `group.memberRoles`.

* `_getRequests (group: Group): (requestingUser: User)`
  * **requires** `group` exists
  * **effects** returns the set of all users in the `requests` set of the given `group`

* `_getGroupByName (name: String): (group: Group)`
  * **requires** a group `g` with `g.name = name` exists
  * **effects** returns the group `g`

* `_getUserGroups (user: User): (group: set of Group)`
  * **requires** `user` is a member within an existing group
  * **effects** returns set `group` such that each have `user` in `group.members`
