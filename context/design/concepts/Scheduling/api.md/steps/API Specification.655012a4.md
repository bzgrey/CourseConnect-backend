---
timestamp: 'Fri Nov 21 2025 09:48:29 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251121_094829.fc3f7a38.md]]'
content_id: 655012a42e32d558d70973519b8e3584b92876e919da51304fe1b105d1db9af1
---

# API Specification: Scheduling Concept

**Purpose:** Track events in one's schedule and compare with others

***

## API Endpoints

### POST /api/Scheduling/createSchedule

**Description:** Creates a new, empty schedule for a specified user.

**Requirements:**

* The given `user` does not already have a schedule.

**Effects:**

* Creates a new, empty `Schedule` `s`.
* Associates `s` with the `user`.
* Returns the new `Schedule`'s identifier as `schedule`.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "schedule": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Scheduling/scheduleEvent

**Description:** Adds an event to a user's schedule.

**Requirements:**

* The `user` has a schedule.

**Effects:**

* Adds the `event` to the `user`'s schedule.

**Request Body:**

```json
{
  "user": "ID",
  "event": "ID"
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

### POST /api/Scheduling/unscheduleEvent

**Description:** Removes an event from a user's schedule.

**Requirements:**

* The `user` has a schedule, and the `event` is in the `user`'s schedule.

**Effects:**

* Removes the `event` from the `user`'s schedule.

**Request Body:**

```json
{
  "user": "ID",
  "event": "ID"
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

### POST /api/Scheduling/\_getUserSchedule

**Description:** Retrieves all event IDs in a user's schedule.

**Requirements:**

* The `user` has a schedule.

**Effects:**

* Returns a set of all events (id's) in the user's schedule.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "event": "ID"
  },
  {
    "event": "ID"
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

### POST /api/Scheduling/\_getScheduleComparison

**Description:** Retrieves the common event IDs between the schedules of two users.

**Requirements:**

* Both `user1` and `user2` have schedules.

**Effects:**

* Returns the common event id's between the schedules of user1 and user2.

**Request Body:**

```json
{
  "user1": "ID",
  "user2": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "event": "ID"
  },
  {
    "event": "ID"
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
