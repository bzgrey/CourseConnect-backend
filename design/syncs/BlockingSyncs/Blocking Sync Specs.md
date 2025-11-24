
```sync
sync ViewScheduleBlockedError
when
    Requesting.request (path: "/schedules/view", viewer, viewee) : (request)
where
    in Blocking: _isUserBlocked(primaryUser: viewee, secondaryUser: viewer) is true
then
    Requesting.respond(request, error: "This user has blocked you.")
```
