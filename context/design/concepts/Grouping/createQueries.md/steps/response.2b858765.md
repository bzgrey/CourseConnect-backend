---
timestamp: 'Sun Nov 16 2025 16:39:04 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_163904.e820490b.md]]'
content_id: 2b858765cf680bfc02d2f33e36264a7611fd986337bb85da016808fdc2595782
---

# response:

## Concept queries

Queries are reads of the concept state. Explicit query specifications are often not used at the design level, but in specifications of concepts for code all queries that are likely to be needed should be specified.

For example, for a *UserProfile* concept with this state:

```
a set of Users with
  a username String
  a password String
```

One could define queries to extract the username and password of a user:

**queries**
\_getUsername (user: User): (username: String)
**requires** user exists
**effects** returns username of user

\_getPassword (user: User): (password: String)
**requires** user exists
**effects** returns password of user

Some queries return multiple objects. For example, if a concept state includes groups containing sets of users:

```
a set of Groups with
  a users set of User
```

Then a query could take a group and return the set of users in it:

**queries**
\_getUsers (group: Group): (user: User)
**requires** group exists
**effects** returns set of all users in the group

Note that queries, unlike actions, can return structured objects. For example, given the definitions of users and groups above, we could define a query that returns a set of users, each with a username and password property:

**queries**
\_getUsersWithUsernamesAndPasswords (group: Group): (user: {username: String, password: String})
**requires** group exists
**effects** returns set of all users in the group each with its username and password
