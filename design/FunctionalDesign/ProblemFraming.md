# Problem Framing

The problem framing is like the one you did for the personal project, augmented with the ethics analysis, which subsumes the stakeholder analysis.
In your personal project, you listed only 3 features. For your team project, we encourage you to brainstorm a longer list from which you can draw the most promising in your functional design.
Since the ethical analysis is new, a full explanation of the steps involved is provided in a separate document.

---

## Domain

**School / Scheduling** — As students going to the same school, all of us need to optimize and schedule our different activities.

---

## Problem

We are constantly facing challenges of optimizing and coordinating schedules with others. We want to take the same schedules as friends, but asking every single friend and then physically comparing can be hard to coordinate.

---

## Evidence

Evidence that the problem is real and experienced by others. *(individual)*

- [This](https://calendly.com/resources/guides/2024-state-of-meetings-report?utm_source=chatgpt.com) is a study done by **Calendly** that shows people lose a lot of time scheduling meetings. Similarly, time could be lost coordinating with people taking the same classes at the same times.
- In [this](https://arxiv.org/abs/2309.09684?utm_source=chatgpt.com) paper, researchers found that for 177 students, a student may prefer to enroll in a course they like less in order to take it with their friends, rather than being alone in a more preferred class.
- [This](https://www.coursedog.com/whitepaper/aacrao-a-comprehensive-view-of-undergraduate-class-scheduling-practice-policy-data-use-and-technology) report on undergraduate class scheduling revealed that only **27% of institutions** agreed their scheduling process was “student-centred,” indicating many students face schedules designed without their coordination needs in mind, particularly coordinating classes and schedules with one another.
- [This] issue isn’t just due to lack of effort from people — from a theoretical perspective, scheduling even one event in several people’s schedules is statistically improbable. Applying results from a [statistical analysis study](https://link.springer.com/article/10.1140/epjb/s10051-024-00742-z), an arbitrary planning for one single event with ten different options for four busy people is roughly **8%**.
- The impact of a successful peer study group formation is critical not only to academic success, but also to social-emotional well-being. A [meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC3052992/) regarding peer groups and their related support systems finds that being able to schedule time with peers was **significantly correlated with a decrease in depression levels**.
- **Taking classes with friends measurably improves academic performance.**
A 2020 economics paper, [“Social networks and college performance: Evidence from a university with a variety of friendship and major networks”](https://www.sciencedirect.com/science/article/abs/pii/S0272775720305495?utm_source=chatgpt.com), finds that students who take college-level courses with their friends earn significantly higher grades than when they take courses without friends, even after controlling for other factors.
- According to a [study](https://www.sciencedirect.com/science/article/abs/pii/S1096751623000209?utm_source=chatgpt.com) students who engage in peer-study groups not only improve in academic performance but social-emotional well being as they feel more connected to their peers, less isolated, and that they belong at their school. College should be a place where students not only succeed academically but form strong connections with their peers which results in greater career opportunities in the future.

---

## Comparables

Notes about existing solutions to the problem or related problems. *(individual)*

- [Hydrant (MIT)](https://hydrant.mit.edu/) — A website used by MIT students to organize their class schedules. Clearly, students care about their schedules, so something that connects them with friends’ schedules would probably be useful.

- [Saturn](https://www.joinsaturn.com/) — A social calendar app for high school students that lets them view class schedules, see which friends share their classes, and organize school events — showing that students value not just managing their time, but connecting their schedules with friends.
  However, Saturn has faced **privacy challenges**, including weak user verification and exposure of students’ names, class schedules, and social media links. This highlights the need for stronger privacy safeguards such as verified school emails and tighter data controls, which they have implemented in part but not thoroughly.

- [Coursicle](https://www.coursicle.com) — A schedule planning app that supports a wide number of universities, allowing students to plan their schedules and sync them with friends.
  The issue: students have to **manually enter classes** if they aren’t already in the system, and there is **little to no presence of MIT students** using the app. This shows the need for a scheduling application more integrated with MIT’s system to provide easier access to students.
- [GroupCal](https://www.groupcal.app/?utm_source=chatgpt.com) -A shared calendar platform that supports that allows students to create, share, and embed calendars for classes, events, etc.
    - Limitation: While people can create groups to share schedules, it lacks the "friends" component we are trying to address such that users can see schedules of their friends even if they are not in a group together. Also, lacks likelihood tag for scheduled events which is important during pre registration phase when students aren't certain of their schedules but would still like to plan with their peers.

---

## Features

Possible features to address the problem:

- **Group Scheduling** (group ≥ 2, course groups, extracurriculars, living group): allows students to view schedules for everyone within a group that they can join.
- **Friends**: A user can become friends with someone else and then view their schedule or the similarity between their schedule and all their other friends.
- **Schedule Similarities** (between courses, not times): View the similarity between your schedule and others’ schedules, whether friends or group members.
- **Ranking Scheduled Items** (“likely to take”, “definitely taking”): Add tags to selected courses reflecting likelihood of actually taking them. Flags include (“not likely”, “likely”, “definitely”).
- **Search by Filter**: e.g., show only “definitely” taking courses or show “definitely” + “likely” taking courses.
- **MIT Schedule Syncing**: To reduce friction from manual input, integrate syncing with **Hydrant/CourseRoad** so users can directly export their classes to the app.

---

## Ethical Analysis

Identification of stakeholders and the impacts they might experience. *(individual)*


### Stakeholders - Prompt: Non-targeted use

One non-targeted use of the app that could adversely affect stakeholders is that stalkers or other bad actors could use it to know where users are at certain times.
**Mitigation:** Require university email authentication and restrict schedule visibility to confirmed friends only.

---

### Stakeholders — Prompt: Indirect Impacts / Feature: Schedule Visibility + Friends

**Observation:**
Instructors and advisors could use visibility data to identify collaboration opportunities, but could also misinterpret social clustering as performance predictors, affecting advising and grading biases.

**Design Response:**
Limit administrative access by requiring explicit consent for instructors/advisors to view aggregate student networks. Provide only **de-identified, aggregated analytics** for course planning. **However, we will probably not implement this feature.**

---

### Time — Prompt: Short/Medium/Long Effects / Feature: Friends & Group Scheduling

**Observation:**
Short-term convenience (coordinating study groups) can lead to long-term **social sorting**: students may cluster classes with friends, narrowing exposure to diverse peers and reducing serendipitous academic exploration — both valuable for employers and society as diversity fosters innovation.

**Design Response:**
Add **“diversity nudges”** highlighting courses outside a user’s friend cluster and offer **anonymized friend-overlap statistics** to encourage broader enrollment choices. **However, we will probably not implement this feature.**

---

### Values — Prompt: Choose Desired Values / Feature: Schedule Visibility

**Observation:**
A key value for the app must be **privacy**, ensuring schedules are visible only to intended audiences. Conflicts may arise if a user must share visibility with a group that includes someone they don’t get along with.

**Design Response:**
Add **blacklisting capability** within schedule visibility settings — allowing users to whitelist entire groups while blacklisting specific individuals.

---

### Pervasiveness — prompt: Broad Adoption

**Observation:**
As adoption expands, students would benefit from easier coordination, increased belonging, and more efficient course discovery. However, widespread use may also create social pressure to align schedules with friends, exclude non-users, and risk institutional misuse of schedule data.

**Design Response:**
Implement “open-to-collaborate” tags for courses to balance broad inclusivity while being able to hide other parts of a schedule. **We will probably not implement this feature for this project.**

---
