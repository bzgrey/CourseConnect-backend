---
timestamp: 'Mon Dec 01 2025 23:24:20 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251201_232420.7980e2d5.md]]'
content_id: ada9fe987d14d6733f366d4283bc57cfb65cc3f3626dabb1a7c5ae680b8bc375
---

# API Specification: Preferencing Concept

**Purpose:** To allow a user to assign a personal numerical score to a single item at a time, and to query this score.

***

## API Endpoints

### POST /api/Preferencing/addScore

**Description:** Assigns a score to an item for a user, provided they don't already have one.

**Requirements:**

* The `user` must not currently have an `item` and `score` assigned.
* The `score` must be a valid number.

**Effects:**

* Assigns the given `item` and `score` to the `user`.

**Request Body:**

```json
{
  "user": "User",
  "item": "Item",
  "score": "Number"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Preferencing/updateScore

**Description:** Updates the score for a user's currently assigned item.

**Requirements:**

* The `user` must already have the specified `item` assigned.
* The `score` must be a valid number.

**Effects:**

* Updates the `score` for the `user`'s assigned `item` to the new value.

**Request Body:**

```json
{
  "user": "User",
  "item": "Item",
  "score": "Number"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Preferencing/removeScore

**Description:** Removes a user's score preference for an item.

**Requirements:**

* The `user` must have the specified `item` assigned to them.

**Effects:**

* Clears the `item` and `score` from the `user`'s record, removing the preference.

**Request Body:**

```json
{
  "user": "User",
  "item": "Item"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Preferencing/\_getScore

**Description:** Retrieves the score a user has assigned to a specific item.

**Requirements:**

* `user` exists and `item` is associated with `user`

**Effects:**

* return `score` associated with `item`

**Request Body:**

```json
{
  "user": "User",
  "item": "Item"
}
```

**Success Response Body (Query):**

```json
[
  {
    "score": "Number"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Preferencing/\_getAllItems

**Description:** Retrieves all items that a user has scored.

**Requirements:**

* `user` exists

**Effects:**

* list of Item `items` associated with the `user` is returned

**Request Body:**

```json
{
  "user": "User"
}
```

**Success Response Body (Query):**

```json
[
  {
    "items": "Item[]"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
