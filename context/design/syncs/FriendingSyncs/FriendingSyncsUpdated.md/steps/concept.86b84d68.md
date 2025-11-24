---
timestamp: 'Sun Nov 23 2025 20:16:44 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_201644.402e3bf8.md]]'
content_id: 86b84d68132907ea6b6d649685d2cee10eafd0354986a7c8b34a6963f9cdeb4c
---

# concept: Sessioning \[User]

* **purpose**: To maintain a user's logged-in state across multiple requests without re-sending credentials.
* **principle**: After a user is authenticated, a session is created for them. Subsequent requests using that session's ID are treated as being performed by that user, until the session is deleted (logout).
* **state**:
  * a set of `Session`s with
    * a `user` User
* **actions**:
  * `create (user: User): (session: Session)`
    * **requires**: true.
    * **effects**: creates a new Session `s`; associates it with the given `user`; returns `s` as `session`.
  * `delete (session: Session): ()`
    * **requires**: the given `session` exists.
    * **effects**: removes the session `s`.
* **queries**:
  * `_getUser (session: Session): (user: User)`
    * **requires**: the given `session` exists.
    * **effects**: returns the user associated with the session.

## UserAuthentication:

Specification:
