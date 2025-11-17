---
timestamp: 'Sun Nov 16 2025 16:40:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_164054.984960a7.md]]'
content_id: 48be3adf6255c4ff5bb221e22a7205430406dffb26aabcecf17919cbcc0b84b8
---

# response:

```
## Concept queries

Queries are reads of the concept state. Explicit query specifications are often not used at the design level, but in specifications of concepts for code all queries that are likely to be needed should be specified.
For example, for a *UserProfile* concept with this state

```

a set of Users with
a username String
a password String

```

one could define queries to extract the username and password of a user:

**queries**
  _getUsername (user: User) : (username: String)
    **requires** user exists
    **effects** returns username of user

  _getPassword (user: User) : (password: String)
    **requires** user exists
    **effects** returns password of user

Some queries return multiple objects. For example, groups contain sets of users

```

a set of Groups with
a users set of User

```

then a query could take a group and return the set of users in it:

**queries**
  _getUsers (group: Group) : (user: User)
    **requires** group exists
    **effects** returns set of all users in the group

Note that queries, unlike actions, can return structured objects. For example, given the definitions of users and groups above, we could define a query

**queries**
  _getUsersWithUsernamesAndPasswords (group: Group) : (user: {username: String, password: String})
    **requires** group exists
    **effects** returns set of all users in the group each with its username and password
```
