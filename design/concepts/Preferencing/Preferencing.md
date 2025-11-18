* **concept**: Preferencing \[User, Item]

* **purpose**: To allow a user to assign a personal numerical score to a single item at a time, and to query this score.

* **principle**: Each user can assign a score to at most one item at any given time. Assigning a score to an item (either new or existing) replaces any previously held item and score for that user.

* **state**:
  * A set of `Users` with
    * an `item` of type `Item`
    * a `score` of type `Number`

* **actions**:
  * `addScore (user: User, item: Item, score: Number)`
    * **requires**: The `user` must not currently have an `item` and `score` assigned. The `score` must be a valid number.
    * **effects**: Assigns the given `item` and `score` to the `user`.
  * `updateScore (user: User, item: Item, score: Number)`
    * **requires**: The `user` must already have the specified `item` assigned. The `score` must be a valid number.
    * **effects**: Updates the `score` for the `user`'s assigned `item` to the new value.
  * `removeScore (user: User, item: Item)`
    * **requires**: The `user` must have the specified `item` assigned to them.
    * **effects**: Clears the `item` and `score` from the `user`'s record, removing the preference.

* **queries**:
  * `_getScore (user: User, item: Item): (score: Number)`
    * **requires**: `user` exists and `item` is associated with `user`
    * **outputs**: return `score` associated with `item`

  * `_getAllItems(user: User): (items: Item[])`
    * **requires** `user` exists
    * **effects**: list of Item `items` associated with the `user` is returned

