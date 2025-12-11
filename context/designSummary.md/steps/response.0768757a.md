---
timestamp: 'Tue Dec 09 2025 23:25:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251209_232536.a099cabc.md]]'
content_id: 0768757ad9ba4b8f569b38981b1e65cb9becebe45bffd2eeca0197fae7095471
---

# response:

Here is a summary of the design changes made since the original Functional Design proposal:

**Concept Architecture**
We refactored the original `CourseScheduling` concept by splitting it into two distinct concepts: `Scheduling` and `CourseCatalogue`. This separation allows for cleaner handling of static course data versus dynamic user events. Additionally, we explicitly integrated `UserAuthentication` and `Sessioning` concepts to manage secure access and friend-specific visibility.

**User Interface & Visualization Strategy**

* **Comparison Limits:** Addressing our original risk regarding visual complexity, we restricted the schedule comparison feature to display a maximum of three users simultaneously (the user plus two others) to prevent the calendar from becoming unreadable.
* **Visual Affordance:** We pivoted away from simple "schedule diffs" (side-by-side views). Instead, we implemented a unified view where identical course events are combined into single blocks split by color.
* **Preferencing:** We added visual indicators to the UI representing the `Preferencing` concept, allowing users to see not just confirmed classes, but also courses friends are "likely" or "maybe" taking.

**Data Granularity**
We enhanced the backend parsing scripts to support variable event types. The system now distinguishes between Lectures, Recitations, Labs, and Design sessions, allowing for more accurate filtering and display compared to the generic time blocks originally planned.
