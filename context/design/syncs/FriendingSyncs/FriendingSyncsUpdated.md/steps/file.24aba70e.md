---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 24aba70ed873a38bab21f485ec5934be0c10d7aa875cac9d4869e157c5c200f5
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserAuthentication, Sessioning, Scheduling } from "@concepts";

// Register: Create User, Create Schedule, Log them in
export const RegisterSync: Sync = ({ request, username, password, user, session }) => ({
  when: actions([
    Requesting.request, 
    { path: "/auth/register", username, password }, 
    { request }
  ]),
  then: actions(
    [UserAuthentication.register, { username, password }, { user }],
    // Automatically give every new user a schedule
    [Scheduling.createSchedule, { user }],
    // Automatically log them in
    [Sessioning.create, { user }, { session }], 
    [Requesting.respond, { request, user, session }]
  )
});

// Register Error
export const RegisterErrorSync: Sync = ({ request, username, password, error }) => ({
  when: actions(
    [Requesting.request, { path: "/auth/register", username, password }, { request }],
    [UserAuthentication.register, { username, password }, { error }]
  ),
  then: actions([Requesting.respond, { request, error }])
});

// Login
export const LoginSync: Sync = ({ request, username, password, user, session }) => ({
  when: actions([
    Requesting.request, 
    { path: "/auth/login", username, password }, 
    { request }
  ]),
  then: actions(
    [UserAuthentication.login, { username, password }, { user }],
    [Sessioning.create, { user }, { session }],
    [Requesting.respond, { request, user, session }]
  )
});

// Login Error
export const LoginErrorSync: Sync = ({ request, username, password, error }) => ({
  when: actions(
    [Requesting.request, { path: "/auth/login", username, password }, { request }],
    [UserAuthentication.login, { username, password }, { error }]
  ),
  then: actions([Requesting.respond, { request, error }])
});

// Logout
export const LogoutSync: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request, 
    { path: "/auth/logout", session }, 
    { request }
  ]),
  then: actions(
    [Sessioning.delete, { session }],
    [Requesting.respond, { request, status: "logged out" }]
  )
});
```
