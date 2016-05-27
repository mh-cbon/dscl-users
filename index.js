
var miss    = require('mississippi');
var split   = require('split');
var async   = require('async');
var spawn   = require('child_process').spawn;
var sudo    = require('@mh-cbon/c-yasudo');
var pkg     = require('./package.json')
var debug   = require('debug')(pkg.name);
var dFull   = require('debug')(pkg.name+':full');
var dStream = require('debug-stream')(debug);
var fs      = require('fs');

function handlerPerLineValues (child, done){
  var res = [];
  child.stdout.pipe(split()).on('data', function (d) {
    res.push(d.toString())
  })
  var e;
  child.on('error', function (err) {
    e = err;
  })
  child.on('close', function (code) {
    done(e, res);
  })
  child.stderr.on('data', function (d) {
    dFull('stderr %s', d.toString())
  });
  child.stdout.on('data', function (d) {
    dFull('stdout %s', d.toString())
  });
}

function viaPlUtil (dscl, done) {
  // sudo dscl -plist . -read /Users/vagrant | plutil -convert json -o - -
  // sudo dscl -plist . -list /Groups | plutil -convert json -o - -
  // var dscl = spawn('dscl', ['-plist', '.', '-list', '/Groups']);
  var plutil = spawn('plutil', ['-convert', 'json', '-o', '-', '-']);
  dscl.stdout.pipe(plutil.stdin);
  plutil.stderr.on('data', function (d) {
    dFull('stderr %s', d.toString())
  });
  plutil.stdout.on('data', function (d) {
    dFull('stdout %s', d.toString())
  });
  var data = '';
  plutil.stdout.on('data', function (d) {
    data += d.toString();
  });
  var stderr = '';
  plutil.stderr.on('data', function (d) {
    stderr += d.toString();
  });
  var plerr;
  plutil.on('error', function (err) {
    plerr = err;
  })
  var e;
  dscl.on('error', function (err) {
    e = err;
  })
  dscl.on('error', function (code) {
    console.error('err=%s', code)
  })
  plutil.on('close', function (code) {
    debug('plutil code=%s', code)
    debug('plutil err=%s', plerr)
    debug('plutil stderr=%s', stderr)
    if (code!==0) return done(e || new Error('code='+code+'\n'+stderr))
    return done(null, JSON.parse(data));
  })
}

function sspawn (bin, args){
  debug('%s %s', bin, args.join(' '))
  return sudo(bin, args, {stdio:'pipe'})
}

function sexec(bin, args, done) {
  var child = sspawn(bin, args)
  child.stderr.on('data', function (d) {
    dFull('stderr %s', d.toString())
  });
  child.stdout.on('data', function (d) {
    dFull('stdout %s', d.toString())
  });
  var e;
  child.on('error', function (err) {
    e = err;
  })
  var stderr = '';
  child.stderr.on('data', function (d) {
    stderr += d.toString();
  });
  child.on('close', function (code) {
    debug('child code=%s', code)
    debug('child err=%s', e)
    debug('child stderr=%s', stderr)
    if(e || code!==0) return done(e||new Error(stderr));
    done();
  })
  return child;
}

function listGids (done) {
  viaPlUtil(
    sspawn('dscl', ['-plist', '.', '-readall', '/Groups', 'PrimaryGroupID']),
    function (err, res) {
      if (err) return done(err);
      res = res.map(function (d) {
        return parseInt(d['dsAttrTypeStandard:PrimaryGroupID'][0])
      })
      res.sort(function (a, b) {
        if (a<b) return -1;
        if (a>b) return 1;
        return 0;
      })
      done(err, res);
    }
  )
}

function newGid (done) {
  listGids(function (err, res) {
    if (err) return done(err);
    for(var h=0;h<res[res.length-1];h++) {
      if (res.indexOf(h)===-1) break;
    }
    done(err, h);
  })
}

function groups (done) {
  handlerPerLineValues(
    sspawn('dscl', ['.', '-list', 'Groups']),
    done
  )
}

function groupDetails (name, done) {
  viaPlUtil(
    sspawn('dscl', ['-plist', '.', '-read', '/Groups/' + name]),
    done
  )
}

function groupsDetails (done) {
  viaPlUtil(
    sspawn('dscl', ['-plist', '.', '-readall', '/Groups']),
    done
  )
}

function groupExists (name, done) {
  groups(function (err, res) {
    if (err) return done(err);
    done(err, res.indexOf(name)>-1);
  })
}

function groupAdd (name, opts, done) {
  var todos = [];
  var gid;
  todos.push(function (next) {
    groupExists(name, function (err, e) {
      if (e) return next(new Error('group exists'))
      next();
    })
  })
  todos.push(function (next) {
    newGid(function (err, g) {
      gid = g;
      next(err);
    })
  })
  todos.push(function (next) {
    sexec('dscl', ['.', '-create', '/Groups/' + name, 'name', name], next)
  })
  todos.push(function (next) {
    var p = opts.p || opts.password || '*'
    p = p==='*' ? '\\*' : p;
    sexec('dscl', ['.', '-create', '/Groups/' + name, 'passwd', p], next)
  })
  todos.push(function (next) {
    var g = opts.g || opts.gid || gid
    sexec('dscl', ['.', '-create', '/Groups/' + name, 'gid', g], next)
  })
  async.series(todos, function (err) {
    done(err)
  })
}

function groupRemove (name, opts, done) {
  var todos = [];
  todos.push(function (next) {
    sexec('dscl', ['.', '-delete', '/Groups/' + name], next)
  })
  async.series(todos, function (err) {
    done(err)
  })
}

function groupAddUser (group_name, user_name, opts, done) {
  groupDetails(group_name, function (err, details) {
    if (err) return done(err);
    if (details['dsAttrTypeStandard:GroupMembership']
      && details['dsAttrTypeStandard:GroupMembership'].indexOf(user_name)>-1)
      return done(new Error('Already subscribed'))
    sexec('dscl', ['.', '-append', '/Groups/' + group_name, 'GroupMembership', user_name], done)
  })
}

function groupRemUser (group_name, user_name, opts, done) {
  groupDetails(group_name, function (err, details) {
    if (err) return done(err);
    if (!details['dsAttrTypeStandard:GroupMembership']
      || details['dsAttrTypeStandard:GroupMembership'].indexOf(user_name)===-1)
      return done(new Error('Not subscribed'))
    sexec('dscl', ['.', '-delete', '/Groups/' + group_name, 'GroupMembership', user_name], done)
  })
}


function users (done) {
  handlerPerLineValues(
    sspawn('dscl', ['.', '-list', 'Users']),
    done
  )
}

function userDetails (name, done) {
  viaPlUtil(
    sspawn('dscl', ['-plist', '.', '-read', '/Users/' + name]),
    done
  )
}

function userExists (name, done) {
  users(function (err, res) {
    if (err) return done(err);
    done(err, res.indexOf(name)>-1);
  })
}

function listUids (done) {
  viaPlUtil(
    sspawn('dscl', ['-plist', '.', '-readall', '/Users', 'UniqueID']),
    function (err, res) {
      if (err) return done(err);
      res = res.map(function (d) {
        return parseInt(d['dsAttrTypeStandard:UniqueID'][0])
      })
      res.sort(function (a, b) {
        if (a<b) return -1;
        if (a>b) return 1;
        return 0;
      })
      done(err, res);
    }
  )
}

function newUid (done) {
  listUids(function (err, res) {
    if (err) return done(err);
    for(var h=501;h<res[res.length-1]+1;h++) {
      if (res.indexOf(h)===-1) break;
    }
    done(err, h);
  })
}

function newSystemUid (done) {
  listUids(function (err, res) {
    if (err) return done(err);
    for(var h=0;h<500;h++) {
      if (res.indexOf(h)===-1) break;
    }
    done(err, h);
  })
}

function userAdd (name, opts, done) {
  var user_id   = opts.i || opts.uid;
  var group_id  = opts.g || opts.gid;
  var key       = '/Users/' + name;
  var password  = opts.p || opts.password || '*';
  var home_dir  = opts.h || opts.home_dir;
  home_dir      = home_dir===true ? key : home_dir;

  var todos = [];
  todos.push(function (next) {
    userExists(name, function(err, exists) {
      if (exists) return next(new Error('User "' + name + '" already exists.'));
      next();
    });
  })
  todos.push(function (next) {
    if(!user_id) return next(new Error('User id is required !'));
    next();
  })
  todos.push(function (next) {
    if(!group_id) return next(new Error('Group id is required !'));
    next();
  })
  todos.push(function (next) {
    sexec('dscl', ['.', 'create', key], next)
  })
  if (opts.full_name) {
    todos.push(function (next) {
      sexec('dscl', ['.', 'create', key, 'RealName', opts.full_name], next)
    })
  }
  if (opts.shell) {
    todos.push(function (next) {
      sexec('dscl', ['.', 'create', key, 'UserShell', opts.shell], next)
    })
  }
  todos.push(function (next) {
    password = password==='*' ? '\\*' : password;
    sexec('dscl', ['.', 'passwd', key, password], next)
  })
  todos.push(function (next) {
    sexec('dscl', ['.', 'create', key, 'UniqueID', user_id], next)
  })
  todos.push(function (next) {
    sexec('dscl', ['.', 'create', key, 'PrimaryGroupID', group_id], next)
  })
  if (opts.hidden) {
    todos.push(function (next) {
      sexec('dscl', ['.', 'delete', key, 'AuthenticationAuthority'], next)
    })
  }
  if (opts.guest) {
    todos.push(function (next) {
      sexec('dscl', ['.', 'create', key, 'dsAttrTypeNative:_guest: true'], next)
    })
  }
  if (home_dir) {
    todos.push(function (next) {
      sexec('dscl', ['.', 'create', key, 'NFSHomeDirectory', home_dir], next)
    })
    if (!fs.existsSync(home_dir)) {
      // createhomedir won t work...
      todos.push(function (next) {
        sexec('mkdir', ['-p', home_dir], next)
      })
      todos.push(function (next) {
        sexec('chown', ['-R', user_id+':'+group_id, home_dir], next)
      })
    }
  }
  async.series(todos, function (err) {
    done(err)
  })
}

function remUserFromGroups (name, done) {
  groupsDetails(function (err, items) {
    if (err) return done(err);
    items = items.filter(function (i) {
      return i['dsAttrTypeStandard:GroupMembership']
      && i['dsAttrTypeStandard:GroupMembership'].indexOf(name)>-1;
    })

    var todos = [];
    items.forEach(function (group) {
      todos.push(function (next) {
        groupRemUser (group['dsAttrTypeStandard:RecordName'][0], name, {}, next)
      })
    })
    async.series(todos,done)
  })
}

function getGroupName (gid, done) {
  groupsDetails(function (err, items) {
    if (err) return done(err);
    items.filter(function (i) {
      return i['dsAttrTypeStandard:PrimaryGroupID'][0].toString()===gid.toString();
    })
    if (!items.length) return done(new Error('Gid not found ' + gid))
    done(null, items[0]['dsAttrTypeStandard:RecordName'])
  })
}

function getGroupId (name, done) {
  groupDetails(name, function (err, details) {
    if (err) return done(err);
    done(null, details['dsAttrTypeStandard:PrimaryGroupID'])
  })
}

function getGroupsOfUser (name, done) {
  var child = spawn('id', ['-Gn', name]);
  var data = '';
  child.stdout.on('data', function(d) {
    data += d.toString();
  })
  child.on('close', function () {
    var groups = data.split(/\s+/g).filter(function (d) {
      return d.length
    })
    done(null, groups);
  })
}

function userRemove (name, opts, done) {
  var todos = [];
  todos.push(function (next) {
    userExists(name, function(err, exists) {
      if (!exists) return next(new Error('User "' + name + '" does not exist.'));
      next();
    });
  })
  todos.push(function (next) {
    remUserFromGroups(name, next);
  })
  if (opts.r || opts.remove) {
    todos.push(function (next) {
      userDetails(name, function (err, infos) {
        if(!infos['dsAttrTypeStandard:NFSHomeDirectory']) return next();
        var home = infos['dsAttrTypeStandard:NFSHomeDirectory'][0];
        sexec('rm', ['-fr', home], next)
      })
    })
  }
  todos.push(function (next) {
    sexec('dscl', ['.', '-delete', '/Users/' + name], next)
  })
  async.series(todos, function (err) {
    console.error(err);
    done(err)
  })
}



module.exports = {
  listGids:           listGids,
  newGid:             newGid,
  listUids:           listUids,
  newUid:             newUid,
  newSystemUid:       newSystemUid,
  groups:             groups,
  groupsDetails:      groupsDetails,
  getGroupName:       getGroupName,
  getGroupId:         getGroupId,
  groupDetails:       groupDetails,
  groupExists:        groupExists,
  groupAdd:           groupAdd,
  groupRemove:        groupRemove,
  groupAddUser:       groupAddUser,
  groupRemUser:       groupRemUser,
  users:              users,
  userDetails:        userDetails,
  userExists:         userExists,
  userAdd:            userAdd,
  userRemove:         userRemove,
  getGroupsOfUser:    getGroupsOfUser,
  remUserFromGroups:  remUserFromGroups,
}
