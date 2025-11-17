# concept: Grouping [User]

*   **purpose**: Manage the lifecycle of groups and their membership.
*   **principle**: An admins creates a private Group, allowing future users to request to join, inviting and removing members, and managing member roles (such as owner or administrator). It provides the fundamental mechanics of association that can be used for a wide variety of features, such as team collaboration, social clubs, or access control lists.

*   **state**:
    *   a set of `Group`s with
        *   a `name` String
        *   a `members` set of unique ID
        *   a `memberRoles` map from unique ID to Role (`ADMIN` | `MEMBER`)
        *   a `requests` set of unique ID (e.g., `User` requesting to join)

*   **actions**:

*   `createGroup (name: String, admin: User): (group: Group)`
    *   **requires**: no Group exists with the given `name`.
    *   **effects**: create new `group` with `name` name, `admin` as only member in `members`, `admin` having role `ADMIN` in `memberRoles`, and returns `group`.

*   `deleteGroup (group: Group)`
    *   **requires**: the given `group` exists.
    *   **effects**: deletes the given `group` and its association with its members.

*   `renameGroup (group: Group, newName: String)`
    *   **requires**: the given `group` exists and no other Group has the `newName`.
    *   **effects**: updates the `name` of the `group` to `newName`.

*   `confirmRequest (group: Group, requester: User)`
    *   **requires**: the given `group` exists and `group.requests` contains `requester`.
    *   **effects**: adds the `requester` to `group.members`, adds `requester` to `group.memberRoles` as `MEMBER`, deletes associated `requester` `group.requests`.

*   `declineRequest (group: Group, requester: User)`
    *   **requires**: the given `group` exists and `group.requests` contains `requester`.
    *   **effects**: deletes the `requester` from `group.requests`.

*   `requestToJoin (group: Group, requester: User)`
    *   **requires**: the given `group` exists and the `requester` isn't already in `group`.
    *   **effects**: creates request in `group.requests` for `requester.

*   `adjustRole (group: Group, member: User, newRole: String)`
    *   **requires**: `group` exists, `group.members` contains `member`, and `newRole` is `ADMIN` | `MEMBER`
    *   **effects**: updates `group.memberRoles` for `member` to be `newRole`

*   **queries**:

*   `_getMembers (group: Group): (member: User)`
    *   **requires** `group` exists
    *   **effects** returns the set of all users in the `members` set of the given `group`

*   `_getAdmins (group: Group): (admin: User)`
    *   **requires** `group` exists
    *   **effects** returns the set of all users in the `admins` set of the given `group`

*   `_getRequests (group: Group): (requestingUser: User)`
    *   **requires** `group` exists
    *   **effects** returns the set of all users in the `requests` set of the given `group`

*   `_getGroupByName (name: String): (group: Group)`
    *   **requires** a group `g` with `g.name = name` exists
    *   **effects** returns the group `g`
