---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 6c5749d7844f07b9efbafbd749164918437f088b4a1811709fbe6e461e880c32
---

# file: src/concepts/Friending/FriendingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Friending" + ".";
type User = ID;

interface PendingRequest {
  _id: ID;
  requester: User;
  requestee: User;
}

interface Friend {
  _id: ID;
  user1: User;
  user2: User;
}

export default class FriendingConcept {
  pendingRequests: Collection<PendingRequest>;
  friends: Collection<Friend>;

  constructor(private readonly db: Db) {
    this.pendingRequests = this.db.collection(PREFIX + "pendingRequests");
    this.friends = this.db.collection(PREFIX + "friends");
  }

  private _canonicalOrder(userA: User, userB: User): [User, User] {
    return userA < userB ? [userA, userB] : [userB, userA];
  }

  async requestFriend({ requester, requestee }: { requester: User; requestee: User }): Promise<Empty | { error: string }> {
    if (requester === requestee) return { error: "Cannot send a friend request to oneself." };
    const [u1, u2] = this._canonicalOrder(requester, requestee);
    const areFriends = await this.friends.findOne({ user1: u1, user2: u2 });
    if (areFriends) return { error: "Users are already friends." };
    const existingRequest = await this.pendingRequests.findOne({ requester, requestee });
    if (existingRequest) return { error: "A friend request already exists." };

    await this.pendingRequests.insertOne({ _id: freshID(), requester, requestee });
    return {};
  }

  async acceptFriend({ requester, requestee }: { requester: User; requestee: User }): Promise<Empty | { error: string }> {
    const request = await this.pendingRequests.findOne({ requester, requestee });
    if (!request) return { error: "No pending friend request found." };
    await this.pendingRequests.deleteOne({ _id: request._id });

    const [user1, user2] = this._canonicalOrder(requester, requestee);
    const alreadyFriends = await this.friends.findOne({ user1, user2 });
    if (!alreadyFriends) {
      await this.friends.insertOne({ _id: freshID(), user1, user2 });
    }
    return {};
  }

  async rejectFriend({ requester, requestee }: { requester: User; requestee: User }): Promise<Empty | { error: string }> {
    const result = await this.pendingRequests.deleteOne({ requester, requestee });
    if (result.deletedCount === 0) return { error: "No pending friend request found to reject." };
    return {};
  }

  async removeFriend({ remover, removed }: { remover: User; removed: User }): Promise<Empty | { error: string }> {
    const [user1, user2] = this._canonicalOrder(remover, removed);
    const result = await this.friends.deleteOne({ user1, user2 });
    if (result.deletedCount === 0) return { error: "These users are not friends." };
    return {};
  }

  async _getAllIncomingFriendRequests({ user }: { user: User }): Promise<{ requestee: User }[]> {
    const requests = await this.pendingRequests.find({ requester: user }).toArray();
    return requests.map((req) => ({ requestee: req.requestee }));
  }

  async _getAllOutgoingFriendRequests({ user }: { user: User }): Promise<{ requester: User }[]> {
    const requests = await this.pendingRequests.find({ requestee: user }).toArray();
    return requests.map((req) => ({ requester: req.requester }));
  }

  async _getAllFriends({ user }: { user: User }): Promise<{ friend: User }[]> {
    const friendships = await this.friends.find({ $or: [{ user1: user }, { user2: user }] }).toArray();
    const friends = friendships.map((friendship) => {
      return friendship.user1 === user ? friendship.user2 : friendship.user1;
    });
    return friends.map((f) => ({ friend: f }));
  }

  async _areTheyFriends({ user1, user2 }: { user1: User; user2: User }): Promise<{ areFriends: boolean }[]> {
    const [u1, u2] = this._canonicalOrder(user1, user2);
    const friendship = await this.friends.findOne({ user1: u1, user2: u2 });
    return [{ areFriends: !!friendship }];
  }
}
```
