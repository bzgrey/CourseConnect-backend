# Summary

In preparation for the user testing, I prepopulated **usertest1's** schedule and **betwos's** schedule. I had the user create their own account and interact with the aforementioned two users through the friends and groups feature.

For groups:
*   **usertest1** created "mathgroup" (which the new user would try to join).
*   The new user created their own group "scigroup" (which **betwos** would join).

### Observations

**Task 1: User Registration**
The user had trouble signing up because they were trying to use the **Sign In/Log In** page without first navigating to the **Sign Up** page. The confusion arose in large part because CourseConnect didn't display a message similar to *"you have not registered an account yet."*

**User Interface**
After registering and logging in, the user spent some time on the User Profile page, saying aloud "Friends, Groups, Friend requests." The **2x3 block format** of the UI made these features easily observable and understood.

**Schedule Page**
The user navigated to the Schedule page, scrolled down to the list of courses, and clicked a course.
*   **Comparison:** They noted that *"this is already better than hydrant,"* referencing that lecture and recitation times were easily visible rather than hidden in a dropdown.
*   **Preference Selection:** They clicked **"Likely"** to indicate they are likely to take the course but noticed nothing happened. They did not realize they had to select a Lecture and/or Recitation time *before* selecting their preference.
*   **Latency Confusion:** Proceeding with selecting an event associated with the course, the user was confused when the UI didn't immediately indicate the click. They did not realize the frontend was waiting for the backend API to update.
*   **Visual Confusion:** The user mistook the background color of an event block for the circle colored green with a white outline in the top-right corner of the block.

**Groups & Bugs**
After the new user created "scigroup" and **betwos** requested to join, the user noted that a message should be displayed next to the group name in the Groups block to indicate a new request. Currently, the admin must click the group name and view the Members block to see pending requests.

**Critical Bug:**
After creating "SciGroup" and removing themselves as admin, we observed that:
1.  Users **usertest1** and **betwos** could still request to join.
2.  On the new user's side, no "pending requests" message could be seen.
3.  This effectively made the other users' pending join requests permanent/unresolvable.
4.  Trying to get around the bug, the new user created a new group called "scigroup" but the error persisted.

---

# Flaws / Opportunities

## 1. Duplicate usage of green to indicate "Likely" preference and event block on calendar view 
*   **Issue:** Confuses users into thinking the event block color corresponds to the "Likely" preference.
*   **Fix:** Change event block color.

## 2. Preference selection of course above lecture/recitation times 
*   **Issue:** Made it seem like you select a preference first.
*   **Fix:** Move preference selection *below* lecture/recitation times **OR** only display preferences after the selection of some event associated with a course.

## 3. Unable to compare a group member and friend's schedule in the calendar view 
*   **Why:** There wasn't an option in the "Groups & Friends" dropdown to select "All," which displays all group members and friends together.
*   **Fix:** Add an "All" option.

## 4. Removing oneself as admin allowed other users to still request to join (Zombie Requests)
*   **Why:** After one removes themself as admin of a group, the group becomes "adminless," so pending join requests are not viewable or resolvable by anyone.
*   **Fix:** Only make the "Make Admin" choice available to users who are currently admins. Ensure they cannot remove their admin position without designating someone else as an admin first, ensuring pending join requests remain viewable.

## 5. Clicking a group name again as admin to see a pending join request
*   **Why:** The only way to see a pending join request is to click the group name and view the members list.
*   **Fix:** Add some message or symbol to indicate a pending join request on the main view.