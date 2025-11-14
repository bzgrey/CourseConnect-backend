---
timestamp: 'Fri Nov 14 2025 12:29:33 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251114_122933.5d286cb3.md]]'
content_id: 5c7293af325d8ed3718311dce35fa6318d0847d431a96e1fb9bb34a03ad1ec6a
---

# response:

Of course. Based on the principles and structure outlined in the provided text, here is a specification for a `Ranking` concept.

***

### **Concept: Ranking**

#### Purpose

To maintain an ordered list of items based on an associated numerical score.

#### Motivation and Use Cases

The `Ranking` concept is used whenever a collection of items needs to be presented to the user in a specific order based on merit, popularity, or some other quantifiable measure. It decouples the logic of ordering from the logic of what the items are or how their scores are generated.

Common applications include:

* A leaderboard of players in a game.
* The highest-voted answers on a Q\&A site like Stack Overflow.
* The most popular products on an e-commerce site.
* Trending news articles.

#### State

The state of the Ranking concept consists of a single relationship that maps items to their scores.

* `scores`: A mapping from an `Item` identifier to a `Number`.

Following the principle of polymorphism, an `Item` is treated as an opaque identifier. The `Ranking` concept has no knowledge of the item's type, content, or other properties.

#### Actions

**User-Facing (Indirect) and System Actions:**

* `setScore(item: Item, score: Number)`
  * Assigns or updates the numerical score for a given item. If the item is not already in the `scores` map, it is added. This is the primary mechanism for influencing the ranking.
* `removeItem(item: Item)`
  * Removes an item and its associated score from the ranking entirely. This is necessary to handle cases where an item is deleted from the application.

**Note on Queries:** While not state-changing actions, the concept's API would also expose queries to retrieve the ranked list, such as `getRankedItems(limit: Number, offset: Number)`, which would return an ordered list of `Item` identifiers based on their scores in descending order.

#### Behavioral View

* **Developer's View:** A developer sees `Ranking` as a backend service with a simple API. They can send `setScore` commands to update the ranking for any item and `removeItem` to remove one. They can then query the service to get the current top-N items to display in the UI. The developer does not need to implement sorting logic or state management for the ranked list itself.
* **User's View:** A user does not interact with the `Ranking` concept directly. Instead, they perceive its output as an ordered list, such as a "Top Posts" feed or a "Leaderboard". Their actions in other concepts (like `Upvote` or `Purchase`) trigger syncs that update the `Ranking` concept's state, causing the list they see to change dynamically.

#### Independence and Polymorphism

The `Ranking` concept is fully independent.

* It does not know what an `Item` is; it could be a post, a user, a product, or a comment.
* It does not know *why* a score is being set. The score could be derived from upvotes, sales figures, user activity, or an administrative decision.
* Its behavior is defined entirely by the `setScore` and `removeItem` actions and its internal state, without reference to any other concept.

#### Separation of Concerns

This concept demonstrates a clear separation of concerns. In a traditional design, a `Post` object might have a `score` field and the application logic would be responsible for querying and sorting all posts.

With concept design, the concerns are separated:

* The `Post` concept manages the existence and content of posts.
* The `Upvote` concept manages which users have voted for which posts.
* The `Ranking` concept manages only the ordered list based on a score.

This separation means `Ranking` can be reused to rank `Users` by their karma, or `Products` by their sales, without any changes to its implementation.

#### Example Syncs for Composition

`Ranking` is composed with other concepts using syncs.

**1. Ranking Posts by Upvotes**

This sync connects the `Upvote` concept to `Ranking`. When the vote count for a post changes, its score in the `Ranking` concept is updated.

```
sync UpdatePostRankingOnVote
when
    Upvote.changeVote(p, u, v) // A vote on post p by user u changes
where
    in Upvote: voteCount of p is newScore
then
    Ranking.setScore(p, newScore)
```

**2. Handling Post Deletion**

This sync ensures that if a post is deleted, it is also removed from the ranking.

```
sync RemovePostFromRankingOnDelete
when
    Post.delete(p)
then
    Ranking.removeItem(p)
```

**3. Initializing a New Post in the Ranking**

When a new item is created, it should be added to the ranking, typically with a default score (e.g., 0).

```
sync AddNewPostToRanking
when
    Post.create(p, author, content)
then
    Ranking.setScore(p, 0)
```

### **Concept: Ranking**

#### Purpose

To maintain an ordered list of items based on an associated numerical score.

#### Motivation and Use Cases

The `Ranking` concept is used whenever a collection of items needs to be presented to the user in a specific order based on merit, popularity, or some other quantifiable measure. It decouples the logic of ordering from the logic of what the items are or how their scores are generated.

Common applications include:

* A leaderboard of players in a game.
* The highest-voted answers on a Q\&A site like Stack Overflow.
* The most popular products on an e-commerce site.
* Trending news articles.

#### State

The state of the Ranking concept consists of a single relationship that maps items to their scores.

* `scores`: A mapping from an `Item` identifier to a `Number`.

Following the principle of polymorphism, an `Item` is treated as an opaque identifier. The `Ranking` concept has no knowledge of the item's type, content, or other properties.

#### Actions

**User-Facing (Indirect) and System Actions:**

* `setScore(item: Item, score: Number)`
  * Assigns or updates the numerical score for a given item. If the item is not already in the `scores` map, it is added. This is the primary mechanism for influencing the ranking.
* `removeItem(item: Item)`
  * Removes an item and its associated score from the ranking entirely. This is necessary to handle cases where an item is deleted from the application.

**Note on Queries:** While not state-changing actions, the concept's API would also expose queries to retrieve the ranked list, such as `getRankedItems(limit: Number, offset: Number)`, which would return an ordered list of `Item` identifiers based on their scores in descending order.
