import { actions, Frames, Sync } from "@engine";
import {
  Blocking,
  Grouping,
  Requesting,
  Scheduling,
  Sessioning,
} from "@concepts";

// =============================================================================
//  Group Creation
// =============================================================================

export const CreateGroupRequest: Sync = ({ session, name, user, request }) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/createGroup", session, name },
    { request },
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Grouping.createGroup, { name, admin: user }]),
});

export const CreateGroupResponse: Sync = ({ request, group }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/createGroup" }, { request }],
    [Grouping.createGroup, {}, { group }],
  ),
  then: actions([Requesting.respond, { request, group }]),
});

export const CreateGroupResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/createGroup" }, { request }],
    [Grouping.createGroup, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// =============================================================================
//  Group Management (Admin Actions)
// =============================================================================

export const DeleteGroupRequest: Sync = (
  { session, group, user, request, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/deleteGroup", session, group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    return frames.filter(($) => $[isAdmin]);
  },
  then: actions([Grouping.deleteGroup, { group }]),
});

export const DeleteGroupResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/deleteGroup" }, { request }],
    [Grouping.deleteGroup, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteGroupResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/deleteGroup" }, { request }],
    [Grouping.deleteGroup, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const RenameGroupRequest: Sync = (
  { session, group, newName, user, request, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/renameGroup", session, group, newName },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    return frames.filter(($) => $[isAdmin]);
  },
  then: actions([Grouping.renameGroup, { group, newName }]),
});

export const RenameGroupResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/renameGroup" }, { request }],
    [Grouping.renameGroup, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RenameGroupResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/renameGroup" }, { request }],
    [Grouping.renameGroup, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// =============================================================================
//  Join Requests
// =============================================================================

export const RequestToJoinGroupRequest: Sync = (
  { session, group, user, request },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/requestToJoin", session, group },
    { request },
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Grouping.requestToJoin, { group, requester: user }]),
});

export const RequestToJoinGroupResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/requestToJoin" }, { request }],
    [Grouping.requestToJoin, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RequestToJoinGroupResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/requestToJoin" }, { request }],
    [Grouping.requestToJoin, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const ConfirmRequestRequest: Sync = (
  { session, group, requester, user, request, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/confirmRequest", session, group, requester },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    return frames.filter(($) => $[isAdmin]);
  },
  then: actions([Grouping.confirmRequest, { group, requester }]),
});

export const ConfirmRequestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/confirmRequest" }, { request }],
    [Grouping.confirmRequest, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ConfirmRequestResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/confirmRequest" }, { request }],
    [Grouping.confirmRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeclineRequestRequest: Sync = (
  { session, group, requester, user, request, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/declineRequest", session, group, requester },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    return frames.filter(($) => $[isAdmin]);
  },
  then: actions([Grouping.declineRequest, { group, requester }]),
});

export const DeclineRequestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/declineRequest" }, { request }],
    [Grouping.declineRequest, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeclineRequestResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/declineRequest" }, { request }],
    [Grouping.declineRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// =============================================================================
//  Member Management (Admin Actions)
// =============================================================================

export const RemoveMemberRequest: Sync = (
  { session, group, member, user, request, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/removeMember", session, group, member },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    return frames.filter(($) => $[isAdmin]);
  },
  then: actions([Grouping.removeMember, { group, member }]),
});

export const RemoveMemberResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/removeMember" }, { request }],
    [Grouping.removeMember, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveMemberResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/removeMember" }, { request }],
    [Grouping.removeMember, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const AdjustRoleRequest: Sync = (
  { session, group, member, newRole, user, request, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/adjustRole", session, group, member, newRole },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    return frames.filter(($) => $[isAdmin]);
  },
  then: actions([Grouping.adjustRole, { group, member, newRole }]),
});

export const AdjustRoleResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/adjustRole" }, { request }],
    [Grouping.adjustRole, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AdjustRoleResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Grouping/adjustRole" }, { request }],
    [Grouping.adjustRole, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// =============================================================================
//  Data Queries
// =============================================================================

export const ListMyGroups: Sync = ({ request, session, user, groups }) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getUserGroups", session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // Invalid session

    // Query for groups. The output parameter is `group`, which contains an array `Group[]`.
    frames = await frames.query(Grouping._getUserGroups, { user }, {
      group: groups,
    });

    if (frames.length === 0) {
      // User is in no groups. Reconstruct the frame with an empty array for the result.
      return new Frames({
        ...originalFrame,
        [groups]: [],
      });
    }

    return frames;
  },
  then: actions([Requesting.respond, { request, groups }]),
});

export const ListGroupMembers: Sync = (
  {
    request,
    session,
    group,
    requestingUser,
    member,
    inGroup,
    result,
    members,
  },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getMembers", session, group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, {
      user: requestingUser,
    });
    if (frames.length === 0) return new Frames();

    frames = await frames.query(Grouping._isGroupMember, {
      group,
      user: requestingUser,
    }, { inGroup });
    frames = frames.filter(($) => $[inGroup]);
    if (frames.length === 0) return new Frames(); // Not a member, fail silently.

    const authorizedFrame = frames[0];

    frames = await frames.query(Grouping._getMembers, { group }, { member });
    if (frames.length === 0) {
      return new Frames({ ...authorizedFrame, [members]: [] });
    }

    frames = await frames.query(Blocking._isUserBlocked, {
      primaryUser: member,
      secondaryUser: requestingUser,
    }, { result });
    frames = frames.filter(($) => {
      const isBlocked = (($ as Record<symbol, unknown>)[result] as boolean) ??
        false;
      return !isBlocked;
    });

    return frames.collectAs([member], members);
  },
  then: actions([Requesting.respond, { request, members }]),
});

export const ListGroupJoinRequests: Sync = (
  {
    request,
    session,
    group,
    user,
    joinRequester,
    isAdmin,
    result,
    requests,
  },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getGroupRequests", session, group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames();

    frames = await frames.query(Grouping._isGroupAdmin, { group, user }, {
      isAdmin,
    });
    frames = frames.filter(($) => $[isAdmin]);
    if (frames.length === 0) return new Frames();

    const authorizedFrame = frames[0];

    frames = await frames.query(Grouping._getGroupRequests, { group }, {
      requestingUser: joinRequester,
    });
    if (frames.length === 0) {
      return new Frames({ ...authorizedFrame, [requests]: [] });
    }

    frames = await frames.query(Blocking._isUserBlocked, {
      primaryUser: joinRequester,
      secondaryUser: user,
    }, { result });
    frames = frames.filter(($) => {
      const isBlocked = (($ as Record<symbol, unknown>)[result] as boolean) ??
        false;
      return !isBlocked;
    });

    return frames.collectAs([joinRequester], requests);
  },
  then: actions([Requesting.respond, { request, requests }]),
});

export const ListUserJoinRequests: Sync = (
  { request, session, user, group, groups },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getUserRequests", session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // Invalid session

    // Query for groups the user has requested to join
    frames = await frames.query(Grouping._getUserRequests, { user }, {
      group,
    });

    if (frames.length === 0) {
      // User has no pending requests. Return empty array.
      return new Frames({
        ...originalFrame,
        [groups]: [],
      });
    }

    return frames.collectAs([group], groups);
  },
  then: actions([Requesting.respond, { request, groups }]),
});

export const GetGroupName: Sync = ({ request, group, name }) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getGroupName", group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Grouping._getGroupName, { group }, { name });
    return frames;
  },
  then: actions([Requesting.respond, { request, name }]),
});

export const IsGroupMember: Sync = (
  { request, session, group, user, inGroup },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_isGroupMember", session, group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // Invalid session

    const userBoundFrame = frames[0];

    frames = await frames.query(
      Grouping._isGroupMember,
      { group, user },
      { inGroup },
    );
    if (frames.length === 0) {
      // Group doesn't exist, so user is not a member.
      return new Frames({ ...userBoundFrame, [inGroup]: false });
    }
    return frames;
  },
  then: actions([Requesting.respond, { request, inGroup }]),
});

export const IsGroupAdmin: Sync = (
  { request, session, group, user, isAdmin },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_isGroupAdmin", session, group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // Invalid session

    const userBoundFrame = frames[0];

    frames = await frames.query(
      Grouping._isGroupAdmin,
      { group, user },
      { isAdmin },
    );
    if (frames.length === 0) {
      // Group doesn't exist, so user is not an admin.
      return new Frames({ ...userBoundFrame, [isAdmin]: false });
    }
    return frames;
  },
  then: actions([Requesting.respond, { request, isAdmin }]),
});

export const GetGroupAdmins: Sync = (
  { request, session, group, user, inGroup, admins },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getAdmins", session, group },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // Invalid session

    // Security check: only members can see the admin list
    frames = await frames.query(
      Grouping._isGroupMember,
      { group, user },
      { inGroup },
    );
    frames = frames.filter(($) => $[inGroup]);
    if (frames.length === 0) return new Frames(); // Not a member or group doesn't exist

    const authorizedFrame = frames[0];

    frames = await frames.query(Grouping._getAdmins, { group }, { admins });
    if (frames.length === 0) {
      // This case should be rare if group exists, but we handle it by returning an empty list.
      return new Frames({ ...authorizedFrame, [admins]: [] });
    }
    return frames;
  },
  then: actions([Requesting.respond, { request, admins }]),
});

/**
 * Sync: GetMembersInEvents
 *
 * Purpose: Allows a user to retrieve a nested mapping from events to groups to users attending those events.
 * Flow:
 * 1. Request comes in with a session, groups array, and events array.
 * 2. Resolve session to user.
 * 3. For each group, get members.
 * 4. Filter out members who are blocking the requesting user.
 * 5. For each remaining member, get their schedule.
 * 6. Filter to only events in the requested events array.
 * 7. Build a nested mapping from event -> group -> users that are attending that event in that group.
 * 8. Respond with the nested mapping.
 */
export const GetMembersInEvents: Sync = (
  {
    request,
    session,
    groups,
    events,
    user,
    group,
    member,
    event,
    result,
    results,
  },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Grouping/_getMembersInEvents", session, groups, events },
    { request },
  ]),
  where: async (frames) => {
    // Preserve the request ID for the response if queries return empty
    const originalFrame = frames[0];
    const requestedGroups = (originalFrame[groups] as unknown[]) || [];
    const requestedEvents = (originalFrame[events] as unknown[]) || [];

    // Early return if no groups or events provided
    if (requestedGroups.length === 0 || requestedEvents.length === 0) {
      const emptyMapping: Record<string, Record<string, unknown[]>> = {};
      for (const e of requestedEvents) {
        emptyMapping[String(e)] = {};
      }
      return new Frames({ ...originalFrame, [results]: emptyMapping });
    }

    // 1. Authenticate: Get user from session
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) {
      return new Frames();
    }
    const requestingUser = frames[0][user];

    // 2. Expand groups: Create a frame for each group
    // Only include necessary fields to avoid issues with arrays in frames
    const groupFrames = new Frames();
    for (const g of requestedGroups) {
      groupFrames.push({
        [request]: originalFrame[request],
        [session]: originalFrame[session],
        [group]: g,
        [user]: requestingUser,
      });
    }
    frames = groupFrames;

    // 3. Get members for each group
    frames = await frames.query(Grouping._getMembers, { group }, { member });

    if (frames.length === 0) {
      // No members in any group, return empty mapping
      const emptyMapping: Record<string, Record<string, unknown[]>> = {};
      for (const e of requestedEvents) {
        emptyMapping[String(e)] = {};
      }
      return new Frames({ ...originalFrame, [results]: emptyMapping });
    }

    // 4. Filter out members who are blocking the requesting user
    frames = await frames.query(Blocking._isUserBlocked, {
      primaryUser: member,
      secondaryUser: requestingUser,
    }, { result });
    frames = frames.filter((frame) => {
      const isBlocked = (frame[result] as boolean) ?? false;
      return !isBlocked;
    });

    if (frames.length === 0) {
      // All members are blocking, return empty mapping
      const emptyMapping: Record<string, Record<string, unknown[]>> = {};
      for (const e of requestedEvents) {
        emptyMapping[String(e)] = {};
      }
      return new Frames({ ...originalFrame, [results]: emptyMapping });
    }

    // 5. Get each member's schedule
    frames = await frames.query(Scheduling._getUserSchedule, { user: member }, {
      event,
    });

    // 6. Filter to only events that match the requested events
    // Convert both sides to strings for reliable comparison
    const requestedEventStrings = new Set(
      requestedEvents.map((e) => String(e)),
    );
    frames = frames.filter((frame) =>
      requestedEventStrings.has(String(frame[event]))
    );

    if (frames.length === 0) {
      // No members attending requested events, return empty mapping
      const emptyMapping: Record<string, Record<string, unknown[]>> = {};
      for (const e of requestedEvents) {
        emptyMapping[String(e)] = {};
      }
      return new Frames({ ...originalFrame, [results]: emptyMapping });
    }

    // 7. Build nested mapping: event -> group -> users attending that event
    const eventToGroupToUsers: Record<string, Record<string, Set<unknown>>> =
      {};
    for (const frame of frames) {
      const eventId = String(frame[event]);
      const groupId = String(frame[group]);
      const memberId = frame[member];

      if (!eventToGroupToUsers[eventId]) {
        eventToGroupToUsers[eventId] = {};
      }
      if (!eventToGroupToUsers[eventId][groupId]) {
        eventToGroupToUsers[eventId][groupId] = new Set();
      }
      eventToGroupToUsers[eventId][groupId].add(memberId);
    }

    // Convert Sets to arrays and ensure all requested events are in the mapping
    const finalMapping: Record<string, Record<string, unknown[]>> = {};
    for (const e of requestedEvents) {
      const eventId = String(e);
      finalMapping[eventId] = {};

      // For each group that has members in this event
      if (eventToGroupToUsers[eventId]) {
        for (
          const [groupId, userIds] of Object.entries(
            eventToGroupToUsers[eventId],
          )
        ) {
          finalMapping[eventId][groupId] = Array.from(userIds);
        }
      }
    }

    return new Frames({ ...originalFrame, [results]: finalMapping });
  },
  then: actions(
    [Requesting.respond, { request, results }],
  ),
});
