import { actions, Frames, Sync } from "@engine";
import {
  Friending,
  Requesting,
  Scheduling,
  Sessioning,
  UserAuthentication,
} from "@concepts";

/**
 * Sync: GetEventFriends
 *
 * Purpose: Allows a user to retrieve a list of their friends who are attending specific events.
 * Flow:
 * 1. Request comes in with a session and event ID.
 * 2. Resolve session to user.
 * 3. Get friends of the authenticated user.
 * 4. For each friend, check if they are attending the specified event.
 * 5. Respond with the list of friends attending the event.
 */
export const GetEventFriends: Sync = (
  {
    request,
    session,
    event,
    events,
    user,
    friend,
    friends,
    username,
    results,
  },
) => ({
  when: actions([
    // Assumes events is an array of event IDs the user is interested in
    Requesting.request,
    { path: "/getEventFriends", session, events },
    { request },
  ]),
  where: async (frames) => {
    // Preserve the request ID for the response if queries return empty
    const originalFrame = frames[0];
    // Extract events from original frame to ensure it's available even if lost through queries
    const requestedEvents = (originalFrame[events] as unknown[]) || [];

    // 1. Authenticate: Get user from session
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // 2. Get friends of the authenticated user
    frames = await frames.query(Friending._getAllFriends, { user }, { friend });

    // 3. Get each friend's username
    frames = await frames.query(UserAuthentication._getUsername, {
      user: friend,
    }, { username });

    // 4. Get each friends schedule to see if they have the event
    frames = await frames.query(Scheduling._getUserSchedule, { user: friend }, {
      event,
    });
    // 5. Filter to only those friends events that match the requested events
    // Use the extracted requestedEvents instead of frame[events] to avoid undefined errors
    frames = frames.filter((frame) => {
      const friendEvent = frame[event];

      // Defensive check: ensure friendEvent exists and requestedEvents is an array
      if (!Array.isArray(requestedEvents) || friendEvent === undefined) {
        return false;
      }

      return requestedEvents.includes(friendEvent);
    });

    // Handle empty results (user has no schedule or events not found)
    if (frames.length === 0) {
      const emptyResults = requestedEvents.map((eventId) => ({
        event: eventId,
        friends: [],
      }));
      return new Frames({ ...originalFrame, [results]: emptyResults });
    }

    frames = frames.collectAs([friend, username], friends);
    return frames.collectAs([friends, event], results);
  },
  then: actions(
    [Requesting.respond, { request, results }],
  ),
});

/**
 * Sync: GetFriendsEvents
 *
 * Purpose: Allows a user to retrieve a list of events that their friends are attending and which friends are attending which events.
 * Flow:
 * 1. Request comes in with a session.
 * 2. Resolve session to user.
 * 3. Get friends of the authenticated user.
 * 4. For each friend, get their scheduled events.
 * 5. Respond with the list of friends and their events.
 */
export const GetFriendsEvents: Sync = (
  {
    request,
    session,
    user,
    event,
    friends,
    friend,
    username,
    results,
  },
) => ({
  when: actions([
    Requesting.request,
    { path: "/getFriendsEvents", session },
    { request },
  ]),
  where: async (frames) => {
    // Preserve the request ID for the response if queries return empty
    const originalFrame = frames[0];

    // 1. Authenticate: Get user from session
    frames = await frames.query(Sessioning._getUser, { session }, { user });

    // 2. Get friends of the authenticated user
    frames = await frames.query(Friending._getAllFriends, { user }, { friend });

    // 3. Get each friend's username
    frames = await frames.query(UserAuthentication._getUsername, {
      user: friend,
    }, { username });

    // 4. Get each friends schedule to see if they have the event
    frames = await frames.query(Scheduling._getUserSchedule, { user: friend }, {
      event,
    });
    // Handle empty results
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [results]: [] });
    }
    frames = frames.collectAs([friend, username], friends);

    return frames.collectAs([friends, event], results);
  },
  then: actions(
    [Requesting.respond, { request, results }],
  ),
});
