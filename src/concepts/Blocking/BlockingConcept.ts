import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "Blocking" + ".";

// Generic types of this concept
type User = ID;

/**
 * A set of blockLists with:
 *   a user: User
 *   a blockedUsers list of Users
 */
interface BlockList {
  _id: User; // Represents the 'user'
  blockedUsers: User[];
}

/**
 * @concept Blocking [User]
 * @purpose To empower users to prevent specific individuals from viewing their information, even if they are in a shared group or context.
 * @principle If User A blocks User B, then even if they are both members of the same group, any application feature that tries to show User A's schedule to User B will fail or show nothing.
 */
export default class BlockingConcept {
  blockLists: Collection<BlockList>;

  constructor(private readonly db: Db) {
    this.blockLists = this.db.collection(PREFIX + "blockLists");
  }

  /**
   * blockUser (blocker: User, userToBlock: User)
   *
   * @requires blocker is not userToBlock
   * @effects If blocker exists as a user in `blockLists`, add `userToBlock` to `blockedUsers` for the entry of blockLists with user==blocker if userToBlock isn't already in the `blockedUsers` list. Otherwise create a new blockLists entry with user=blocker, and the list [userToBlock]
   */
  async blockUser({ blocker, userToBlock }: { blocker: User; userToBlock: User }): Promise<Empty | { error: string }> {
    if (blocker === userToBlock) {
      return { error: "A user cannot block themselves." };
    }

    await this.blockLists.updateOne({ _id: blocker }, { $addToSet: { blockedUsers: userToBlock } }, { upsert: true });

    return {};
  }

  /**
   * unblockUser (blocker: User, userToUnblock: User)
   *
   * @requires `userToUnblock` is in the `blockedUsers` list for the entry in blockLists where `user` is `blocker`
   * @effects Removes the `userToUnblock` from the `blockedUsers` list.
   */
  async unblockUser({ blocker, userToUnblock }: { blocker: User; userToUnblock: User }): Promise<Empty | { error: string }> {
    const result = await this.blockLists.updateOne({ _id: blocker }, { $pull: { blockedUsers: userToUnblock } });

    if (result.matchedCount === 0) {
      // This case means the blocker didn't have a blocklist to begin with, so the user is effectively unblocked.
      // We can return success as the end state is correct.
    }

    return {};
  }

  /**
   * _isUserBlocked(primaryUser: User, secondaryUser: User): (result: boolean)[]
   *
   * @effects Returns true if `primaryUser` is a user in a blockLists entry and `secondaryUser` is in that entry’s `blockedUsers` list.
   */
  async _isUserBlocked({ primaryUser, secondaryUser }: { primaryUser: User; secondaryUser: User }): Promise<{ result: boolean }[]> {
    const count = await this.blockLists.countDocuments({
      _id: primaryUser,
      blockedUsers: secondaryUser,
    });
    return [{ result: count > 0 }];
  }

  /**
   * _blockedUsers(user: User): (user: User)[]
   *
   * @effects returns blockedUsers for blockLists entry with `user`, and if one doesn't exist return an empty list
   */
  async _blockedUsers({ user }: { user: User }): Promise<{ user: User }[]> {
    const blockList = await this.blockLists.findOne({ _id: user });
    if (!blockList) {
      return [];
    }
    return blockList.blockedUsers.map((blockedUser) => ({ user: blockedUser }));
  }
}
