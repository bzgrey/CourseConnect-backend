# Development Plan

## Feature Delivery Table

| Feature / Task             | Checkpoint | Owner                                    |
| -------------------------- | ---------- | ---------------------------------------- |
| Course Scheduling Concept  | Alpha      | Benny                                    |
| Catalog Creation / Hydrant | Alpha      | Betsegaw                                 |
| Friending Concept          | Alpha      | Yabetse (also initializes frontend repo) |
| Schedule Component         | Alpha      | Betsegaw (w/ dummy data), Benny          |
| Course Info Component      | Alpha      | Giani                                    |
| User Profile Page          | Alpha      | Yabetse                                  |
| Course Search Component    | Alpha      | Giani                                    |
| Grouping Concept           | Beta       | Giani                                    |
| Preferences Concept        | Beta       | Betsegaw                                 |
| Blocking Concept           | Beta       | Yabetse                                  |
| User Schedule Diffs        | Beta       | Benny                                    |
| Preferencing Frontend      | Beta       | Giani                                    |

---

# Key Risks, Mitigations, and Fallbacks

## 1. Hydrant Scripts Not Working on Our End

**Risk:**  
Translating Hydrant’s Python scripts for scraping the MIT course catalog may not translate cleanly into TypeScript for backend use.

**Mitigation:**  
- Validate output against Hydrant’s reference JSON.  
- Translate Python scraper modularly (fetch → parse → clean → structure).  
- Cache scraped data to reduce repeated scraping and performance issues.

**Fallback:**  
- **Option A:** Keep Hydrant’s Python scraper and run it as a separate service or cron job that outputs JSON.  
- **Option B:** Switch to direct HTML scraping using TypeScript-native libraries.  
- **Option C:** Worst case — users upload CourseRoad JSON exports; parse and cache these (users may need to manually enter class times).

---

## 2. FERPA-Adjacent Privacy & Safety Risks

**Risk:**  
An adversary could guess or access a student's class schedule, creating safety risks.

**Mitigation:**  
- Require MIT email OAuth verification (Touchstone/Duo).  
- Schedules visible **only** to accepted friends.  
- Include blacklist / visibility controls.

**Fallback:**  
- Restrict sharing to similarity summaries (e.g., “You share 2 classes”).  
- Remove all shared schedule visibility except for private self-view.

---

## 3. Users Don’t Adopt the App (Network Effect Problem)

**Risk:**  
A scheduling-with-friends app only becomes useful when many friends join.

**Mitigation:**  
- App should be fully useful even with 0 friends (schedule planner + course catalog).  
- Pre-create targeted MIT public groups (class years, dorms, majors, etc.).

**Fallback:**  
- Pivot to a personal smart-scheduler with optional friend features.  
- Add generalized public group features (clubs, dorms, majors) to reduce reliance on friend adoption.

---

## 4. Visualizing Overlapping Schedules May Be Too Complex

**Risk:**  
Overlapping multi-student schedule visualization may be too difficult or too cluttered.

**Mitigation:**  
- Start with simple static weekly grid; add interactivity gradually.  
- Use calendar rendering libraries rather than building from scratch.  
- Build small modular UI components and test early.  
- Conduct quick user testing for layout validation.

**Fallback:**  
If overlapping visualization is too difficult:  
- Users only see *their* schedule visually.  
- Clicking a course shows friends/group members taking the same class rather than overlaying schedules.

