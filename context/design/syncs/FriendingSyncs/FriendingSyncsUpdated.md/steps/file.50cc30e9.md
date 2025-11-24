---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 50cc30e98763788e7300fa76d85aff46d33db519642b8c4211a790f8f89a51dc
---

# file: src/syncs/social.sync.ts

```typescript
import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, Friending, Blocking, UserAuthentication } from "@concepts";

/**
 * FRIENDING SYNCS
 */

// Request Friend
export const SendFriendRequestSync: Sync = ({ request, session, targetUsername, requester, requestee }) => ({
  when: actions([
    Requesting.request, 
    { path: "/friends/request", session, targetUsername }, 
    { request }
  ]),
  where: async (frames) => {
    // 1. Get Requester from Session
    frames = await frames.query(Sessioning._getUser, { session }, { requester });
    // 2. Get Requestee ID from Username
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: requestee });
    // 3. Ensure Requestee hasn't blocked Requester
    frames = await frames.query(Blocking._isUserBlocked, { primaryUser: requestee, secondaryUser: requester }, { result: "isBlocked" });
    return frames.filter($ => !$.isBlocked);
  },
  then: actions(
    [Friending.requestFriend, { requester, requestee }],
    [Requesting.respond, { request, status: "Request sent" }]
  )
});

// Accept Friend
export const AcceptFriendSync: Sync = ({ request, session, requesterUsername, user, requester }) => ({
  when: actions([
    Requesting.request, 
    { path: "/friends/accept", session, requesterUsername }, 
    { request }
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    return frames;
  },
  then: actions(
    [Friending.acceptFriend, { requester, requestee: user }],
    [Requesting.respond, { request, status: "Friend accepted" }]
  )
});

/**
 * BLOCKING SYNCS
 */

// Block User
export const BlockUserSync: Sync = ({ request, session, targetUsername, blocker, userToBlock }) => ({
  when: actions([
    Requesting.request, 
    { path: "/blocking/block", session, targetUsername }, 
    { request }
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: blocker });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: userToBlock });
    return frames;
  },
  then: actions(
    [Blocking.blockUser, { blocker, userToBlock }],
    // Note: If they were friends, we might want to remove friend status, 
    // but the concepts are independent. If desired, we could add [Friending.removeFriend] here too.
    [Requesting.respond, { request, status: "User blocked" }]
  )
});
```
