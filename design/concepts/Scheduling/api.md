[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@implementation](implementation.md)

# api: Scheduling
note: all ID's are just strings
# response:

# API Specification: Scheduling Concept

**Purpose:** Track events in one's schedule and compare with others

**Note:** All ID types (`User`, `Event`, `Schedule`) are represented as strings.

---

## API Endpoints

### POST /api/Scheduling/createSchedule

**Description:** Creates a new, empty schedule for a specified user.

**Requirements:**
- The given `user` does not already have a schedule.

**Effects:**
- Creates a new, empty `Schedule` `s`.
- Associates `s` with the `user`.
- Returns the new `Schedule`'s identifier as `schedule`.

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Action):**
```json
{
  "schedule": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Scheduling/scheduleEvent

**Description:** Adds an event to a user's schedule.

**Requirements:**
- The `user` has a schedule.

**Effects:**
- Adds the `event` to the `user`'s schedule.

**Request Body:**
```json
{
  "user": "string",
  "event": "string"
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
### POST /api/Scheduling/unscheduleEvent

**Description:** Removes an event from a user's schedule.

**Requirements:**
- The `user` has a schedule.
- The `event` is in the `user`'s schedule.

**Effects:**
- Removes the `event` from the `user`'s schedule.

**Request Body:**
```json
{
  "user": "string",
  "event": "string"
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
### POST /api/Scheduling/_getUserSchedule

**Description:** Retrieves all event IDs from a user's schedule.

**Requirements:**
- The `user` has a schedule.

**Effects:**
- Returns a set of all events (id's) in the user's schedule.

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "event": "string"
  },
  {
    "event": "string"
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
### POST /api/Scheduling/_getScheduleComparison

**Description:** Returns the common event IDs between the schedules of two users.

**Requirements:**
- Both `user1` and `user2` have schedules.

**Effects:**
- Returns the common event id's between the schedules of `user1` and `user2`.

**Request Body:**
```json
{
  "user1": "string",
  "user2": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "event": "string"
  },
  {
    "event": "string"
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