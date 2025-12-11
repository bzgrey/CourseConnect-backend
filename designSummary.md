## Design Summary

**Concept Architecture**
We refactored the original `CourseScheduling` concept by splitting it into two distinct concepts: `Scheduling` and `CourseCatalogue`, and added course information and tags to the latter. This separation allows for cleaner handling of static course data versus dynamic user events. Additionally, we explicitly integrated `UserAuthentication` and `Sessioning` concepts to manage secure access and friend-specific visibility.
Additionally, we removed "removeAdmin" from the UI so that admins can't remove themselves and make the group they're in static, meaning pending joins are always pending as the group is adminless.

**User Interface & Visualization Strategy**
*   **Comparison Limits:** Addressing our original risk regarding visual complexity, we restricted the schedule comparison feature to display a maximum of three users simultaneously (the user plus two others) to prevent the calendar from becoming unreadable.
*   **Visual Affordance:** We pivoted away from simple "schedule diffs" (side-by-side views). Instead, we implemented a unified view where identical course events are combined into single blocks split by color. Furthermore, for the home page, we simplified the grid of blocks to just two blocks containing group-related items and friending buttons next to the username using a common symbol associated with the concept of friending. Additionally, we changed the color indicating the likelihood to take a course from green, which is the same as some course blocks displayed on the calendar view, to blue so that there's no confusion. Lastly, after user testing, we added a hover option over courses added to the calendar view that shows what friends, group members also have that event in their schedules such that users don't have to scroll down to the course info component to look at that crucial information. 
*   **Preferencing:** We added visual indicators to the UI representing the `Preferencing` concept, allowing users to see not just confirmed classes, but also courses friends are "likely" or "maybe" taking.

**Data Granularity**
We enhanced the backend parsing scripts to support variable event types. The system now distinguishes between Lectures, Recitations, Labs,  allowing for more accurate filtering and display compared to the generic time blocks originally planned.



