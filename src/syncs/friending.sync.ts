import { actions, Sync, Frames } from "@engine";
import { Requesting, Sessioning, UserAuthentication, Friending } from "@concepts";

// ============================================================================
// Send Friend Request
// ============================================================================

export const SendFriendRequest: Sync = ({ request, session, targetUsername, requester, requestee }) => ({
  when: actions([Requesting.request, { path: "/friending/request", session, targetUsername }, { request }]),
  where: async (frames: Frames) => {
    // Check if session is valid (get requester)
    frames = await frames.query(Sessioning._getUser, { session }, { user: requester });
    if (frames.length === 0) {
      // Return empty frames so this sync doesn't proceed - QueryErrorResponse will handle it
      return new Frames();
    }

    // Check if target username exists (get requestee)
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: requestee });
    if (frames.length === 0) {
      // Return empty frames so this sync doesn't proceed - QueryErrorResponse will handle it
      return new Frames();
    }

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

// Handle query errors from where clause (user not found, invalid session, etc.)
export const SendFriendQueryErrorResponse: Sync = ({ request, session, targetUsername, requester, requestee, queryError }) => ({
  when: actions([Requesting.request, { path: "/friending/request", session, targetUsername }, { request }]),
  where: async (frames: Frames) => {
    const originalFrame = frames[0];

    // Check if session is valid
    frames = await frames.query(Sessioning._getUser, { session }, { user: requester });
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request], [queryError]: "Invalid session" });
    }

    // Check if target username exists
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: requestee });
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request], [queryError]: "User not found" });
    }

    // If we get here, the user exists, so this sync shouldn't fire
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: queryError }]),
});

// ============================================================================
// Accept Friend Request
// ============================================================================

export const AcceptFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([Requesting.request, { path: "/friending/accept", session, requesterUsername }, { request }]),
  where: async (frames: Frames) => {
    // Check if session is valid (get current user)
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    if (frames.length === 0) {
      // Return empty frames so this sync doesn't proceed - QueryErrorResponse will handle it
      return new Frames();
    }

    // Check if requester username exists
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    if (frames.length === 0) {
      // Return empty frames so this sync doesn't proceed - QueryErrorResponse will handle it
      return new Frames();
    }

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

// Handle query errors from where clause (user not found, invalid session, etc.)
export const AcceptFriendQueryErrorResponse: Sync = ({ request, session, requesterUsername, currentUser, requester, queryError }) => ({
  when: actions([Requesting.request, { path: "/friending/accept", session, requesterUsername }, { request }]),
  where: async (frames: Frames) => {
    const originalFrame = frames[0];

    // Check if session is valid
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request], [queryError]: "Invalid session" });
    }

    // Check if requester username exists
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request], [queryError]: "User not found" });
    }

    // If we get here, the user exists, so this sync shouldn't fire
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: queryError }]),
});

// ============================================================================
// Reject Friend Request
// ============================================================================

export const RejectFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([Requesting.request, { path: "/friending/reject", session, requesterUsername }, { request }]),
  where: async (frames: Frames) => {
    // Check if session is valid (get current user)
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    if (frames.length === 0) {
      // Return empty frames so this sync doesn't proceed - QueryErrorResponse will handle it
      return new Frames();
    }

    // Check if requester username exists
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    if (frames.length === 0) {
      // Return empty frames so this sync doesn't proceed - QueryErrorResponse will handle it
      return new Frames();
    }

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

// Handle query errors from where clause (user not found, invalid session, etc.)
export const RejectFriendQueryErrorResponse: Sync = ({ request, session, requesterUsername, currentUser, requester, queryError }) => ({
  when: actions([Requesting.request, { path: "/friending/reject", session, requesterUsername }, { request }]),
  where: async (frames: Frames) => {
    const originalFrame = frames[0];

    // Check if session is valid
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request], [queryError]: "Invalid session" });
    }

    // Check if requester username exists
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request], [queryError]: "User not found" });
    }

    // If we get here, the user exists, so this sync shouldn't fire
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: queryError }]),
});
