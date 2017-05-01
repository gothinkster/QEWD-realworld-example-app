/*
 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  28 April 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');

function unfollow(args, callback) {
  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var session = status.session;
  var userDoc = status.userDoc;
  var userRecord = status.userRecord;
  var errors;

  var usernameToUnfollow = args.username;
  if (!usernameToUnfollow || usernameToUnfollow === '') {
    errors = errorHandler.add('username', "to unfollow must be specified", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  if (usernameToUnfollow === userRecord.$('username').value) {
    errors = errorHandler.add('username', "cannot be yourself", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  var idToUnfollow = userDoc.$(['byUsername', usernameToUnfollow]).value;
  if (idToUnfollow === '') {
    return callback({
      error: 'Not Found',
      status: {
        code: '404'
      }
    });
  }

  var toFollowDoc = userRecord.$(['follows', idToUnfollow]);
  if (!toFollowDoc.exists) {
    return callback({
      error: 'Not Found',
      status: {
        code: '404'
      }
    });
  }

  // delete the follow record on database

  toFollowDoc.delete();

  // get profile data from the id being unfollowed

  var unfollowDoc = userDoc.$(['byId', idToUnfollow]);
  var profile = {
    username: unfollowDoc.$('username').value,
    bio: unfollowDoc.$('bio').value,
    image: unfollowDoc.$('image').value,
    following: false
  };
  callback({profile: profile});
}

module.exports = unfollow;
