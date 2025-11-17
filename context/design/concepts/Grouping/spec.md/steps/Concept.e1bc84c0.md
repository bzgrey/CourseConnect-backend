---
timestamp: 'Sun Nov 16 2025 15:35:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_153554.79b85760.md]]'
content_id: e1bc84c07f0081c821beaef056501496b7e4d8f0c5c4339b78c1c5cefbc2887e
---

# Concept: Grouping

The `Grouping` concept provides functionality for creating and managing collections of entities. Its purpose is to associate a set of members with a named group, and to designate an owner for that group with administrative privileges.

This concept is polymorphic, meaning the members can be of any type (users, documents, posts, etc.), identified only by their unique IDs. This allows for broad reusability across different applications and contexts.

## State

The state of the `Grouping` concept captures the existence of groups, their ownership, and their membership.

* `groups`: a set of all existing groups.
* `owner`: a mapping from a `group` to the `user` who owns it. The owner typically has permission to manage the group.
* `members`: a mapping from a `group` to the set of `members` belonging to it.

## Actions

The actions provide the interface for creating and managing groups. These actions are typically restricted to authorized users (e.g., the group owner) through sync rules.

### `create (group, creator)`

Creates a new, empty group.

* **`group`**: The unique identifier for the new group.
* **`creator`**: The user who is creating the group and will be designated as its initial owner.

Upon execution, a new `group` is added to the `groups` set, and the `owner` mapping is updated to associate the `group` with the `creator`. The `members` set for the new group is initialized as empty.

### `delete (group)`

Deletes an existing group.

* **`group`**: The identifier of the group to be deleted.

This action removes the `group` from the `groups` set and clears all associated `owner` and `members` mappings. A sync would typically ensure that only the owner can successfully trigger this action.

### `addMember (group, member)`

Adds a member to a specified group.

* **`group`**: The identifier of the group.
* **`member`**: The identifier of the entity to be added as a member.

This action adds the `member` to the set of members associated with the `group` in the `members` mapping.

### `removeMember (group, member)`

Removes a member from a specified group.

* **`group`**: The identifier of the group.
* **`member`**: The identifier of the member to be removed.

This action removes the `member` from the set of members associated with the `group`.
