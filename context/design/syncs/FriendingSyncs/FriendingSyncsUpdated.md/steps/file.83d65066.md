---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 83d6506685adf55e7274df4f24729b54b603f325c01ac906cb5c935580a75175
---

# file: src/syncs/grouping.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, Grouping } from "@concepts";

export const CreateGroupSync: Sync = ({ request, session, name, user, group }) => ({
  when: actions([
    Requesting.request, { path: "/groups/create", session, name }, { request }
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions(
    [Grouping.createGroup, { name, admin: user }, { group }],
    [Requesting.respond, { request, group }]
  )
});

export const JoinGroupRequestSync: Sync = ({ request, session, groupName, user, group }) => ({
  when: actions([
    Requesting.request, { path: "/groups/join", session, groupName }, { request }
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._getGroupByName, { name: groupName }, { group });
    return frames;
  },
  then: actions(
    [Grouping.requestToJoin, { group, requester: user }],
    [Requesting.respond, { request, status: "Requested" }]
  )
});
```
