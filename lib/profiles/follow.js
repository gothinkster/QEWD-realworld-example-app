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

function follow(args, callback) {

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var session = status.session;
  var userDoc = status.userDoc;
  var userRecord = status.userRecord;
  var errors;

  var usernameToFollow = args.username;
  if (!usernameToFollow || usernameToFollow === '') {
    errors = errorHandler.add('username', "to follow must be specified", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  if (usernameToFollow === userRecord.$('username').value) {
    errors = errorHandler.add('username', "cannot be yourself", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  var idToFollow = userDoc.$(['byUsername', usernameToFollow]).value;
  if (idToFollow === '') {
    return callback({
      error: 'Not Found',
      status: {
        code: '404'
      }
    });
  }

  var toFollowDoc = userRecord.$(['follows', idToFollow]);
  if (toFollowDoc.exists) {
    errors = errorHandler.add('username', "is already being followed", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  toFollowDoc.value = idToFollow;

  // get profile data from the id to be followed

  var followDoc = userDoc.$(['byId', idToFollow]);
  var profile = {
    username: followDoc.$('username').value,
    bio: followDoc.$('bio').value,
    image: followDoc.$('image').value,
    following: true
  };
  callback({profile: profile});
}

module.exports = follow;
