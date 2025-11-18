[@implementing-synchronizations](../background/implementing-synchronizations.md)

**Note:** These proposals assume the existence of some logical but undefined actions or queries to be fully robust (e.g., `deleteCourse`, `deleteSchedule`, and a way to query all users). These assumptions are noted where applicable.

```sync
sync RemovePreferenceOnEventRemoval
when
    CourseScheduling.removeEvent (user, event)
where
    // Check if the removed event is the one the user has a score for.
    // This query will only produce a frame if a score exists for this user and item.
    in Preferencing: _getScore (user, item: event)
then
    // If the 'where' clause matched, remove the corresponding score.
    Preferencing.removeScore (user, item: event)
```


**Assumption:** This sync assumes a `CourseScheduling.deleteCourse(course)` action exists. It also assumes a way to iterate through all users, perhaps from a separate `User` concept (e.g., `User._getAllUsers()`).

```sync
sync RemovePreferenceOnCourseDeletion
when
    // An admin action to delete a course from the system.
    CourseScheduling.deleteCourse (course)
where
    // First, get every user in the system.
    in User: _getAllUsers () gets user
    // Then, for each user, check if their preferred item is the course being deleted.
    in Preferencing: _getScore (user, item: course)
then
    // For every user that matched, remove their score for the deleted course.
    Preferencing.removeScore (user, item: course)
```



```sync
sync AddDefaultPreferenceOnEventAddition
when
    CourseScheduling.addEvent (user, event, name, type)
where
    // The `_getAllItems` query returns all items scored by a user.
    // We proceed only if this list is empty, meaning the user has no current preference.
    in Preferencing: _getAllItems (user) is []
then
    // Since the user has no preference, add one for this new event with a default score of 0.
    // Note: The `Preferencing.addScore` action requires that the user has no current score.
    Preferencing.addScore (user, item: event, score: 0)
```


**Assumption:** This sync assumes a `CourseScheduling.deleteSchedule(user)` action exists. It also assumes a more convenient query like `Preferencing._getPreference(user) gets item` that can retrieve a user's single preferred item without needing it as an input.

```sync
sync ClearPreferencesOnScheduleDeletion
when
    CourseScheduling.deleteSchedule (user)
where
    // Find the specific item the user has a preference for, if any.
    in Preferencing: _getPreference (user) gets item
then
    // If a preference was found, remove it.
    Preferencing.removeScore (user, item)
```