[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@implementation](implementation.md)

# API Specification: Preferencing Concept

**Purpose:** To allow a user to assign personal numerical scores to multiple items, and to query these scores.

---

## API Endpoints

### POST /api/Preferencing/addScore

**Description:** Assigns a score to an item for a user.

**Requirements:**
- The `user` must not have already scored this specific `item`.
- The `score` must be a valid number.

**Effects:**
- Adds a new preference with the given `user`, `item`, and `score`.

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
---
### POST /api/Preferencing/updateScore

**Description:** Updates the score for a user's preference on a specific item.

**Requirements:**
- The `user` must have already scored the specified `item`.
- The `score` must be a valid number.

**Effects:**
- Updates the `score` for the `user`'s preference on this `item` to the new value.

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
---
### POST /api/Preferencing/removeScore

**Description:** Removes a user's score preference for a specific item.

**Requirements:**
- The `user` must have scored the specified `item`.

**Effects:**
- Removes the preference for this `user` and `item` combination.

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
---
### POST /api/Preferencing/_getScore

**Description:** Retrieves the score a user has assigned to a specific item.

**Requirements:**
- `user` exists and `item` is associated with `user`

**Effects:**
- return `score` associated with `item`

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
---
### POST /api/Preferencing/_getAllItems

**Description:** Retrieves all items that a user has scored.

**Requirements:**
- `user` exists

**Effects:**
- list of Item `items` associated with the `user` is returned

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
    "item": "Item"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---