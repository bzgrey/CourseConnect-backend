---
timestamp: 'Sun Nov 23 2025 20:16:44 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_201644.402e3bf8.md]]'
content_id: 3c308ca4007a71d534918a296dac27d33dec46722062ebf92585f733edf37ef9
---

# file: src/concepts/friending/FriendingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";

import { Empty, ID } from "@utils/types.ts";

import { freshID } from "@utils/database.ts";

  

const PREFIX = "Friending" + ".";

  

// Generic types of this concept

type User = ID;

  

/**

 * pendingRequests: a set of (requester: User, requestee: User)

 */

interface PendingRequest {

  _id: ID;

  requester: User;

  requestee: User;

}

  

/**

 * friends: a set of {user1: User, user2: User} (a symmetric relationship)

 * To ensure uniqueness and simplify queries, user1 and user2 are stored in a canonical order (lexicographically).

 */

interface Friend {

  _id: ID;

  user1: User;

  user2: User;

}

  

/**

 * concept: Friending [User]

 * purpose: To manage mutual, consent-based social connections between users.

 * principle: If User A sends a friend request to User B, and User B accepts the request, then User A and User B will appear on each other's friends list.

 */

export default class FriendingConcept {

  pendingRequests: Collection<PendingRequest>;

  friends: Collection<Friend>;

  

  constructor(private readonly db: Db) {

    this.pendingRequests = this.db.collection(PREFIX + "pendingRequests");

    this.friends = this.db.collection(PREFIX + "friends");

  }

  

  /**

   * Returns a canonically ordered pair of users.

   * @param userA First user

   * @param userB Second user

   * @returns A tuple [User, User] where the first element is lexicographically smaller than the second.

   */

  private _canonicalOrder(userA: User, userB: User): [User, User] {

    return userA < userB ? [userA, userB] : [userB, userA];

  }

  

  /**

   * requestFriend (requester: User, requestee: User)

   *

   * **requires** `requester` and `requestee` are not already friends. A pending request from `requester` to `requestee` does not already exist. `requester` is not `requestee`.

   * **effects** Adds the pair (`requester`, `requestee`) to the `pendingRequests` set.

   */

  async requestFriend({ requester, requestee }: { requester: User; requestee: User }): Promise<Empty | { error: string }> {

    if (requester === requestee) {

      return { error: "Cannot send a friend request to oneself." };

    }

  

    const [u1, u2] = this._canonicalOrder(requester, requestee);

    const areFriends = await this.friends.findOne({ user1: u1, user2: u2 });

    if (areFriends) {

      return { error: "Users are already friends." };

    }

  

    const existingRequest = await this.pendingRequests.findOne({ requester, requestee });

    if (existingRequest) {

      return { error: "A friend request already exists." };

    }

  

    await this.pendingRequests.insertOne({

      _id: freshID(),

      requester,

      requestee,

    });

  

    return {};

  }

  

  /**

   * acceptFriend (requester: User, requestee: User)

   *

   * **requires** A pending request from `requester` to `requestee` exists in pendingRequests.

   * **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`. Adds the pair `{requester, requestee}` to the `friends` set.

   */

  async acceptFriend({ requester, requestee }: { requester: User; requestee: User }): Promise<Empty | { error: string }> {

    const request = await this.pendingRequests.findOne({ requester, requestee });

    if (!request) {

      return { error: "No pending friend request found." };

    }

  

    await this.pendingRequests.deleteOne({ _id: request._id });

  

    const [user1, user2] = this._canonicalOrder(requester, requestee);

    // Check if they somehow became friends while the request was pending

    const alreadyFriends = await this.friends.findOne({ user1, user2 });

    if (!alreadyFriends) {

      await this.friends.insertOne({

        _id: freshID(),

        user1,

        user2,

      });

    }

  

    return {};

  }

  

  /**

   * rejectFriend (requester: User, requestee: User)

   *

   * **requires** A pending request from `requester` to `requestee` exists in pendingRequests.

   * **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`.

   */

  async rejectFriend({ requester, requestee }: { requester: User; requestee: User }): Promise<Empty | { error: string }> {

    const result = await this.pendingRequests.deleteOne({ requester, requestee });

    if (result.deletedCount === 0) {

      return { error: "No pending friend request found to reject." };

    }

    return {};

  }

  

  /**

   * removeFriend (remover: User, removed: User)

   *

   * **requires** `remover` and `removed` are friends.

   * **effects** Removes the pair `{remover, removed}` from the `friends` set.

   */

  async removeFriend({ remover, removed }: { remover: User; removed: User }): Promise<Empty | { error: string }> {

    const [user1, user2] = this._canonicalOrder(remover, removed);

    const result = await this.friends.deleteOne({ user1, user2 });

    if (result.deletedCount === 0) {

      return { error: "These users are not friends." };

    }

    return {};

  }

  

  /**

   * _getAllIncomingFriendRequests (user:User): (requestee: User)[]

   * **effects** returns list of requestees for user

   */

  async _getAllIncomingFriendRequests({ user }: { user: User }): Promise<{ requestee: User }[]> {

    const requests = await this.pendingRequests.find({ requester: user }).toArray();

    return requests.map((req) => ({ requestee: req.requestee }));

  }

  

  /**

   * _getAllOutgoingFriendRequests (user:User): (requester: User)[]

   * **effects** returns list of requesters for user

   */

  async _getAllOutgoingFriendRequests({ user }: { user: User }): Promise<{ requester: User }[]> {

    const requests = await this.pendingRequests.find({ requestee: user }).toArray();

    return requests.map((req) => ({ requester: req.requester }));

  }

  

  /**

   * _getAllFriends (user:User): (friend: User)[]

   * **effects** returns list of friends for user

   */

  async _getAllFriends({ user }: { user: User }): Promise<{ friend: User }[]> {

    const friendships = await this.friends.find({ $or: [{ user1: user }, { user2: user }] }).toArray();

    const friends = friendships.map((friendship) => {

      return friendship.user1 === user ? friendship.user2 : friendship.user1;

    });

    return friends.map((f) => ({ friend: f }));

  }

  

  /**

   * _areTheyFriends(user1:User, user2:User): (areFriends: boolean)[]

   * **effects** returns true if {user1, user2} exists in friends otherwise false

   */

  async _areTheyFriends({ user1, user2 }: { user1: User; user2: User }): Promise<{ areFriends: boolean }[]> {

    const [u1, u2] = this._canonicalOrder(user1, user2);

    const friendship = await this.friends.findOne({ user1: u1, user2: u2 });

    return [{ areFriends: !!friendship }];

  }

}
```

## Blocking:

Specification:

* **concept**: Blocking \[User]
* **purpose**: To empower users to prevent specific individuals from viewing their information, even if they are in a shared group or context.
* **principle**: If User A blocks User B, then even if they are both members of the same group, any application feature that tries to show User A's schedule to User B will fail or show nothing.
* **state**:
  * A set of blockLists with:
    * a `user`:User
    * a `blockedUsers` list of Users
* **actions**:
  * `blockUser (blocker: User, userToBlock: User)`
    * **requires** blocker is not userToBlock
    * **effects** If blocker exists as a user in `blockLists`, add `userToBlock` to `blockedUsers` for the entry of blockLists with user==blocker if userToBlock isn't already in the `blockedUsers` list. Otherwise create a new blockLists entry with user=blocker, and the list \[userToBlock]
  * `unblockUser (blocker: User, userToUnblock: User)`
    * **requires** `userToUnblock` is in the `blockedUsers` list for the entry in blockLists where `user` is `blocker`
    * **effects** Removes the pair `userToUnblock` from the `blockedUsers` list.
* **queries**:
  * `_isUserBlocked(primaryUser: User, secondaryUser: User): [Boolean]`
    * **effects** Returns true if `primaryUser` is a user in a blockLists entry and `secondaryUser` is in that entry’s `blockedUsers` list.
  * `blockedUsers(user:User):Users[]`
    * **effects** returns blockedUsers for blockLists entry with `user`, and if one doesn't exist return an empty list

Code:
