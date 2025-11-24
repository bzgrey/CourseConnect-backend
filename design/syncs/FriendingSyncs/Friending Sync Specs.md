## SendingFriendRequest sync
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


#### Spec: Reject Friend Request
```sync
sync RejectFriendRequest
when
    Requesting.request(path: "/friending/reject", session, requesterUsername) : (request)
where
    in Sessioning: _getUser(session) returns currentUser
    in UserAuthentication: _getUserByUsername(username: requesterUsername) returns requester
then
    Friending.rejectFriend(requester, requestee: currentUser)
    Requestin




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



























```sync
sync ViewScheduleAsFriend
when
    Requesting.request (path: "/schedules/view", viewer, viewee) : (request)
where
    in Blocking: _isUserBlocked(primaryUser: viewee, secondaryUser: viewer) is false
    in Friending: _areTheyFriends(user1: viewer, user2: viewee) is true
    in Scheduling: _getUserSchedule(user: viewee) gets schedule
then
    Requesting.respond(request, schedule)
```



```sync
sync ViewScheduleBlockedError
when
    Requesting.request (path: "/schedules/view", viewer, viewee) : (request)
where
    in Blocking: _isUserBlocked(primaryUser: viewee, secondaryUser: viewer) is true
then
    Requesting.respond(request, error: "This user has blocked you.")
```


```sync
sync ViewSchedulePermissionDeniedError
when
    Requesting.request (path: "/schedules/view", viewer, viewee) : (request)
where
    in Blocking: _isUserBlocked(primaryUser: viewee, secondaryUser: viewer) is false
    in Friending: _areTheyFriends(user1: viewer, user2: viewee) is false
    NOT EXISTS group WHERE
        in Grouping: _getGroupsForUser(user: viewer) gets group AND
        in Grouping: _getMembers(group) gets member where member is viewee
then
    Requesting.respond(request, error: "You do not have permission to view this schedule.")
```
