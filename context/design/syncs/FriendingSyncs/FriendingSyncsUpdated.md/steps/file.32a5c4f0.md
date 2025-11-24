---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 32a5c4f0e4daf8eb54fdd6a84a77df65db25d3d83927e71152c69357d70fecca
---

# file: src/concepts/Blocking/BlockingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

const PREFIX = "Blocking" + ".";
type User = ID;

interface BlockList {
  _id: User; 
  blockedUsers: User[];
}

export default class BlockingConcept {
  blockLists: Collection<BlockList>;

  constructor(private readonly db: Db) {
    this.blockLists = this.db.collection(PREFIX + "blockLists");
  }

  async blockUser({ blocker, userToBlock }: { blocker: User; userToBlock: User }): Promise<Empty | { error: string }> {
    if (blocker === userToBlock) return { error: "A user cannot block themselves." };
    await this.blockLists.updateOne({ _id: blocker }, { $addToSet: { blockedUsers: userToBlock } }, { upsert: true });
    return {};
  }

  async unblockUser({ blocker, userToUnblock }: { blocker: User; userToUnblock: User }): Promise<Empty | { error: string }> {
    await this.blockLists.updateOne({ _id: blocker }, { $pull: { blockedUsers: userToUnblock } });
    return {};
  }

  async _isUserBlocked({ primaryUser, secondaryUser }: { primaryUser: User; secondaryUser: User }): Promise<{ result: boolean }[]> {
    const count = await this.blockLists.countDocuments({
      _id: primaryUser,
      blockedUsers: secondaryUser,
    });
    return [{ result: count > 0 }];
  }

  async _blockedUsers({ user }: { user: User }): Promise<{ user: User }[]> {
    const blockList = await this.blockLists.findOne({ _id: user });
    if (!blockList) return [];
    return blockList.blockedUsers.map((blockedUser) => ({ user: blockedUser }));
  }
}
```
