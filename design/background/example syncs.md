``` typescript
import { actions, Sync } from "@engine";

import { PasswordAuthentication, Requesting, Sessioning } from "@concepts";

  

//-- User Registration --//

export const RegisterRequest: Sync = ({ request, username, password }) => ({

  when: actions([Requesting.request, {

    path: "/PasswordAuthentication/register",

    username,

    password,

  }, { request }]),

  then: actions([PasswordAuthentication.register, { username, password }]),

});

  

export const RegisterResponseSuccess: Sync = ({ request, user }) => ({

  when: actions(

    [Requesting.request, { path: "/PasswordAuthentication/register" }, {

      request,

    }],

    [PasswordAuthentication.register, {}, { user }],

  ),

  then: actions([Requesting.respond, { request, user }]),

});

  

export const RegisterResponseError: Sync = ({ request, error }) => ({

  when: actions(

    [Requesting.request, { path: "/PasswordAuthentication/register" }, {

      request,

    }],

    [PasswordAuthentication.register, {}, { error }],

  ),

  then: actions([Requesting.respond, { request, error }]),

});

  

//-- User Login & Session Creation --//

export const LoginRequest: Sync = ({ request, username, password }) => ({

  when: actions([Requesting.request, { path: "/login", username, password }, {

    request,

  }]),

  then: actions([PasswordAuthentication.authenticate, { username, password }]),

});

  

export const LoginSuccessCreatesSession: Sync = ({ user }) => ({

  when: actions([PasswordAuthentication.authenticate, {}, { user }]),

  then: actions([Sessioning.create, { user }]),

});

  

export const LoginResponseSuccess: Sync = ({ request, user, session }) => ({

  when: actions(

    [Requesting.request, { path: "/login" }, { request }],

    [PasswordAuthentication.authenticate, {}, { user }],

    [Sessioning.create, { user }, { session }],

  ),

  then: actions([Requesting.respond, { request, session }]),

});

  

export const LoginResponseError: Sync = ({ request, error }) => ({

  when: actions(

    [Requesting.request, { path: "/login" }, { request }],

    [PasswordAuthentication.authenticate, {}, { error }],

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

  

// -- Get All Users (query passthrough via Requesting) -- //

// As per query conventions, invoke the concept query in `where` and respond in `then`.

export const GetAllUsersResponseSuccess: Sync = (

  { request, session, user, users, error },

) => ({

  when: actions([

    Requesting.request,

    { path: "/PasswordAuthentication/_getAllUsers", session },

    { request },

  ]),

  where: async (frames) => {

    // Gate by session: resolve to a valid user before executing query

    frames = await frames.query(Sessioning._getUser, { session }, { user });

    frames = await frames.query(

      PasswordAuthentication._getAllUsers,

      {},

      { users, error },

    );

    frames = frames.filter((f) =>

      (f as Record<symbol, unknown>)[users] !== undefined

    );

    return frames;

  },

  then: actions([Requesting.respond, { request, users }]),

});

  

export const GetAllUsersResponseError: Sync = (

  { request, session, user, users, error },

) => ({

  when: actions([

    Requesting.request,

    { path: "/PasswordAuthentication/_getAllUsers", session },

    { request },

  ]),

  where: async (frames) => {

    // Gate by session: resolve to a valid user before executing query

    frames = await frames.query(Sessioning._getUser, { session }, { user });

    frames = await frames.query(

      PasswordAuthentication._getAllUsers,

      {},

      { users, error },

    );

    frames = frames.filter((f) =>

      (f as Record<symbol, unknown>)[error] !== undefined

    );

    return frames;

  },

  then: actions([Requesting.respond, { request, error }]),

});
```