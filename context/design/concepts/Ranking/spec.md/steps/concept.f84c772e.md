---
timestamp: 'Fri Nov 14 2025 12:29:46 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251114_122946.1fceb268.md]]'
content_id: f84c772ee122359a0c12858f0bdced4f5ff62ba795c62ebd6aa95eadb6e81bb7
---

# concept: Ranking

* **concept**: Ranking \[Item]
* **purpose**: To maintain an ordered list of items based on an associated numerical score.
* **principle**: If the score associated with an item is set or updated, then that item's position in the ordered list is adjusted, allowing for the retrieval of items sorted by score.
* **state**:
  * A set of `Items` with
    * a `score` of type `Number`
* **actions**:
  * `setScore (item: Item, score: Number)`
    * **requires**: `score` must be a valid number.
    * **effects**: Assigns or updates the score for the given item. If the item is not yet in the set, it is added.
  * `removeItem (item: Item)`
    * **requires**: The item must exist in the ranking.
    * **effects**: Removes the item and its associated score from the ranking.
