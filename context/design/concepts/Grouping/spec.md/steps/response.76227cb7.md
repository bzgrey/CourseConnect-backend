---
timestamp: 'Sun Nov 16 2025 15:52:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_155216.57d5e512.md]]'
content_id: 76227cb72779bb4c6129fbb763f2cca1375243931cbafd588d8c567255a9f24c
---

# response:

* `register (username: String, password: String): (user: User)`
  * **requires**: no User exists with the given `username`.
  * **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`.
* `register (username: String, password: String): (error: String)`
  * **requires**: a User already exists with the given `username`.
  * **effects**: returns an error message in `error`.
* `login (username: String, password: String): (user: User)`
  * **requires**: a User exists with the given `username` and the provided `password` is correct.
  * **effects**: marks the user as authenticated and returns the `user`.
* `logout (user: User)`
  * **requires**: the given `user` is authenticated.
  * **effects**: revokes the authentication for the `user`.
* `reserve (user: User, time: Time, partySize: Number): (reservation: Reservation)`
  * **requires**: a table is available at the given `time` that accommodates the `partySize`.
  * **effects**: creates a new `Reservation` for the `user`, `time`, and `partySize`; returns the new `reservation`.
* `cancel (reservation: Reservation)`
  * **requires**: the `reservation` exists.
  * **effects**: deletes the `reservation`.
* `seat (reservation: Reservation)`
  * **requires**: the `reservation` exists and the party has arrived.
  * **effects**: marks the `reservation` as fulfilled.
* `noShow (reservation: Reservation)`
  * **requires**: the `reservation` exists and its time has passed without the party arriving.
  * **effects**: marks the `reservation` as a no-show.
* `delete (item: Item)`
  * **requires**: `item` is not in the trash.
  * **effects**: moves `item` to the trash.
* `restore (item: Item)`
  * **requires**: `item` is in the trash.
  * **effects**: moves `item` out of the trash.
* `empty ()`
  * **requires**: the trash contains one or more items.
  * **effects**: permanently deletes all items in the trash.
* `createLabel (name: String): (label: Label)`
  * **requires**: no `Label` exists with the given `name`.
  * **effects**: creates a new `Label` `l` with the given `name`; returns `l` as `label`.
* `addLabel (item: Item, label: Label)`
  * **requires**: `item` and `label` exist; `item` is not already labeled with `label`.
  * **effects**: associates `label` with `item`.
* `removeLabel (item: Item, label: Label)`
  * **requires**: `item` is labeled with `label`.
  * **effects**: removes the association between `item` and `label`.
* `createFolder (name: String, parent: Folder): (folder: Folder)`
  * **requires**: `parent` folder exists; no item named `name` exists in `parent`.
  * **effects**: creates a new `Folder` `f` named `name` inside `parent`; returns `f` as `folder`.
* `delete (item: Item | Folder)`
  * **requires**: `item` exists.
  * **effects**: permanently deletes the `item` and its contents if it is a folder.
* `rename (item: Item | Folder, newName: String)`
  * **requires**: `item` exists; no sibling of `item` is named `newName`.
  * **effects**: changes the name of `item` to `newName`.
* `move (item: Item | Folder, newParent: Folder)`
  * **requires**: `item` and `newParent` exist; `newParent` is not a descendant of `item`.
  * **effects**: moves `item` into `newParent`.
* `increment ()`
  * **requires**: true
  * **effects**: `count` := `count` + 1
* `decrement ()`
  * **requires**: `count` > 0
  * **effects**: `count` := `count` - 1
* `reset ()`
  * **requires**: true
  * **effects**: `count` := 0
* **system** `notifyExpiry ()`
  * **requires**: the current time is after `expiryTime` and `notified` is false.
  * **effects**: sets `notified` to true.
