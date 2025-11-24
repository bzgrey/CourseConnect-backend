---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: db1649b748223f6ca9054dd5ec57a23c9fbf7fd4f9bef90471f2090fb9090e07
---

# file: src/concepts/UserAuthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "UserAuthentication" + ".";

interface User {
  _id: ID;
  username: string;
  passwordHash: string;
}

export default class UserAuthenticationConcept {
  users: Collection<User>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  async register({ username, password }: { username: string; password: string }): Promise<{ user: ID } | { error: string }> {
    const existing = await this.users.findOne({ username });
    if (existing) return { error: "Username already taken" };

    // In a real app, use bcrypt or similar. Here we mock it for concept purity/simplicity.
    const passwordHash = `hash_${password}`; 
    const id = freshID();
    
    await this.users.insertOne({ _id: id, username, passwordHash });
    return { user: id };
  }

  async login({ username, password }: { username: string; password: string }): Promise<{ user: ID } | { error: string }> {
    const user = await this.users.findOne({ username });
    if (!user) return { error: "User not found" };

    const passwordHash = `hash_${password}`;
    if (user.passwordHash !== passwordHash) return { error: "Incorrect password" };

    return { user: user._id };
  }

  async _getUserByUsername({ username }: { username: string }): Promise<{ user: ID }[]> {
    const u = await this.users.findOne({ username });
    if (!u) return [];
    return [{ user: u._id }];
  }
}
```
