---
timestamp: 'Sun Nov 16 2025 16:42:02 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_164202.682f311d.md]]'
content_id: 0d492589221e666ed075b4c459244bcb736401d62de3b7c4f0d18108a547c10d
---

# response:

```markdown
**queries**
  _getMembers (group: Group) : (member: Member)
    **requires** group exists
    **effects** returns set of all members in the group

  _getAdmins (group: Group) : (admin: Member)
    **requires** group exists
    **effects** returns set of all admins in the group

  _getRequests (group: Group) : (member: Member)
    **requires** group exists
    **effects** returns set of all members that have requested to join the group

  _getGroupByName (name: String) : (group: Group)
    **requires** group with that name exists
    **effects** returns the group with the given name
```
