---
timestamp: 'Sun Nov 16 2025 16:41:25 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_164125.8d46ec09.md]]'
content_id: 70133ed833aab33632482c2a5a45b9dd336f3ec5477f882c29dc324b72b6b1e5
---

# response:

```markdown
**queries**
_getGroupMembers (group: Group) : (member: User)
    **requires** group exists
    **effects** returns the set of users that are members of the given group

_getGroupsOfUser (user: User) : (group: Group)
    **requires** user exists
    **effects** returns the set of groups that the given user is a member of

_getGroupName (group: Group) : (name: String)
    **requires** group exists
    **effects** returns the name associated with the group
```
