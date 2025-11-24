---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: 81021d8143fd1e554d72cb77afefcae8190e3c7b987ff93b095c8f4caf6ea4a8
---

# file: src/concepts/Sessioning/SessioningConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Sessioning" + ".";
type User = ID;

interface Session {
  _id: ID;
  user: User;
}

export default class SessioningConcept {
  sessions: Collection<Session>;

  constructor(private readonly db: Db) {
    this.sessions = this.db.collection(PREFIX + "sessions");
  }

  async create({ user }: { user: User }): Promise<{ session: ID }> {
    const id = freshID();
    await this.sessions.insertOne({ _id: id, user });
    return { session: id };
  }

  async delete({ session }: { session: ID }): Promise<Empty> {
    await this.sessions.deleteOne({ _id: session });
    return {};
  }

  async _getUser({ session }: { session: ID }): Promise<{ user: User }[]> {
    const s = await this.sessions.findOne({ _id: session });
    if (!s) return [];
    return [{ user: s.user }];
  }
}
```
