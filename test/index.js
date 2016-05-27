require('should')

var fs    = require('fs');
var dscl  = require('../index.js')

describe('dscl-users', function () {

  it('should list groups', function (done) {
    dscl.groups(function (err, groups) {
      (!err).should.eql(true);
      groups.length.should.not.eql(0);
      groups[0].should.match(/.+/);
      groups.indexOf('wheel').should.not.eql(-1);
      done();
    })
  })

  it('should list gids', function (done) {
    dscl.listGids(function (err, gids) {
      (!err).should.eql(true);
      gids.length.should.not.eql(0);
      gids[0].should.match(/[-0-9]+/);
      done();
    })
  })

  it('should create new gid', function (done) {
    dscl.newGid(function (err, newGid) {
      (!err).should.eql(true);
      newGid.should.match(/[-0-9]+/);
      dscl.listGids(function (err, gids) {
        gids.indexOf(newGid).should.eql(-1);
        done();
      })
    })
  })

  it('should read group details', function (done) {
    dscl.groupDetails('sys', function (err, details) {
      (!err).should.eql(true);
      details['dsAttrTypeStandard:RecordName'].should.eql(['sys'])
      done();
    })
  })

  it('should properly fail to read group details', function (done) {
    dscl.groupDetails('NOPNOP', function (err, details) {
      (!err).should.eql(false);
      done();
    })
  })

  it('should tell an user group exist', function (done) {
    dscl.groupExists('sys', function (err, exists) {
      (!err).should.eql(true);
      (exists).should.eql(true);
      done();
    })
  })

  it('should tell an user group does not exist', function (done) {
    dscl.groupExists('NOPNOP', function (err, exists) {
      (!err).should.eql(true);
      (exists).should.eql(false);
      done();
    })
  })

  it('should list users', function (done) {
    dscl.users(function (err, users) {
      (!err).should.eql(true);
      users.length.should.not.eql(0);
      users.indexOf('vagrant').should.not.eql(-1);
      users[0].should.match(/.+/);
      done();
    })
  })

  it('should list uids', function (done) {
    dscl.listUids(function (err, uids) {
      (!err).should.eql(true);
      uids.length.should.not.eql(0);
      uids[0].should.match(/[-0-9]+/);
      done();
    })
  })

  it('should create new uid', function (done) {
    dscl.newUid(function (err, newUid) {
      (!err).should.eql(true);
      newUid.should.match(/[-0-9]+/);
      newUid.should.be.above(500);
      dscl.listUids(function (err, uids) {
        uids.indexOf(newUid).should.eql(-1);
        done();
      })
    })
  })

  it('should create new system uid', function (done) {
    dscl.newSystemUid(function (err, newUid) {
      (!err).should.eql(true);
      newUid.should.match(/[-0-9]+/);
      newUid.should.be.below(500);
      dscl.listUids(function (err, uids) {
        uids.indexOf(newUid).should.eql(-1);
        done();
      })
    })
  })

  it('should read user details', function (done) {
    dscl.userDetails('vagrant', function (err, details) {
      (!err).should.eql(true);
      details['dsAttrTypeStandard:RecordName'].should.eql(['vagrant'])
      done();
    })
  })

  it('should properly fail to read user details', function (done) {
    dscl.userDetails('NOPNOP', function (err, details) {
      (!err).should.eql(false);
      done();
    })
  })

  it('should tell an user exist', function (done) {
    dscl.userExists('vagrant', function (err, exists) {
      (!err).should.eql(true);
      (exists).should.eql(true);
      done();
    })
  })

  it('should tell an user does not exist', function (done) {
    dscl.userExists('NOPNOP', function (err, exists) {
      (!err).should.eql(true);
      (exists).should.eql(false);
      done();
    })
  })

  it('should tell groups a user belong to', function (done) {
    dscl.getGroupsOfUser('vagrant', function (err, groups) {
      (!err).should.eql(true);
      groups.length.should.not.eql(0);
      groups[0].should.match(/.+/);
      done();
    })
  })

  it('should properly fail to tell groups a user belong to', function (done) {
    dscl.getGroupsOfUser('NOPNOPNOP', function (err, groups) {
      (!err).should.eql(true);
      groups.length.should.eql(0);
      done();
    })
  })

  it('should create a group', function (done) {
    dscl.groupAdd('tomate', {}, function (err) {
      (!err).should.eql(true);
      dscl.groupDetails('tomate', function (err, details) {
        (!err).should.eql(true);
        details['dsAttrTypeStandard:RecordName'].should.eql(['tomate'])
        details['dsAttrTypeStandard:Password'].should.eql(['*'])
        details['dsAttrTypeStandard:PrimaryGroupID'].should.eql(['11'])
        done();
      })
    })
  })

  it('should properly fail to create a group', function (done) {
    dscl.groupAdd('tomate', {}, function (err) {
      (!err).should.eql(false);
      done();
    })
  })

  it('should create an user', function (done) {
    dscl.getGroupId('tomate', function (err, gid) {
      (!err).should.eql(true);
      dscl.newUid(function (err, uid) {
        (!err).should.eql(true);
        dscl.userAdd('ketchup', {uid: uid, gid: gid}, function (err) {
          err && console.error(err);
          (!err).should.eql(true);
          dscl.userDetails('ketchup', function (err, details) {
            (!err).should.eql(true);
            details['dsAttrTypeStandard:RecordName'].should.eql(['ketchup'])
            details['dsAttrTypeStandard:PrimaryGroupID'].should.eql(['11'])
            details['dsAttrTypeStandard:Password'].should.eql(['********'])
            done();
          })
        })
      })
    })
  })

  it('should create an user with properties and home', function (done) {
    dscl.getGroupId('tomate', function (err, gid) {
      (!err).should.eql(true);
      dscl.newUid(function (err, uid) {
        (!err).should.eql(true);
        dscl.userAdd('ketchup2', {uid: uid, gid: gid, full_name:'ketchup2', home_dir:true, shell: '/bin/bash'}, function (err) {
          err && console.error(err);
          (!err).should.eql(true);
          dscl.userDetails('ketchup2', function (err, details) {
            (!err).should.eql(true);
            details['dsAttrTypeStandard:RecordName'].should.eql(['ketchup2'])
            details['dsAttrTypeStandard:PrimaryGroupID'].should.eql(['11'])
            details['dsAttrTypeStandard:Password'].should.eql(['********'])
            details['dsAttrTypeStandard:UserShell'].should.eql(['/bin/bash'])
            details['dsAttrTypeStandard:NFSHomeDirectory'].should.eql(['/Users/ketchup2'])
            details['dsAttrTypeStandard:RealName'].should.eql(['ketchup2'])
            fs.access('/Users/ketchup2', fs.F_OK, function (err){
              (!err).should.eql(true);
              done();
            })
          })
        })
      })
    })
  })

  it('should add an user to a group', function (done) {
    dscl.groupAddUser('tomate', 'ketchup', {}, function (err) {
      (!err).should.eql(true);
      dscl.groupDetails('tomate', function (err, details) {
        (!err).should.eql(true);
        details['dsAttrTypeStandard:GroupMembership'].indexOf('ketchup').should.not.eql(-1)
        done();
      })
    })
  })

  it('should properly fail to add an user to a group', function (done) {
    dscl.groupAddUser('tomate', 'ketchup', {}, function (err) {
      (!err).should.eql(false);
      dscl.groupDetails('tomate', function (err, details) {
        (!err).should.eql(true);
        details['dsAttrTypeStandard:GroupMembership'].indexOf('ketchup').should.not.eql(-1)
        done();
      })
    })
  })

  it('should remove an user from a group', function (done) {
    dscl.groupRemUser('tomate', 'ketchup', {}, function (err) {
      dscl.groupDetails('tomate', function (err2, details) {
        (!err).should.eql(true);
        (!err2).should.eql(true);
        details['dsAttrTypeStandard:GroupMembership'] &&
        details['dsAttrTypeStandard:GroupMembership'].indexOf('ketchup').should.eql(-1)
        done();
      })
    })
  })

  it('should properly fail to remove an user from a group', function (done) {
    dscl.groupRemUser('tomate', 'ketchup', {}, function (err) {
      (!err).should.eql(false);
      done();
    })
  })

  it('should delete user', function (done) {
    dscl.userRemove('ketchup', {}, function (err) {
      (!err).should.eql(true);
      done();
    })
  })

  it('should delete user with its home', function (done) {
    dscl.userRemove('ketchup2', {r: true}, function (err) {
      (!err).should.eql(true);
      fs.access('/Users/ketchup2', fs.F_OK, function (err){
        (!err).should.eql(false);
        done();
      })
    })
  })

  it('should delete group', function (done) {
    dscl.groupRemove('tomate', {}, function (err) {
      (!err).should.eql(true);
      done();
    })
  })

  it('should properly fail to delete group', function (done) {
    dscl.groupRemove('tomate', {}, function (err) {
      (!err).should.eql(false);
      done();
    })
  })

})
