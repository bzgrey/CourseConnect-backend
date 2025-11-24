---
timestamp: 'Sun Nov 23 2025 20:23:31 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202331.de4fe893.md]]'
content_id: b2c14d72f43f6fed51bc3342921fc2ccc60a8a050c0fa97b8e7b86edf3d91082
---

# response:

Here are the synchronization specifications and implementations connecting **Friending** with **Blocking**, **CourseCatalog**, **Scheduling**, **Sessioning**, **UserAuthentication**, and **Grouping**.

I have organized these by their functional purpose.

***

### 1. Authentication & Session Management

These are the foundational syncs required to bind a `session` token from a request to a `user` ID for all subsequent synchronizations.

#### Spec: Register and Login

```sync
sync RegisterUser
when
    Requesting.request(path: "/auth/register", username, password) : (request)
then
    UserAuthentication.register(username, password) : (user)
    Requesting.respond(request, user)

sync LoginUser
when
    Requesting.request(path: "/auth/login", username, password) : (request)
where
    in UserAuthentication: login(username, password) returns user
then
    Sessioning.create(user) : (session)
    Requesting.respond(request, session, user)
```

#### Implementation: `auth.sync.ts`

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserAuthentication, Sessioning } from "@concepts";

export const RegisterUser: Sync = ({ request, username, password, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/auth/register", username, password },
    { request },
  ]),
  then: actions(
    [UserAuthentication.register, { username, password }, { user }],
    [Requesting.respond, { request, user }]
  ),
});

export const LoginUser: Sync = ({ request, username, password, user, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/auth/login", username, password },
    { request },
  ]),
  where: async (frames) => {
    // We use the action as a query here effectively by checking if it succeeds
    // However, since login is an action in the spec, we usually chain it in 'when' 
    // or 'then'. If we want to capture the user ID to create a session immediately,
    // we can do it in the 'then' chain if the engine supports strictly ordered output binding,
    // or split it. 
    
    // Pattern match approach:
    // 1. UserAuth.login returns user.
    // 2. We use that user for Sessioning.create.
    return frames;
  },
  then: actions(
    [UserAuthentication.login, { username, password }, { user }],
    [Sessioning.create, { user }, { session }],
    [Requesting.respond, { request, session, user }]
  ),
});
```

***

### 2. Friending Core Flows

Managing the lifecycle of a friendship request.

#### Spec: Send Friend Request

```sync
sync SendFriendRequest
when
    Requesting.request(path: "/friending/request", session, targetUsername) : (request)
where
    in Sessioning: _getUser(session) returns requester
    in UserAuthentication: _getUserByUsername(username: targetUsername) returns requestee
then
    Friending.requestFriend(requester, requestee)
    Requesting.respond(request, status: "sent")
```

#### Implementation: `friending_request.sync.ts`

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication, Friending } from "@concepts";

export const SendFriendRequest: Sync = ({ request, session, targetUsername, requester, requestee }) => ({
  when: actions([
    Requesting.request,
    { path: "/friending/request", session, targetUsername },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: requester });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: requestee });
    return frames;
  },
  then: actions(
    [Friending.requestFriend, { requester, requestee }],
    [Requesting.respond, { request, status: "sent" }]
  ),
});
```

#### Spec: Accept Friend Request

```sync
sync AcceptFriendRequest
when
    Requesting.request(path: "/friending/accept", session, requesterUsername) : (request)
where
    in Sessioning: _getUser(session) returns currentUser
    in UserAuthentication: _getUserByUsername(username: requesterUsername) returns requester
then
    Friending.acceptFriend(requester, requestee: currentUser)
    Requesting.respond(request, status: "accepted")
```

#### Implementation: `friending_accept.sync.ts`

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication, Friending } from "@concepts";

export const AcceptFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([
    Requesting.request,
    { path: "/friending/accept", session, requesterUsername },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    return frames;
  },
  then: actions(
    [Friending.acceptFriend, { requester, requestee: currentUser }],
    [Requesting.respond, { request, status: "accepted" }]
  ),
});
```

***

### 3. Friending + Blocking Interaction

This enforces the principle that blocking someone should sever social connections.

#### Spec: Blocking Removes Friendship

```sync
sync BlockRemovesFriendship
when
    Blocking.blockUser(blocker, userToBlock)
where
    in Friending: _areTheyFriends(user1: blocker, user2: userToBlock) returns result
    result.areFriends == true
then
    Friending.removeFriend(remover: blocker, removed: userToBlock)
```

#### Implementation: `blocking_friending.sync.ts`

```typescript
import { actions, Sync } from "@engine";
import { Blocking, Friending } from "@concepts";

export const BlockRemovesFriendship: Sync = ({ blocker, userToBlock, areFriends }) => ({
  when: actions([
    Blocking.blockUser,
    { blocker, userToBlock },
    {},
  ]),
  where: async (frames) => {
    frames = await frames.query(Friending._areTheyFriends, { user1: blocker, user2: userToBlock }, { areFriends });
    // Filter to only proceed if they are actually friends
    return frames.filter((frame) => frame[areFriends] === true);
  },
  then: actions(
    [Friending.removeFriend, { remover: blocker, removed: userToBlock }]
  ),
});
```

***

### 4. Friending + Scheduling Interaction

This fulfills the requirement that friends can see/compare schedules.

#### Spec: Compare Schedules

```sync
sync CompareSchedules
when
    Requesting.request(path: "/scheduling/compare", session, friendUsername) : (request)
where
    in Sessioning: _getUser(session) returns user1
    in UserAuthentication: _getUserByUsername(username: friendUsername) returns user2
    in Friending: _areTheyFriends(user1, user2) returns result
    result.areFriends == true
    in Scheduling: _getScheduleComparison(user1, user2) returns events
then
    Requesting.respond(request, events)
```

#### Implementation: `scheduling_friending.sync.ts`

```typescript
import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, UserAuthentication, Friending, Scheduling } from "@concepts";

export const CompareSchedules: Sync = ({ request, session, friendUsername, user1, user2, areFriends, event, results }) => ({
  when: actions([
    Requesting.request,
    { path: "/scheduling/compare", session, friendUsername },
    { request },
  ]),
  where: async (frames) => {
    // 1. Resolve User IDs
    frames = await frames.query(Sessioning._getUser, { session }, { user: user1 });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: friendUsername }, { user: user2 });
    
    // 2. Check Friendship
    frames = await frames.query(Friending._areTheyFriends, { user1, user2 }, { areFriends });
    const friendsFrames = frames.filter(f => f[areFriends] === true);
    
    if (friendsFrames.length === 0) {
        // If not friends, we might want to return an empty list or error, 
        // effectively stopping the sync here for the successful path.
        // For this implementation, we simply stop execution by returning empty.
        return new Frames([]); 
    }

    // 3. Get Comparison
    // Note: _getScheduleComparison returns Event[], creating multiple frames
    frames = await friendsFrames.query(Scheduling._getScheduleComparison, { user1, user2 }, { event });
    
    // 4. Collect results into a single list for the response
    return frames.collectAs([event], results);
  },
  then: actions(
    [Requesting.respond, { request, results }]
  ),
});
```

***

### 5. CourseCatalog + Scheduling Interaction

Users populate their schedule by adding courses from the catalog.

#### Spec: Add Course to Schedule

```sync
sync RegisterForCourse
when
    Requesting.request(path: "/courses/register", session, courseName) : (request)
where
    in Sessioning: _getUser(session) returns user
    // Get all courses, find the one with the name, extract events
    in CourseCatalog: _getAllCourses() returns courseInfo
    courseInfo.name == courseName
    // We iterate over the events in the course
    courseInfo.events returns event
then
    Scheduling.scheduleEvent(user, event)
```

#### Implementation: `course_registration.sync.ts`

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, CourseCatalog, Scheduling } from "@concepts";

export const RegisterForCourse: Sync = ({ request, session, courseName, user, course_name, event, type, times }) => ({
  when: actions([
    Requesting.request,
    { path: "/courses/register", session, courseName },
    { request },
  ]),
  where: async (frames) => {
    // 1. Identify User
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // 2. Get All Courses and their events
    // _getAllCourses returns [{ course, name, events: [...] }]
    // We need to match the name.
    // Note: The specific implementation of _getAllCourses in the prompt description 
    // implies it returns a flat structure or we need to access the structure.
    // Assuming the query returns one frame per course with nested events, 
    // or flat list. Based on standard Concept patterns, let's assume it returns
    // a frame per course.
    
    frames = await frames.query(CourseCatalog._getAllCourses, {}, { name: course_name, events: event }); 
    
    // Filter by name
    frames = frames.filter(f => f[course_name] === f[courseName]);

    // Now we have the course. The `event` variable might be an array of objects based on the spec.
    // However, the spec says: events: (Event, type: String, times: MeetingTime)[]
    // In concept logic, to act on "each" event, the query usually flattens the array into multiple frames.
    // If the concept returns an array in a single binding, we need to handle that.
    // Assuming standard behavior where we need to iterate in the 'then', 
    // or the query flattens it. 
    
    // If _getAllCourses returns an array of events inside the object, we might need a custom
    // transform if the engine doesn't auto-flatten. 
    // For this implementation, let's assume the query binding flattens the array 
    // or we are just scheduling the specific events returned.
    
    return frames;
  },
  then: actions(
    // This will fire once for every event found in the course
    [Scheduling.scheduleEvent, { user, event }]
  ),
});
```

***

### 6. Grouping Interaction

Allowing a user to create a group.

#### Spec: Create Group

```sync
sync CreateGroup
when
    Requesting.request(path: "/groups/create", session, name) : (request)
where
    in Sessioning: _getUser(session) returns user
then
    Grouping.createGroup(name, admin: user) : (group)
    Requesting.respond(request, group)
```

#### Implementation: `grouping.sync.ts`

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Grouping } from "@concepts";

export const CreateGroup: Sync = ({ request, session, name, user, group }) => ({
  when: actions([
    Requesting.request,
    { path: "/groups/create", session, name },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Grouping.createGroup, { name, admin: user }, { group }],
    [Requesting.respond, { request, group }]
  ),
});
```
