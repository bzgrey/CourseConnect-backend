# Design Summary 
[@ConceptDesign](FunctionalDesign/ConceptDesign.md)
[@ProblemFraming](ProblemFraming.md)
[@DevelopmentPlan](DevelopmentPlan.md)
[@VisualDesignStudy](VisualDesignStudy.md)



# prompt: A summary of the overall design: how the concepts work together to solve the problem; how the design addresses any concerns that your ethics analysis raised; which issues remain unclear.
 
# response:

Here is a summary of the overall design.

***

### Overall Design and Workflow

This design outlines a modern, socially-aware course registration system. Its primary goal is to streamline the complex process of academic scheduling by integrating student preferences and social connections directly into the registration workflow. The system moves beyond the traditional, solitary model of course selection to a collaborative one, acknowledging that students often coordinate schedules with friends and project partners.

The workflow begins with **[UserAuthentication](design/concepts/UserAuthentication/UserAuthentication.md)** and **[Sessioning](design/concepts/Sessioning/Sessioning.md)**, which establish a secure and persistent environment for each student. Once logged in, the student's primary resource is the **[CourseCatalog](design/concepts/CourseCatalog/CourseCatalog.md)**, a comprehensive repository of all available courses and their schedules.

The core innovation lies in how students interact with this catalog. Instead of just selecting courses, they can leverage a suite of social and preference-based tools:
*   **[Friending](design/concepts/Friending/Friending.md)** allows students to build a social graph, enabling them to view friends' tentative schedules (with permission) and coordinate course selections.
*   **[Grouping](design/concepts/Grouping/Grouping.md)** formalizes this coordination, allowing a set of students to register for one or more courses as a single unit, which is crucial for project-based classes or study groups.
*   **[Preferencing](design/concepts/Preferencing/Preferencing.md)** allows students to add "soft constraints" to their schedule, such as "no classes on Fridays" or "prefer morning sections," which the system will attempt to honor.
*   **[Blocking](design/concepts/Blocking/Blocking.md)** serves as a critical safety and control mechanism, allowing a user to prevent another user from seeing their information or interacting with them through the system's social features.

All these inputs—course selections, friend requests, group constraints, and preferences—are fed into the central **[Scheduling](design/concepts/Scheduling/Scheduling.md)** engine. This engine acts as a constraint satisfaction solver, attempting to generate a valid, conflict-free schedule that best accommodates the user's and their group's requirements.

### Addressing Ethical Concerns

The design anticipates and addresses several key ethical concerns inherent in a system that merges academic and social data:

1.  **Privacy and Consent:** The social features are designed to be opt-in. A student's schedule and friend list are not public by default. The **[Friending](design/concepts/Friending/Friending.md)** concept requires mutual consent before any schedule information is shared. The **[Blocking](design/concepts/Blocking/Blocking.md)** concept provides a powerful, user-controlled tool to revoke access and enforce personal boundaries, protecting students from unwanted social interactions or monitoring.

2.  **Fairness and Equity:** A major concern is that students with larger social networks or in powerful groups could gain an unfair advantage in securing seats in high-demand courses. The design addresses this by separating the inputs from the final registration. **[Preferencing](design/concepts/Preferencing/Preferencing.md)** and **[Grouping](design/concepts/Grouping/Grouping.md)** are inputs to the **[Scheduling](design/concepts/Scheduling/Scheduling.md)** algorithm, but the algorithm itself can be tuned to enforce fairness. For example, it can be programmed to prioritize graduation requirements over social groupings, or to use a lottery system for over-enrolled courses, ensuring that individual students are not systematically disadvantaged.

3.  **Exclusion and Coercion:** The **[Grouping](design/concepts/Grouping/Grouping.md)** feature could potentially be used to form cliques and exclude others. The design mitigates this by ensuring that individual registration remains a primary and fully supported pathway. No student is *forced* to use the grouping feature. Furthermore, the **[Blocking](design/concepts/Blocking/Blocking.md)** mechanism empowers students to disengage from any group or individual, providing a safeguard against peer pressure or harassment.

### Unclear Issues and Next Steps

Despite its comprehensive nature, the design leaves several critical areas to be defined:

1.  **The Scheduling Algorithm's Logic:** The **[Scheduling](design/concepts/Scheduling/Scheduling.md)** concept is the system's heart, but its precise behavior is undefined. How will it prioritize conflicting constraints? For example, is a student's personal preference ("no 8 AM classes") more or less important than a group's need to take a class together? A detailed specification for conflict resolution and constraint weighting is the most critical next step.

2.  **Scalability and Performance:** Course registration is a high-concurrency event where thousands of students attempt to access the system simultaneously. The performance implications of a complex, constraint-based scheduling engine running at scale are not addressed. Stress testing and performance modeling will be required to ensure the system is viable.

3.  **Data Governance and Policy:** The design concepts describe functionality but not policy. Who has administrative access to the social graph data? What are the data retention policies for user preferences and friend lists? Clear policies must be established to prevent misuse of this sensitive data by the institution itself.

4.  **Edge Case Management in Social Interactions:** The interaction between **[Blocking](design/concepts/Blocking/Blocking.md)**, **[Friending](design/concepts/Friending/Friending.md)**, and **[Grouping](design/concepts/Grouping/Grouping.md)** can create complex edge cases. For instance, what happens if a member of a successfully registered group subsequently blocks another member? Does it invalidate their shared class? These scenarios need to be mapped out and resolved.


# prompt: revise the above given the defintions of the following concepts 

*   **concept**: Blocking [User]
*   **purpose**: To empower users to prevent specific individuals from viewing their information, even if they are in a shared group or context.
*   **principle**: If User A blocks User B, then even if they are both members of the same group, any application feature that tries to show User A's schedule to User B will fail or show nothing.
*   **state**:
    * A set of blockLists with:
      * a `user`:User
      * a `blockedUsers` list of Users
*   **actions**:
    * `blockUser (blocker: User, userToBlock: User)`
      * **requires** blocker is not userToBlock
      * **effects** If blocker exists as a user in `blockLists`, add `userToBlock` to `blockedUsers` for the entry of blockLists with user==blocker if userToBlock isn't already in the `blockedUsers` list. Otherwise create a new blockLists entry with user=blocker, and the list [userToBlock]
    * `unblockUser (blocker: User, userToUnblock: User)`
      * **requires** `userToUnblock` is in the `blockedUsers` list for the entry in blockLists where `user` is `blocker`
      * **effects** Removes the pair `userToUnblock` from the `blockedUsers` list.
* **queries**:
  * `_isUserBlocked(primaryUser: User, secondaryUser: User): [Boolean]`
    * **effects** Returns true if `primaryUser` is a user in a blockLists entry and `secondaryUser` is in that entry’s `blockedUsers` list.
  * `blockedUsers(user:User):Users[]`
    * **effects** returns blockedUsers for blockLists entry with `user`, and if one doesn't exist return an empty list
# concept: CourseCatalog

**concept:** CourseCatalog\[Event]

**types**:
  * `MeetingTime`:
    * a set of `days` (e.g., {Tuesday, Thursday})
    * a `startTime` of type `Time`
    * an `endTime` of type `Time`

**state**:
* a set of Courses with 
	* a name String
	* a set of Events
* a set of Events with 
	* a type String (one of Lecture/Recitation/Lab)
	* a MeetingTime

**actions**:
* `defineCourse (name: String, events: (Event, type: String, times: MeetingTime)): (course: Course)`
    * **requires**: For each meeting time provided, `startTime < endTime`.  Course with given name doesn't exist
    * **effects**: Creates a new course in the set of Courses with defined lecture and optional recitation and lab times. This is typically an administrative action. 

**queries:** 
* \_getCourseInfo (courses: Course\[]): ((name: String, events: (Event, type: String, times: MeetingTime))\[])
	* **requires:** courses exist
	* **effects:** returns the course info for each course
* \_getEventTimes (events: Event\[]): ((event, times: MeetingTime)\[])
	* **requires:** each event exists
	* **effects:** returns the MeetingTimes for each given event


# concept: Scheduling

**concept**: Scheduling \[User, Event]
**purpose**: Track events in one's schedule and compare with others
**principle**: If a user adds different events to their schedule, they can then compare schedules and see which events they have in common. 

**types**:
  * `MeetingTime`:
    * a set of `days` (e.g., {Tuesday, Thursday})
    * a `startTime` of type `Time`
    * an `endTime` of type `Time`

**state**:
* a set of Users with
	* a Schedule
* a set of Schedules with
	* a user User
	* a set of Events
* a set of Events with
	* a name String (could be the Course name)
	* a type String (Lecture/Recitation/Lab/other)
	* a MeetingTime
	* an optional user User

**actions:**
* **`createSchedule (user: User): (schedule: Schedule)`**
    *   **requires**: The given `user` does not already have a schedule.
    *   **effects**: Creates a new, empty `Schedule` `s`; associates `s` with the `user`; returns the new `Schedule`'s identifier as `schedule`.
* **`addEvent (event: Event, name: String, type: String, time: MeetingTime, user?: User)`**
    *   **requires**: the `event` isn't already in the set of Events
    *   **effects**: Adds the `event` to the set of Events with the given info
* **`removeEvent (event: Event, user?: User)`**
    *   **requires**: The `event` is in set of events; If a user is given, then the event must have this user
    *   **effects**: Removes the `event` from the `user`'s schedule.
* scheduleEvent (user: User, event: Event)
    *   **requires**: The `user` has a schedule; the `event` is in the set of Events
    *   **effects**: Adds the `event` to the `user`'s schedule.
* **`unscheduleEvent (user: User, event: Event)`**
    *   **requires**: The `user` has a schedule, and the `event` is in the `user`'s schedule.
    *   **effects**: Removes the `event` from the `user`'s schedule.

**queries**:
* **`_getUserSchedule(user: User):(event: Event, name: String, type: String, times: MeetingTime)[]`**
    *   **requires**: The `user` has a schedule.
    *   **effects**: Returns a set of all events (id's) in the user's schedule with their names, types, and times
* **`_getScheduleComparison (user1: User, user2: User): events: Event[]`**
    *   **requires**: Both `user1` and `user2` have schedules.
    *   **effects**: Returns the common event id's between the schedules of user1 and user

*   **concept**: Friending [User]
*   **purpose**: To manage mutual, consent-based social connections between users.
*   **principle**: If User A sends a friend request to User B, and User B accepts the request, then User A and User B will appear on each other's friends list.
*   **state**:
    `pendingRequests: a set of (requester: User, requestee: User)`
    `friends: a set of {user1: User, user2: User}` (a symmetric relationship)
*   **actions**:
    `requestFriend (requester: User, requestee: User)`
      **requires** `requester` and `requestee` are not already friends. A pending request from `requester` to `requestee` does not already exist. `requester` is not `requestee`.
      **effects** Adds the pair (`requester`, `requestee`) to the `pendingRequests` set.

    `acceptFriend (requester: User, requestee: User)`
      **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
      **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`. Adds the pair `{requester, requestee}` to the `friends` set.

    `rejectFriend (requester: User, requestee: User)`
      **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
      **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`.

    `removeFriend (remover: User, removed: User)`
      **requires** `remover` and `removed` are friends.
      **effects** Removes the pair `{remover, removed}` from the `friends` set.

*   **queries**
    `_getAllFriendRequests (user:User):User[]`
      **effects** returns list of requestees for user

    `_getAllFriends (user:User):User[]`
      **effects** returns list of friends for user

    `_areTheyFriends(user1:User, user2:User): Boolean`
      **effects** returns true if {user1, user2} exists in friends otherwise false

# concept: Grouping [User]

*   **purpose**: Manage the lifecycle of groups and their membership.
*   **principle**: An admins creates a private Group, allowing future users to request to join, inviting and removing members, and managing member roles (such as owner or administrator). It provides the fundamental mechanics of association that can be used for a wide variety of features, such as team collaboration, social clubs, or access control lists.

*   **state**:
    *   a set of `Group`s with
        *   a `name` String
        *   a `members` set of unique ID
        *   a `memberRoles` map from unique ID to Role (`ADMIN` | `MEMBER`)
        *   a `requests` set of unique ID (e.g., `User` requesting to join)

*   **actions**:

*   `createGroup (name: String, admin: User): (group: Group)`
    *   **requires**: no Group exists with the given `name`.
    *   **effects**: create new `group` with `name` name, `admin` as only member in `members`, `admin` having role `ADMIN` in `memberRoles`, and returns `group`.

*   `deleteGroup (group: Group)`
    *   **requires**: the given `group` exists.
    *   **effects**: deletes the given `group` and its association with its members.

*   `renameGroup (group: Group, newName: String)`
    *   **requires**: the given `group` exists and no other Group has the `newName`.
    *   **effects**: updates the `name` of the `group` to `newName`.

*   `confirmRequest (group: Group, requester: User)`
    *   **requires**: the given `group` exists and `group.requests` contains `requester`.
    *   **effects**: adds the `requester` to `group.members`, adds `requester` to `group.memberRoles` as `MEMBER`, deletes associated `requester` `group.requests`.

*   `declineRequest (group: Group, requester: User)`
    *   **requires**: the given `group` exists and `group.requests` contains `requester`.
    *   **effects**: deletes the `requester` from `group.requests`.

*   `requestToJoin (group: Group, requester: User)`
    *   **requires**: the given `group` exists and the `requester` isn't already in `group`.
    *   **effects**: creates request in `group.requests` for `requester.

*   `adjustRole (group: Group, member: User, newRole: String)`
    *   **requires**: `group` exists, `group.members` contains `member`, and `newRole` is `ADMIN` | `MEMBER`
    *   **effects**: updates `group.memberRoles` for `member` to be `newRole`

*   **queries**:

*   `_getMembers (group: Group): (member: User)`
    *   **requires** `group` exists
    *   **effects** returns the set of all users in the `members` set of the given `group`

*   `_getAdmins (group: Group): (admin: User)`
    *   **requires** `group` exists
    *   **effects** returns the set of all users in the `admins` set of the given `group`

*   `_getRequests (group: Group): (requestingUser: User)`
    *   **requires** `group` exists
    *   **effects** returns the set of all users in the `requests` set of the given `group`

*   `_getGroupByName (name: String): (group: Group)`
    *   **requires** a group `g` with `g.name = name` exists
    *   **effects** returns the group `g`

* **concept**: Preferencing \[User, Item]

* **purpose**: To allow a user to assign a personal numerical score to a single item at a time, and to query this score.

* **principle**: Each user can assign a score to at most one item at any given time. Assigning a score to an item (either new or existing) replaces any previously held item and score for that user.

* **state**:
  * A set of `Users` with
    * an `item` of type `Item`
    * a `score` of type `Number`

* **actions**:
  * `addScore (user: User, item: Item, score: Number)`
    * **requires**: The `user` must not currently have an `item` and `score` assigned. The `score` must be a valid number.
    * **effects**: Assigns the given `item` and `score` to the `user`.
  * `updateScore (user: User, item: Item, score: Number)`
    * **requires**: The `user` must already have the specified `item` assigned. The `score` must be a valid number.
    * **effects**: Updates the `score` for the `user`'s assigned `item` to the new value.
  * `removeScore (user: User, item: Item)`
    * **requires**: The `user` must have the specified `item` assigned to them.
    * **effects**: Clears the `item` and `score` from the `user`'s record, removing the preference.

* **queries**:
  * `_getScore (user: User, item: Item): (score: Number)`
    * **requires**: `user` exists and `item` is associated with `user`
    * **outputs**: return `score` associated with `item`

  * `_getAllItems(user: User): (items: Item[])`
    * **requires** `user` exists
    * **effects**: list of Item `items` associated with the `user` is returned
# concept: Sessioning [User]

*   **purpose**: To maintain a user's logged-in state across multiple requests without re-sending credentials.
*   **principle**: After a user is authenticated, a session is created for them. Subsequent requests using that session's ID are treated as being performed by that user, until the session is deleted (logout).
*   **state**:
    *   a set of `Session`s with
        *   a `user` User
*   **actions**:
    *   `create (user: User): (session: Session)`
        *   **requires**: true.
        *   **effects**: creates a new Session `s`; associates it with the given `user`; returns `s` as `session`.
    *   `delete (session: Session): ()`
        *   **requires**: the given `session` exists.
        *   **effects**: removes the session `s`.
*   **queries**:
    *   `_getUser (session: Session): (user: User)`
        *   **requires**: the given `session` exists.
        *   **effects**: returns the user associated with the session.


# concept: UserAuthentication

*   **purpose**: To securely verify a user's identity based on credentials.
*   **principle**: If you register with a unique username and a password, and later provide the same credentials to log in, you will be successfully identified as that user.
*   **state**:
    *   a set of `User`s with
        *   a `username` String (unique)
        *   a `passwordHash` String
*   **actions**:
    *   `register (username: String, password: String): (user: User)`
        *   **requires**: no User exists with the given `username`.
        *   **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`.
    *   `register (username: String, password: String): (error: String)`
        *   **requires**: a User already exists with the given `username`.
        *   **effects**: returns an error message.
    *   `login (username: String, password: String): (user: User)`
        *   **requires**: a User exists with the given `username` and the `password` matches their `passwordHash`.
        *   **effects**: returns the matching User `u` as `user`.
    *   `login (username: String, password: String): (error: String)`
        *   **requires**: no User exists with the given `username` or the `password` does not match.
        *   **effects**: returns an error message.
*   **queries**:
    *   `_getUserByUsername (username: String): (user: User)`
        *   **requires**: a User with the given `username` exists.
        *   **effects**: returns the corresponding User.




# response:

Here is a revised summary of the overall design, updated to reflect the specific details of the provided concepts.

***

### Overall Design and Workflow

This design outlines a socially-aware course planning system that helps students coordinate their academic schedules. It shifts the focus from a solitary registration process to a collaborative planning phase, allowing students to align their choices with peers before finalizing their schedules.

The workflow begins with **[UserAuthentication](design/concepts/UserAuthentication/UserAuthentication.md)** and **[Sessioning](design/concepts/Sessioning/Sessioning.md)**, which establish a secure, persistent identity for each student. Once logged in, students can browse the **[CourseCatalog](design/concepts/CourseCatalog/CourseCatalog.md)**, which serves as a repository of all available courses and their associated meeting times (lectures, labs, etc.).

The core of the student experience revolves around building a personal, tentative schedule. Using the **[Scheduling](design/concepts/Scheduling/Scheduling.md)** concept, each student can add or remove course events to their own plan. This schedule is a personal workspace, similar to a shopping cart; it does not represent official enrollment.

The system's innovation lies in how this planning process is shared and coordinated:

*   **[Friending](design/concepts/Friending/Friending.md)** enables students to build a social network through mutual consent. Once a friendship is established, the application can use the `_getScheduleComparison` query from the **[Scheduling](design/concepts/Scheduling/Scheduling.md)** concept to show friends which planned courses they have in common.
*   **[Grouping](design/concepts/Grouping/Grouping.md)** provides a way for users to join a group such that each person's schedule is viewable by everyone else in the group. A user in a group can use `Blocking`, though, to ensure no one views their schedule.
*   **[Preferencing](design/concepts/Preferencing/Preferencing.md)** offers a simple mechanism for a user to assign a numerical score to a single item. This could be used, for example, to rank a specific course section as their top choice, specifically if they are likely, maybe, or not likely going to take a course.
*   **[Blocking](design/concepts/Blocking/Blocking.md)** acts as a fundamental safety and privacy control, allowing any user to prevent another user from viewing their schedule or information, overriding any friend or group affiliations.

Together, these components create a powerful planning tool. Students can build their desired schedule, see how it aligns with their friends' plans, and coordinate within formal groups, all before the actual registration event takes place.

### Addressing Ethical Concerns

The design directly incorporates features to mitigate key ethical concerns:

1.  **Privacy and Consent:** The system operates on an "opt-in" basis for all social features. Schedule visibility is only possible after a mutual **[Friending](design/concepts/Friending/Friending.md)** acceptance. The **[Blocking](design/concepts/Blocking/Blocking.md)** concept provides a definitive, user-controlled tool to enforce personal boundaries. Its core principle ensures that if User A blocks User B, no feature in the system can show A's information to B, protecting students from unwanted monitoring or social pressure.

2.  **Fairness and Equity:** The provided concepts focus on *planning* rather than *registration*. By separating the collaborative planning phase from the final enrollment, the design avoids giving social groups a direct technical advantage in securing seats. The **[Grouping](design/concepts/Grouping/Grouping.md)** feature facilitates coordination but does not provide a "group registration" action that could lock out individuals. 

3.  **Exclusion and Coercion:** While **[Grouping](design/concepts/Grouping/Grouping.md)** could be used to form cliques, the primary mode of using the system remains individual. No student is required to join a group to plan their schedule. The **[Blocking](design/concepts/Blocking/Blocking.md)** mechanism further empowers students by giving them a tool to unilaterally disengage from any user, including a group administrator, preventing them from being trapped in unwanted social dynamics.
4. **Safety**: As part of the **[UserAuthentication](design/concepts/UserAuthentication/UserAuthentication.md)** concept, there should be support for email verification so that people register in the app using their ".edu" emails, which will offer a layer of protection against bad actors. 

### Unclear Issues and Next Steps

There are some potential issues, however:

1. As of now, we have settled on separating a concept named `CourseScheduling` into `Scheduling` and `CourseCataloging` concepts, but we had trouble initially with the separated concepts because  we thought `CourseCataloging` would simply serve as a querying concept, where all actions are queries. First, concept design requires more "interesting" concepts, not concepts that can be stored as MongoDB collections in another concept. Secondly, if all actions are queries, then what ID or other piece of data would one input into the queries, which wasn't immediately clear to use. However, we recognized that the purposes of `CourseCataloging`, which handles cataloging all MIT courses, and `Scheduling`, which handles creating schedules comprising of events for users, are distinct, justifying their separation into two concepts. We anticipate syncing between `Scheduling` and `CourseCatloging` might be tricky and require revisions to the concepts as they're written now.
2. Furthermore, we might need to modify the `CourseCatloging` to support classes that not only have traditional lectures but have 1 day labs for example. 
3. 