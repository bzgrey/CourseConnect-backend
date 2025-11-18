---
timestamp: 'Mon Nov 17 2025 23:47:56 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251117_234756.c5cd2323.md]]'
content_id: 0ca65ee804a943ed92f4d5ebd50d703279102e0b55c481d05fa51f04aeb0f771
---

# response:

Of course. Based on the documentation provided, here are proposals for several new synchronizations using the high-level `sync` specification language, without their TypeScript implementations. These examples cover various patterns like permission checks, data aggregation, and conditional actions.

***

### 1. Liking a Post (and preventing duplicate likes)

This synchronization allows a user to like a post but uses a `where` clause to ensure they can only like it once.

```sync
sync LikePost
when
    Requesting.request (path: "/posts/like", session, post) : (request)
where
    in Sessioning: _getUser(session) gets user
    in Post: _hasUserLiked(post, user) is false
then
    Post.addLike (post, user)
    Requesting.respond (request, status: "liked")
```

### 2. Handling Failed Like Attempt

This is the companion to the `LikePost` sync. It handles the case where a user tries to like a post they have already liked, providing specific feedback.

```sync
sync LikePostAlreadyLikedError
when
    Requesting.request (path: "/posts/like", session, post) : (request)
where
    in Sessioning: _getUser(session) gets user
    in Post: _hasUserLiked(post, user) is true
then
    Requesting.respond (request, error: "You have already liked this post.")
```

### 3. Admin-Only User Deletion

This synchronization demonstrates a permission check. An action to delete a user only proceeds if the request comes from a session belonging to an administrator.

```sync
sync DeleteUserByAdmin
when
    Requesting.request (path: "/users/delete", session, userToDelete) : (request)
where
    in Sessioning: _getUser(session) gets adminUser
    in User: _isAdmin(adminUser) is true
then
    User.delete (userToDelete)
    Notification.notify (to: userToDelete, message: "Your account has been removed by an administrator.")
    Requesting.respond (request, status: "user_deleted")
```

### 4. Fetching a User's Profile and Recent Activity

This demonstrates gathering data from multiple concepts (`User` and `Post`) and composing it into a single response object using the `where` clause.

```sync
sync GetUserProfileWithPosts
when
    Requesting.request (path: "/profile/view", userId) : (request)
where
    in User: _getProfile(userId) gets profile
    in Post: _getRecentForUser(author: userId, limit: 5) gets posts
    body is { "profile": profile, "recent_posts": posts }
then
    Requesting.respond (request, body)
```

### 5. Automatic Locking of a Forum Thread After Inactivity

This showcases a time-based or event-driven trigger that is not directly initiated by a user request. It assumes a `Scheduler` concept that can fire time-based events.

```sync
sync LockInactiveThread
when
    Comment.create (thread) : ()
    Scheduler.lapsed (event: "check_thread_activity", target: thread) : ()
where
    in Thread: _getLastActivityTime(thread) gets lastActivity
    in System: _getCurrentTime() gets now
    lastActivity < (now - "30 days")
    in Thread: _isLocked(thread) is false
then
    Thread.lock (thread, reason: "Locked due to 30 days of inactivity.")
```

### 6. Awarding a "First Comment" Badge

This synchronization runs after a comment is created. It queries the state to see if this was the very first comment on a particular post, and if so, awards a badge to the commenter.

```sync
sync AwardFirstCommentBadge
when
    Comment.create (post, author) : (comment)
where
    in Comment: _getCommentCountForPost(post) is 1
then
    Badges.award (user: author, badge: "First!")
```
