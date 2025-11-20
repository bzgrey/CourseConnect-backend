
[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-specifications](../../background/concept-specifications.md)

[@Friending](Friending.md)

# implement: Friending
# response:

# concept: Friending

*   **concept**: Friending \[User]
*   **purpose**: To manage mutual, consent-based social connections between users.
*   **principle**: If User A sends a friend request to User B, and User B accepts the request, then User A and User B will appear on each other's friends list.
*   **state**:
    `pendingRequests: a set of (requester: User, requestee: User)`
    `friends: a set of {user1: User, user2: User}` (a symmetric relationship)
*   **actions**:
    `requestFriend (requester: User, requestee: User)`
    **requires** `requester` and `requestee` are not already friends. A pending request from `requester` to `requestee` does not already exist. `requester` is not `requestee`.
    **effects** Adds the pair (`requester`, `requestee`) to the `pendingRequests` set.

    `acceptFriend (requester: User, requestee: User)`
    **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
    **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`. Adds the pair `{requester, requestee}` to the `friends` set.

    `rejectFriend (requester: User, requestee: User)`
    **requires** A pending request from `requester` to `requestee` exists in pendingRequests.
    **effects** Removes the pair (`requester`, `requestee`) from `pendingRequests`.

    `removeFriend (remover: User, removed: User)`
    **requires** `remover` and `removed` are friends.
    **effects** Removes the pair `{remover, removed}` from the `friends` set.
*   **queries**
    `_getAllFriendRequests (user:User):User[]`
    **effects** returns list of requestees for user

    `_getAllFriends (user:User):User[]`
    **effects** returns list of friends for user

    `_areTheyFriends(user1:User, user2:User): Boolean`
    **effects** returns true if {user1, user2} exists in friends otherwise false

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
   * _getAllFriendRequests (user:User): (requestee: User)[]
   * **effects** returns list of requestees for user
   */
  async _getAllFriendRequests({ user }: { user: User }): Promise<{ requestee: User }[]> {
    const requests = await this.pendingRequests.find({ requester: user }).toArray();
    return requests.map((req) => ({ requestee: req.requestee }));
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