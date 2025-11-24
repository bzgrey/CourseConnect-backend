---
timestamp: 'Sun Nov 23 2025 20:20:36 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_202036.eff61c98.md]]'
content_id: f25252022d9a4ca70fbff4da3cb54beef833c6a1958b4e553ee84ee6aed321ed
---

# file: src/concepts/Grouping/GroupingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Grouping" + ".";
type User = ID;

interface Group {
  _id: ID;
  name: string;
  members: User[];
  memberRoles: Record<string, "ADMIN" | "MEMBER">; // Map UserID string to Role
  requests: User[];
}

export default class GroupingConcept {
  groups: Collection<Group>;

  constructor(private readonly db: Db) {
    this.groups = this.db.collection(PREFIX + "groups");
  }

  async createGroup({ name, admin }: { name: string; admin: User }): Promise<{ group: ID } | { error: string }> {
    const existing = await this.groups.findOne({ name });
    if (existing) return { error: "Group name taken" };

    const id = freshID();
    await this.groups.insertOne({
      _id: id,
      name,
      members: [admin],
      memberRoles: { [admin]: "ADMIN" },
      requests: []
    });
    return { group: id };
  }

  async deleteGroup({ group }: { group: ID }): Promise<Empty | { error: string }> {
    const res = await this.groups.deleteOne({ _id: group });
    if (res.deletedCount === 0) return { error: "Group not found" };
    return {};
  }

  async renameGroup({ group, newName }: { group: ID; newName: string }): Promise<Empty | { error: string }> {
    const existing = await this.groups.findOne({ name: newName });
    if (existing) return { error: "Name taken" };
    
    const res = await this.groups.updateOne({ _id: group }, { $set: { name: newName }});
    if (res.matchedCount === 0) return { error: "Group not found" };
    return {};
  }

  async requestToJoin({ group, requester }: { group: ID; requester: User }): Promise<Empty | { error: string }> {
    const g = await this.groups.findOne({ _id: group });
    if (!g) return { error: "Group not found" };
    if (g.members.includes(requester)) return { error: "Already a member" };
    
    await this.groups.updateOne({ _id: group }, { $addToSet: { requests: requester } });
    return {};
  }

  async confirmRequest({ group, requester }: { group: ID; requester: User }): Promise<Empty | { error: string }> {
     const g = await this.groups.findOne({ _id: group });
    if (!g) return { error: "Group not found" };
    if (!g.requests.includes(requester)) return { error: "No request found" };

    await this.groups.updateOne({ _id: group }, {
      $pull: { requests: requester },
      $addToSet: { members: requester },
      $set: { [`memberRoles.${requester}`]: "MEMBER" }
    });
    return {};
  }

  async declineRequest({ group, requester }: { group: ID; requester: User }): Promise<Empty | { error: string }> {
    await this.groups.updateOne({ _id: group }, { $pull: { requests: requester } });
    return {};
  }

  async removeMember({ group, member }: { group: ID; member: User }): Promise<Empty | { error: string }> {
    await this.groups.updateOne({ _id: group }, {
      $pull: { members: member },
      $unset: { [`memberRoles.${member}`]: "" }
    });
    return {};
  }

  async adjustRole({ group, member, newRole }: { group: ID; member: User; newRole: string }): Promise<Empty | { error: string }> {
    if (newRole !== "ADMIN" && newRole !== "MEMBER") return { error: "Invalid role" };
    const res = await this.groups.updateOne(
      { _id: group, members: member },
      { $set: { [`memberRoles.${member}`]: newRole } }
    );
    if (res.matchedCount === 0) return { error: "Member not found in group" };
    return {};
  }

  async _getMembers({ group }: { group: ID }): Promise<{ members: User[] }[]> {
    const g = await this.groups.findOne({ _id: group });
    if (!g) return [];
    return [{ members: g.members }];
  }

  async isGroupMember({ group, user }: { group: ID; user: User }): Promise<{ inGroup: boolean }[]> {
    const g = await this.groups.findOne({ _id: group, members: user });
    return [{ inGroup: !!g }];
  }

  async isGroupAdmin({ group, user }: { group: ID; user: User }): Promise<{ isAdmin: boolean }[]> {
    const g = await this.groups.findOne({ _id: group });
    if (!g) return [{ isAdmin: false }];
    return [{ isAdmin: g.memberRoles[user] === "ADMIN" }];
  }

  async _getRequests({ group }: { group: ID }): Promise<{ requestingUser: User }[]> {
    const g = await this.groups.findOne({ _id: group });
    if (!g) return [];
    return g.requests.map(u => ({ requestingUser: u }));
  }

  async _getGroupByName({ name }: { name: string }): Promise<{ group: ID }[]> {
    const g = await this.groups.findOne({ name });
    if (!g) return [];
    return [{ group: g._id }];
  }

  async _getUserGroups({ user }: { user: User }): Promise<{ group: ID }[]> {
    const groups = await this.groups.find({ members: user }).toArray();
    return groups.map(g => ({ group: g._id }));
  }
}
```

***
