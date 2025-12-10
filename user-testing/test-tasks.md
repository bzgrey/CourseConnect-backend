# CourseConnect User Testing Tasks

## Overview
These tasks are designed to evaluate the usability of CourseConnect, a course scheduling application that helps students coordinate class schedules with friends and groups. The tasks progress from basic account setup to complex multi-user coordination features, testing the app's unique social scheduling capabilities.

---

## Task List

| # | Task Title | Instruction | Rationale |
|---|------------|-------------|-----------|
| 1 | **Account Registration** | Create a new account with a username and password of your choice, then log in to the application. | This foundational task tests the onboarding experience and whether the login/register toggle is discoverable. We want to learn if users understand they need to switch modes to register vs. login, and if error messages (e.g., "username taken") are clear enough to guide recovery. |
| 2 | **Search and Add Courses** | Find the course "6.1040" (or any course of your choice) and add a lecture time to your schedule. Add every class you are thinking of taking. | Tests the core scheduling workflow and whether the two-panel layout (CourseSearch → CourseInfo) is intuitive. We want to uncover if users understand they need to first search, then select a course, then click on an event to add it. The calendar should update to show the added course—does the user notice this feedback? |
| 3 | **Set Course Preferences** | For the courses you just added, indicate your interest level by marking them as "Likely" (or another preference). Observe how your calendar updates to reflect this preference. | This task tests the preference feature unique to CourseConnect. We want to learn if the preference buttons (Likely/Maybe/Not likely) are discoverable in the CourseInfo panel, and if users understand the color-coded indicators on the calendar. This feature helps friends understand your commitment level. |
| 4 | **Send a Friend Request** | Navigate to your profile page and send a friend request to three other test users (usernames and passwords for test users provided by the facilitator). | Tests the friend request workflow and the autocomplete/suggestion feature. We want to learn if users can find the Friends section, understand the search-and-add pattern, and recognize the difference between searching existing friends vs. adding new ones. |
| 5 | **Accept a Friend Request** | Sign into the three test users (with the usernames and passwords provided by facilatator), and check if you have any incoming friend requests and accept them. Sign back into the account you created and sent the three friend requests from and verify the three test users now appear in your friends list. | Tests the friend request management flow. We want to see if users can locate the "Friend Requests" panel (separate from Friends list), understand the Accept/Reject actions, and notice when the friends list updates after acceptance. |
| 6 | **Compare Schedules with a Friend** | Go to the Schedule page and select a friend to compare schedules with. Identify a time when you're both free and a time when you have overlapping classes. | This is a key differentiating feature of CourseConnect. We want to test if the GroupScheduleList sidebar is discoverable, if users understand clicking a friend overlays their schedule, and if the color-coded legend (green = you, blue = friend) is intuitive for interpreting the comparison. |
| 7 | **Create a Group** | Create a new study group with a name of your choice (e.g., "6.104 Study Group"). | Tests the group creation workflow. We want to learn if users discover the "Create" button in the Groups panel and understand the difference between "Create" (new group) and "Join" (existing group). |
| 8 | **Request to Join an Existing Group** | Search for and request to join an existing group (e.g., "EECS Majors" or a group name provided by the facilitator). Notice where your pending request appears. | Tests the group join request flow. We want to see if users understand the search-then-join pattern, can distinguish between groups they're in vs. groups they're requesting to join, and notice the "Pending Join Requests" section that appears after requesting. |
| 9 | **Manage Group Membership** | First, in the three test users from the facilitator join the group you created. From your account select the group you created, view its members, and if there are pending join requests, accept them. Then, promote a member to admin. | Tests the group admin functionality. We want to learn if users discover they need to click on a group to see its members (in GroupMem panel), if the admin controls (Accept/Decline, Make Admin) are discoverable, and if role changes are reflected clearly. |
| 10 | **View Friends in Course Events** | Select a course and examine the event options. Identify which time slots have friends enrolled and how many. | Tests the "friends in events" feature that helps users coordinate class times. We want to see if users notice the friend count displayed under each event time slot, and if this information influences their scheduling decisions. |
| 11 | **Block a User** | Navigate to the Blocked section on your profile and block a user. Then, attempt to find that user in your friends list or friend suggestions. | Tests the blocking feature and its effect on social features. We want to learn if users understand the block workflow, can find the Blocked panel, and comprehend that blocked users are hidden from friend-related features. |
| 12 | **Multi-Friend Schedule Comparison** | On the Schedule page, select two different friends to compare schedules with simultaneously. Find a time slot where all three of you (yourself and both friends) are available. | Tests the advanced comparison feature (up to 2 friends + self). We want to see if users understand they can select multiple friends, if the three-color system (green/blue/pink) is interpretable, and if the "Clear All" button is discoverable for resetting the comparison. |

---

## Notes for Facilitator

- **Pre-session setup**: Ensure test accounts exist with some pre-populated friends, groups, and schedules so users can interact with realistic data.
- **Estimated time per task**: Tasks 1-4 (~3-4 min each), Tasks 5-8 (~4-5 min each), Tasks 9-12 (~5-6 min each)
- **Total estimated time**: ~40-45 minutes
- **Think-aloud protocol**: Encourage users to verbalize their thought process, especially when they hesitate or look confused.
- **Key observations to note**:
  - Where do users click first when given a task?
  - Do they notice feedback after actions (e.g., calendar updates, list updates)?
  - What terminology do they use vs. what the app uses?
  - Do they understand the relationship between the three-column layouts on each page?
