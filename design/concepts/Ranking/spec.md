[@concept-design-overview](../../background/concept-design-overview.md)
[@concept-specifications](../../background/concept-specifications.md)
[@ProblemFraming](../../../ProblemFraming.md)

# concept: Ranking

- **concept**: Ranking [Item]
- **purpose**: To maintain an ordered list of items based on an associated numerical score.
- **principle**: If the score associated with an item is set or updated, then that item's position in the ordered list is adjusted, allowing for the retrieval of items sorted by score.
- **state**:
    - A set of `Items` with
        - a `score` of type `Number`
- **actions**:
    - `setScore (item: Item, score: Number)`
        - **requires**: `score` must be a valid number.
        - **effects**: Assigns or updates the score for the given item. If the item is not yet in the set, it is added.
    - `removeItem (item: Item)`
        - **requires**: The item must exist in the ranking.
        - **effects**: Removes the item and its associated score from the ranking.