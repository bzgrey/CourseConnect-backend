---
timestamp: 'Mon Nov 17 2025 23:09:48 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251117_230948.04689ccc.md]]'
content_id: 3c76c9c608320b2fb0c288e9ec51151ee6c69d7a133c5570bfbfc1567da51631
---

# response:

* **actions**:
  * `setScore (user: User, item: Item, score: Number)`
    * **effects**: If a preference for the given `user` and `item` already exists, its `score` is updated. Otherwise, a new preference is created linking the `user`, `item`, and `score`.
  * `removeScore (user: User, item: Item)`
    * **effects**: Removes the preference record for the given `user` and `item`, if it exists.

* **queries**:
  * `getScore (user: User, item: Item): (score: Number)`
    * **purpose**: To retrieve the specific score a single user assigned to a single item.
    * **outputs**: The `score` the `user` assigned to the `item`, if one exists. Returns at most one result.
  * `getPreferencesByUser (user: User): (item: Item, score: Number)`
    * **purpose**: To retrieve all the scores a specific user has assigned.
    * **outputs**: Zero or more pairs of `item` and the `score` the `user` assigned to them.
