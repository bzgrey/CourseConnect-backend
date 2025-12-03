* **concept**: Preferencing \[User, Item]

* **purpose**: To allow a user to assign personal numerical scores to multiple items, and to query these scores.

* **principle**: Each user can assign a score to any item. Users can change scores for items they've already scored by calling addScore again with a new score.

* **state**:
  * A set of `Users` with
    * a set of `Preferences` (references)
  * A set of `Preferences` with
    * a `user` of type `User`
    * an `item` of type `Item`
    * a `score` of type `Number`

* **actions**:
  * `addScore (user: User, item: Item, score: Number)`
    * **requires**: The `score` must be a valid number.
    * **effects**: If the user has not scored this item, adds a new preference. If the user has already scored this item, updates the score to the new value.
  * `removeScore (user: User, item: Item)`
    * **requires**: The `user` must have scored the specified `item`.
    * **effects**: Removes the preference for this `user` and `item` combination.

* **queries**:
  * `_getScore (user: User, item: Item): (score: Number)`
    * **requires**: `user` exists and `item` is associated with `user`
    * **outputs**: return `score` associated with `item`

  * `_getAllItems(user: User): (items: Item[])`
    * **requires** `user` exists
    * **effects**: list of Item `items` associated with the `user` is returned

