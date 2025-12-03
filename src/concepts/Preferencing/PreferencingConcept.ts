import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix
const PREFIX = "Preferencing" + ".";

// Generic types
type User = ID;
type Item = ID;

/**
 * @concept Preferencing [User, Item]
 * @purpose To allow a user to assign personal numerical scores to multiple items, and to query these scores.
 * @principle Each user can assign a score to any item. A user cannot score the same item multiple times, but can score different items.
 */

/**
 * A set of Preferences with user, item, and score
 */
interface Preference {
  _id: ID;
  user: User;
  item: Item;
  score: number;
}

/**
 * A set of Users with preferences
 */
interface UserDoc {
  _id: User;
  preferences: ID[]; // Array of preference IDs
}

export default class PreferencingConcept {
  preferences: Collection<Preference>;
  users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.preferences = this.db.collection(PREFIX + "preferences");
    this.users = this.db.collection(PREFIX + "users");
  }

  // Actions

  /**
   * addScore (user: User, item: Item, score: Number)
   *
   * @requires The `score` must be a valid number.
   * @effects If the user has not scored this item, adds a new preference. If the user has already scored this item, updates the score to the new value.
   */
  async addScore(
    { user, item, score }: { user: User; item: Item; score: number },
  ): Promise<Empty | { error: string }> {
    const existing = await this.preferences.findOne({ user, item });

    if (existing) {
      // Update existing score
      await this.preferences.updateOne(
        { user, item },
        { $set: { score } },
      );
    } else {
      // Add new preference
      const preferenceId = freshID();
      await this.preferences.insertOne({
        _id: preferenceId,
        user,
        item,
        score,
      });

      // Add preference ID to user's preferences array (create user if doesn't exist)
      await this.users.updateOne(
        { _id: user },
        { $push: { preferences: preferenceId } },
        { upsert: true },
      );
    }

    return {};
  } /**
   * removeScore (user: User, item: Item)
   *
   * @requires The `user` must have scored the specified `item`.
   * @effects Removes the preference for this `user` and `item` combination.
   */

  async removeScore(
    { user, item }: { user: User; item: Item },
  ): Promise<Empty | { error: string }> {
    const existing = await this.preferences.findOne({ user, item });

    if (!existing) {
      return { error: "User has not scored this item." };
    }

    // Remove preference from preferences collection
    await this.preferences.deleteOne({ user, item });

    // Remove preference ID from user's preferences array
    await this.users.updateOne(
      { _id: user },
      { $pull: { preferences: existing._id } },
    );

    return {};
  }

  // Queries

  /**
   * _getScore (user: User, item: Item): (score: Number)
   *
   * @requires `user` exists and `item` is associated with `user`
   * @outputs returns `score` associated with `item`
   */
  async _getScore(
    { user, item }: { user: User; item: Item },
  ): Promise<{ score: number }[]> {
    const preference = await this.preferences.findOne({ user, item });
    if (!preference) {
      return [];
    }

    return [{ score: preference.score }];
  }

  /**
   * _getAllItems(user: User): (items: Item[])
   *
   * @requires `user` exists
   * @effects list of Item `items` associated with the `user` is returned
   */
  async _getAllItems({ user }: { user: User }): Promise<{ item: Item }[]> {
    const preferences = await this.preferences.find({ user }).toArray();
    return preferences.map((pref) => ({ item: pref.item }));
  }
}
