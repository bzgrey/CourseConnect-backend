---
timestamp: 'Mon Dec 01 2025 23:24:05 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251201_232405.53dcf39d.md]]'
content_id: 7ad1038e33ea27afefcaa2e3e918665281aa397228d6e683fe66944917bc77a4
---

# file: src/concepts/preferencing/PreferencingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Collection prefix
const PREFIX = "Preferencing" + ".";

// Generic types
type User = ID;
type Item = ID;

/**
 * @concept Preferencing [User, Item]
 * @purpose To allow a user to assign a personal numerical score to a single item at a time, and to query this score.
 * @principle Each user can assign a score to at most one item at any given time. Assigning a score to an item (either new or existing) replaces any previously held item and score for that user.
 */

/**
 * A set of Users with
 *  an item of type Item
 *  a score of type Number
 */
interface Users {
  _id: User;
  item: Item;
  score: number;
}

export default class PreferencingConcept {
  users: Collection<Users>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  // Actions

  /**
   * addScore (user: User, item: Item, score: Number)
   *
   * @requires The `user` must not currently have an `item` and `score` assigned. The `score` must be a valid number.
   * @effects Assigns the given `item` and `score` to the `user`.
   */
  async addScore({ user, item, score }: { user: User; item: Item; score: number }): Promise<Empty | { error: string }> {
    const existing = await this.users.findOne({ _id: user });
    if (existing) {
      return { error: "User already has a scored item. Use updateScore or removeScore first." };
    }

    await this.users.insertOne({ _id: user, item, score });
    return {};
  }

  /**
   * updateScore (user: User, item: Item, score: Number)
   *
   * @requires The `user` must already have the specified `item` assigned. The `score` must be a valid number.
   * @effects Updates the `score` for the `user`'s assigned `item` to the new value.
   */
  async updateScore({ user, item, score }: { user: User; item: Item; score: number }): Promise<Empty | { error: string }> {
    const existing = await this.users.findOne({ _id: user });

    if (!existing) {
      return { error: "User has no scored item to update." };
    }

    if (existing.item !== item) {
      return { error: "User is not scored on the specified item." };
    }

    const { matchedCount } = await this.users.updateOne({ _id: user }, { $set: { score } });

    if (matchedCount === 0) {
      // This case should theoretically not be reached due to the checks above, but it's good practice.
      return { error: "Failed to find the user's score to update." };
    }

    return {};
  }

  /**
   * removeScore (user: User, item: Item)
   *
   * @requires The `user` must have the specified `item` assigned to them.
   * @effects Clears the `item` and `score` from the `user`'s record, removing the preference.
   */
  async removeScore({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const existing = await this.users.findOne({ _id: user });

    if (!existing) {
      return { error: "User has no scored item to remove." };
    }

    if (existing.item !== item) {
      return { error: "User is not scored on the specified item." };
    }

    const { deletedCount } = await this.users.deleteOne({ _id: user });

    if (deletedCount === 0) {
      // This case should also not be reached.
      return { error: "Failed to find the user's score to remove." };
    }

    return {};
  }

  // Queries

  /**
   * _getScore (user: User, item: Item): (score: Number)
   *
   * @requires `user` exists and `item` is associated with `user`
   * @outputs returns `score` associated with `item`
   */
  async _getScore({ user, item }: { user: User; item: Item }): Promise<{ score: number }[]> {
    const record = await this.users.findOne({ _id: user, item: item });
    if (!record) {
      return [];
    }
    return [{ score: record.score }];
  }

  /**
   * _getAllItems(user: User): (items: Item[])
   *
   * @requires `user` exists
   * @effects list of Item `items` associated with the `user` is returned
   */
  async _getAllItems({ user }: { user: User }): Promise<{ items: Item[] }[]> {
    const record = await this.users.findOne({ _id: user });
    if (!record) {
      // Per the spec, the user is assumed to exist, but may not have a preference.
      // In this case, they have an empty list of scored items.
      return [{ items: [] }];
    }
    // If the user has a scored item, return it in a list.
    return [{ items: [record.item] }];
  }
}
```
