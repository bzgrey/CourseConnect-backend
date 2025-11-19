
### Overall Design and Workflow

This design outlines a socially-aware course planning system that helps students coordinate/align their academic schedules. It shifts the focus from a solitary registration process to a collaborative planning phase, allowing students to align their choices with peers before finalizing their schedules.

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
2. Furthermore, we might need to modify the `CourseCatloging` to be more robust so that it supports classes that not only have traditional lectures but have 1 day labs for example. 
3. In developing the concepts&syncs and UI sketches, we weren't sure if we wanted separate pages/views for a user to view their own schedule, versus a friend's schedule, or a group member's schedule, which the user is a part of. 
