[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@implementation](implementation.md)

# api: CourseCatalog


# response:

# API Specification: CourseCatalog Concept

**Purpose:** Track the courses offered in a school with all of the information for each course regarding times, class types, name.

---

## API Endpoints

### POST /api/CourseCatalog/defineCourse

**Description:** Creates a new course with its associated event information.

**Requirements:**
- For each meeting time provided, `startTime` must be less than `endTime`.
- A course with the given `name` must not already exist.

**Effects:**
- Creates a new course record.
- Creates new event records for each item in the `events` array and associates them with the new course.
- Returns the ID of the newly created course.

**Request Body:**
```json
{
  "name": "string",
  "events": [
    {
      "type": "string",
      "times": {
        "days": ["string"],
        "startTime": "string",
        "endTime": "string"
      }
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "course": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/CourseCatalog/removeCourse

**Description:** Removes a specified course and all of its associated events from the catalog.

**Requirements:**
- The `course` with the given ID must exist.

**Effects:**
- Deletes the course record.
- Deletes all event records associated with that course.

**Request Body:**
```json
{
  "course": "ID"
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
### POST /api/CourseCatalog/_getAllCourses

**Description:** Retrieves detailed information for all courses in the catalog.

**Requirements:**
- None.

**Effects:**
- Returns an array of all courses, each with its name and a list of its associated events.

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "course": "ID",
    "name": "string",
    "events": [
      {
        "event": "ID",
        "type": "string",
        "times": {
          "days": ["string"],
          "startTime": "string",
          "endTime": "string"
        }
      }
    ]
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
### POST /api/CourseCatalog/_getCourseInfo

**Description:** Retrieves detailed information for a specific list of courses.

**Requirements:**
- All `courses` in the input array must exist.

**Effects:**
- Returns an array of course information objects for each valid course ID provided.

**Request Body:**
```json
{
  "courses": ["ID"]
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "string",
    "events": [
      {
        "event": "ID",
        "type": "string",
        "times": {
          "days": ["string"],
          "startTime": "string",
          "endTime": "string"
        }
      }
    ]
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
### POST /api/CourseCatalog/_getEventInfo

**Description:** Retrieves detailed information for a single event, including its course name.

**Requirements:**
- The `event` with the given ID must exist.

**Effects:**
- Returns an array containing the information for the specified event. The array will be empty if the event is not found.

**Request Body:**
```json
{
  "event": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "event": "ID",
    "name": "string",
    "type": "string",
    "times": {
      "days": ["string"],
      "startTime": "string",
      "endTime": "string"
    }
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