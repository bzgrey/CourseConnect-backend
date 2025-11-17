[@concept-specifications](../../background/concept-specifications.md)
[@concept-design-overview](../../background/concept-design-overview.md)
[@Grouping.md](Grouping.md)

# Can you please update Grouping.md to have the same formatting as the actions for its queries. Only output updated Grouping.md _getMembers, _getAdmins, _getRequests, and _getGroupByName queries.
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