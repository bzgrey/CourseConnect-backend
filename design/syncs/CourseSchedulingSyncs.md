For both CourseCatalog and Scheduling
In terms of ensuring sessioning for actions and queries, the following will need sessioning syncs (I'm not writing them out because they are pretty generic)
- createSchedule
- \_getUserSchedule
- \_getScheduleComparison
Exclude CourseCatalog actions from being at all accessible from api. They can only be called from backend repo for now


when
    Requesting.request (path: /getUserSchedule, user)
where
    Scheduling.\_getUserSchedule(user) : (event)
    CourseCatalog.\_getEventDetails(event) : (name: String, type: String, times: MeetingTime)
    return frames.collectAs([name, type, times], results);
then
    Requesting.respond (request, results)

when
    Requesting.request (path: /compareSchedules, user1, user2)
where
    Scheduling.\_getScheduleComparison(user1, user2) : (event)
    CourseCatalog.\_getEventDetails(event) : (name: String, type: String, times: MeetingTime)
    return frames.collectAs([name, type, times], results);
then
    Requesting.respond (request, results)
