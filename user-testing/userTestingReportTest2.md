
# Summary 
In preparation for the user testing, I prepopulated usertest1's schedule, betwos's schedule and had the user create their own account and interact with aforementioned two users through the friends and groups feature. For groups, I had "mathgroup", which usertest1 created and the new user would try to join; and, the new user created their own group "scigroup", which betwos would join. 

For task 1, user registration, the user had trouble signing up because they were trying to sign up using the sign in/ log in page, without first navigating to the sign-up page. The confusion arose in large part because CourseConnect didn't display a message similar to "you have not registered an account yet". After registering and logging in, the user spent some time on the User Profile page, saying aloud "Friends, Groups, Friend requests", which the 2x3 block format of the UI made easily observable and easily understood. Then, the user navigated to the Schedule page, scrolled down to the list of courses, clicked a course and noted that "this is already better than hydrant", in reference to the lecture and recitation times being easily visible and not hidden in a dropdown as in hydrant. They clicked "Likely", to indicate they are likely to take the course, but noticed that nothing happened, not realizing they have to select a Lecture and/or recitation time before they can select their preference. Proceeding with selecting some event associated with the course, the user was confused when after clicking an event the UI didn't indicate they had clicked an event, not realizing that the frontend was using the backend API and taking some time to update.  Notable moments after this initial stage include mistaking the background color of an event block with the circle colored green with a white outline in the top-right corner of the block. Additionally, after the new user created the group "scigroup" which "betwos" requested to join, the new user communicated that "some message" next to the group name in the Groups block be displayed to know if a new user has requested to join, instead of having the admin click the group name, see the members in the Members block and only then see that someone new has tried to join the group. One notable bug, however the new user encountered was after creating the group "SciGroup", removing himself as admin, we observed that users "usertest1" and "betwos" could still request to join, but on the new users side no pending requests message would be seen, effectively making the other users pending join requests permanent. Trying to get around the bug, the new user created a new group called "scigroup" but the error persisted. 

# Flaws

## 1. Duplicate usage of green to indicate "Likely" preference and event block on calendar view
- Confuses users into thinking the event block color corresponds to the "Likely" preference
- Fix: Change event block color
## 2. Preference selection of course above lecture/recitation times made it seem like you select a preference first
- Fix: Move preference selection below lecture/recitation times OR only display preferences after selection of some event associated with a course,

## 3. Not being able to compare a group member and some friends schedule in the calendar view
- Why: There wasn't an option in the "Groups&Friends" dropdown to select "All", which displays all group members and friends together
- Fix: add an "All" option
## 4. Removing oneself as admin allowed other users to still request to join but pending joins couldn't be viewed
- Why: After one removes himself/herself as admin of a group, the group becomes "adminless", so pending join requests are not viewable or resolvable by anyone
- Fix: Only "Make Admin" choice available to users who are admins, so they can't remove their admin position without designating someone else as an admin thus pending join requests are viewable by someone again

## 5. Clicking a group name again as admin to see a pending join request
- Why: The only way to see a pending join request is to click the group name and view the members list
- Fix: add some message (symbol) to indicate a pending join request