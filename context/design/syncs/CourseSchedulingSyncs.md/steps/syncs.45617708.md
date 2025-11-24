---
timestamp: 'Sun Nov 23 2025 21:44:07 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251123_214407.12ce6c29.md]]'
content_id: 4561770851832401caac24bb507048124aa6044c977a9a5ba759a63f9ce141fa
---

# syncs: make 2 CourseScheduling syncs

Just make the two syncs described connecting Scheduling and CourseCatalog, Also add a check for a sessioning key.

when
Requesting.request (path: /getUserSchedule, user)
where
Scheduling.\_getUserSchedule(user) : (event)
CourseCatalog.\_getEventDetails(event) : (name: String, type: String, times: MeetingTime)
return frames.collectAs(\[name, type, times], results);
then
Requesting.respond (request, results)

when
Requesting.request (path: /compareSchedules, user1, user2)
where
Scheduling.\_getScheduleComparison(user1, user2) : (event)
CourseCatalog.\_getEventDetails(event) : (name: String, type: String, times: MeetingTime)
return frames.collectAs(\[name, type, times], results);
then
Requesting.respond (request, results)

Here is an example of the sessioning addition:

```
export const CreateScheduleRequest: Sync = ({ request, session, user }) => ({

when: actions([

Requesting.request,

{ path: "/Scheduling/createSchedule", session },

{ request },

]),

where: async (frames) => {

// Authenticate: Resolve session to user.

// If session is invalid, query returns empty, frames become empty, sync stops.

return await frames.query(Sessioning._getUser, { session }, { user });

},

then: actions(

// Create the schedule for the authenticated user

[Scheduling.createSchedule, { user }],

),

});

  

export const CreateScheduleResponse: Sync = (

{ request, user, schedule },

) => ({

when: actions(

[Requesting.request, { path: "/Scheduling/createSchedule" }, { request }],

[Scheduling.createSchedule, { user }, { schedule }],

),

then: actions([Requesting.respond, { request, schedule }]),

});

  

export const CreateScheduleError: Sync = (

{ request, user, error },

) => ({

when: actions(

[Requesting.request, { path: "/Scheduling/createSchedule" }, { request }],

[Scheduling.createSchedule, { user }, { error }],

),

then: actions([Requesting.respond, { request, error }]),

});
```
