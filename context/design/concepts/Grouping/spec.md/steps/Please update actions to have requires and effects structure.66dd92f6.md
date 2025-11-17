---
timestamp: 'Sun Nov 16 2025 15:47:34 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251116_154734.f49008b7.md]]'
content_id: 66dd92f6f3ef08eff40a25b480b3252b451907e38f14cd3e7e0ed9ce064620ee
---

# Please update actions to have requires and effects structure :"

```
*   `register (username: String, password: String): (user: User)`
    *   **requires**: no User exists with the given `username`.
    *   **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`."

    
```
