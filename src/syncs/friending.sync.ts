import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication, Friending } from "@concepts";

export const SendFriendRequest: Sync = ({ request, session, targetUsername, requester, requestee }) => ({
  when: actions([
    Requesting.request,
    { path: "/friending/request", session, targetUsername },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: requester });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: targetUsername }, { user: requestee });
    return frames;
  },
  then: actions(
    [Friending.requestFriend, { requester, requestee }],
    [Requesting.respond, { request, status: "sent" }]
  ),
});


export const AcceptFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([
    Requesting.request,
    { path: "/friending/accept", session, requesterUsername },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    return frames;
  },
  then: actions(
    [Friending.acceptFriend, { requester, requestee: currentUser }],
    [Requesting.respond, { request, status: "accepted" }]
  ),
});


export const RejectFriendRequest: Sync = ({ request, session, requesterUsername, currentUser, requester }) => ({
  when: actions([
    Requesting.request,
    { path: "/friending/reject", session, requesterUsername },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: currentUser });
    frames = await frames.query(UserAuthentication._getUserByUsername, { username: requesterUsername }, { user: requester });
    return frames;
  },
  then: actions(
    [Friending.rejectFriend, { requester, requestee: currentUser }],
    [Requesting.respond, { request, status: "rejected" }]
  ),
});
