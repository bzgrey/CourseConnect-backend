---
timestamp: 'Mon Nov 17 2025 23:18:18 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251117_231818.a71beeab.md]]'
content_id: 315218b126f5f54c0d45ea3adf46277b6cb89cfeb54af09a45299b0c57b66629
---

# response:

* **actions**:
  * `addScore (user: User, item: Item, score: Number)`
  * `updateScore (user: User, item: Item, score: Number)`
    * **requires**: user and item exist
    * **effects**: If a preference for the given `user` and `item` already exists, its `score` is updated. Otherwise, a new preference is created linking the `user`, `item`, and `score`.
  * `removeScore (user: User, item: Item)`

    * **effects**: Removes the preference record for the given `user` and `item`, if it exists.

* **queries**:
  * `_getScore (user: User, item: Item): (score: Number)`
    * **purpose**: To retrieve the specific score a single user assigned to a single item.
    * **outputs**: The `score` the `user` assigned to the `item`, if one exists. Returns at most one result.
  * `_getAllItems(user: User): (items: Item[])`
    * **purpose**: To retrieve all the scores a specific user has assigned.
    * **outputs**: Zero or more pairs of `item` and the `score` the `user` assigned to them.
