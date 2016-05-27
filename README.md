# dscl-users

Macos helper to help manage user and group.

# install

```sh
npm i @mh-cbon/dscl-users --save
```

# usage

```js
var dscl  = require('@mh-cbon/dscl-users')


// work with groups
dscl.groups(function (err, groups) {
  err && console.error(err);
  !err && console.log(groups);
})
dscl.groupsDetails(function (err, items) {
  err && console.error(err);
  !err && console.log(items);
})
dscl.listGids(function (err, gids) {
  err && console.error(err);
  !err && console.log(gids);
})
dscl.newGid(function (err, gid) {
  err && console.error(err);
  !err && console.log(gid);
})
dscl.getGroupId('the group name', function (err, gid) {
  err && console.error(err);
  !err && console.log(gid);
})
dscl.groupDetails('the group name', function (err, details) {
  err && console.error(err);
  !err && console.log(details);
})
dscl.groupExists('the group name', function (err, exists) {
  err && console.error(err);
  !err && console.log("exists %s", exists);
})
dscl.groupAdd('the group name', {}, function (err) {
  err && console.error(err);
})
dscl.groupAddUser('the group name', 'the user name', {}, function (err) {
  err && console.error(err);
})
dscl.groupRemUser('the group name', 'the user name', {}, function (err) {
  err && console.error(err);
})
dscl.groupRemove('the group name', {}, function (err) {
  err && console.error(err);
})
dscl.getGroupName(502, {}, function (err, name) {
  err && console.error(err);
  !err && console.log(name);
})


// work with users
dscl.users(function (err, users) {
  err && console.error(err);
  !err && console.log(users);
})
dscl.listUids(function (err, uids) {
  err && console.error(err);
  !err && console.log(uids);
})
dscl.newUid(function (err, uid) { // uid > 500
  err && console.error(err);
  !err && console.log(uid);
})
dscl.newSystemUid(function (err, uid) { // uid < 500
  err && console.error(err);
  !err && console.log(uid);
})
dscl.userDetails('the user name', function (err, details) {
  err && console.error(err);
  !err && console.log(details);
})
dscl.userExists('the user name', function (err, exists) {
  err && console.error(err);
  !err && console.log("exists %s", exists);
})
dscl.getGroupsOfUser('the user name', function (err, groups) {
  err && console.error(err);
  !err && console.log(groups);
})
dscl.userAdd('the user name', {
  uid: 11,
  gid: 12,
  hidden: false,
  guest: false,
  home_dir: true, // can be a string to the path, will create and chown it.
  full_name: 'the full name',
  password: 'the password',
  shell: '/bin/bash'
}, function (err) {
  err && console.error(err);
});
dscl.userRemove('the user name', {
  remove: false, // delete home directory
}, function (err) {
  err && console.error(err);
});
dscl.remUserFromGroups('the user name', function (err) {
  err && console.error(err);
});
```

# test

- get vagrant from the official website
- run `sh mocha.sh`

# debug

Use `DEBUG=@mh-cbon/dscl-users` to get short debug output.

Use `DEBUG=@mh-cbon/dscl-users,@mh-cbon/dscl-users:full` to get a more complete output.
