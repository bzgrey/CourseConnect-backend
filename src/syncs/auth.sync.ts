import { actions, Sync, Frames } from "@engine";
import {
  Requesting,
  Scheduling,
  Sessioning,
  UserAuthentication,
} from "@concepts";

//-- User Registration --//
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([Requesting.request, {
    path: "/UserAuthentication/register",
    username,
    password,
  }, { request }]),
  then: actions([UserAuthentication.register, { username, password }]),
});

export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }], [
    Scheduling.createSchedule,
    { user },
  ]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- User Login & Session Creation --//
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([Requesting.request, { path: "/login", username, password }, {
    request,
  }]),
  then: actions([UserAuthentication.login, { username, password }]),
});

export const LoginSuccessCreatesSession: Sync = ({ user }) => ({
  when: actions([UserAuthentication.login, {}, { user }]),
  then: actions([Sessioning.create, { user }]),
});

export const LoginResponseSuccess: Sync = ({ request, user, session }) => ({
  when: actions(
    [Requesting.request, { path: "/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
    [Sessioning.create, { user }, { session }],
  ),
  then: actions([Requesting.respond, { request, session, user }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- User Logout --//
export const LogoutRequest: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/logout", session }, {
    request,
  }]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Sessioning.delete, { session }]),
});

export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});

//-- Get User from Session (Query) --//
export const GetUserFromSessionResponseSuccess: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/Sessioning/_getUser", session }, { request }]),
  where: async (frames: Frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    // Only proceed if query returned results (user found)
    if (frames.length === 0) {
      return new Frames(); // Return empty so this sync doesn't fire
    }
    return frames;
  },
  then: actions([Requesting.respond, { request, user }]),
});

export const GetUserFromSessionResponseError: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/Sessioning/_getUser", session }, { request }]),
  where: async (frames: Frames) => {
    const originalFrame = frames[0];
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    // If query returns empty, session is invalid
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request] });
    }
    // If user exists, this sync shouldn't fire
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: "Invalid session" }]),
});

//-- Get Username (Query) --//
export const GetUsernameResponseSuccess: Sync = ({ request, user, username }) => ({
  when: actions([Requesting.request, { path: "/UserAuthentication/_getUsername", user }, { request }]),
  where: async (frames: Frames) => {
    frames = await frames.query(UserAuthentication._getUsername, { user }, { username });
    // Only proceed if query returned results (user found)
    if (frames.length === 0) {
      return new Frames(); // Return empty so this sync doesn't fire
    }
    return frames;
  },
  then: actions([Requesting.respond, { request, username }]),
});

export const GetUsernameResponseError: Sync = ({ request, user, username }) => ({
  when: actions([Requesting.request, { path: "/UserAuthentication/_getUsername", user }, { request }]),
  where: async (frames: Frames) => {
    const originalFrame = frames[0];
    frames = await frames.query(UserAuthentication._getUsername, { user }, { username });
    // If query returns empty, user not found
    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [request]: originalFrame[request] });
    }
    // If username exists, this sync shouldn't fire
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: "User not found" }]),
});
