import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, UserAuthentication, Friending } from "@concepts";

// ============================================================================
// Send Friend Request
// ============================================================================

export const SendFriendRequest: Sync = ({ request, session, targetUsername, requester, requestee }) => ({
  when: actions([Requesting.request, { path: "/friending/request", session, targetUsername }, { request }]),
  where: async (frames: Frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: requester });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: requestee });
    return frames;
  },
  then: actions([Friending.requestFriend, { requester, requestee }]),
});

export const SendFriendResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/friending/request" }, { request }],
    [Friending.requestFriend, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "sent" }]),
});

export const SendFriendErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/friending/request" }, { request }],
    [Friending.requestFriend, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ============================================================================
// Accept Friend Request
// ============================================================================

export const AcceptFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([Requesting.request, { path: "/friending/accept", session, requesterUsername }, { request }]),
  where: async (frames: Frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    return frames;
  },
  then: actions([Friending.acceptFriend, { requester, requestee: currentUser }]),
});

export const AcceptFriendResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/friending/accept" }, { request }],
    [Friending.acceptFriend, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "accepted" }]),
});

export const AcceptFriendErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/friending/accept" }, { request }],
    [Friending.acceptFriend, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ============================================================================
// Reject Friend Request
// ============================================================================

export const RejectFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([Requesting.request, { path: "/friending/reject", session, requesterUsername }, { request }]),
  where: async (frames: Frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    return frames;
  },
  then: actions([Friending.rejectFriend, { requester, requestee: currentUser }]),
});

export const RejectFriendResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/friending/reject" }, { request }],
    [Friending.rejectFriend, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "rejected" }]),
});

export const RejectFriendErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/friending/reject" }, { request }],
    [Friending.rejectFriend, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
