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

  19 May 2017

*/

var errorHandler = require('../../utilities/errorHandler');
var db = require('../../db/objects');

module.exports = function(messageObj, session, send, finished) {

  var byUserId = session.data.$('id').value;
  var usernameToUnfollow = messageObj.params.username;
  var errors = {};

  if (!usernameToUnfollow || usernameToUnfollow === '') {
    errors = errorHandler.add('username', "to follow must be specified", errors);
    return errorHandler.errorResponse(errors, finished);
  }

  if (usernameToUnfollow === db.users.getUsername.call(this, userId)) {
    errors = errorHandler.add('username', "cannot be yourself", errors);
    return errorHandler.errorResponse(errors, finished);
  }

  if (!db.users.usernameExists.call(this, usernameToUnfollow)) {
    return callback({
      error: 'Not Found',
      status: {
        code: '404'
      }
    });
  }

  if (!db.users.follows.call(this, id, usernameToUnfollow)) {
    errors = errorHandler.add('username', "is not being followed", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  var profile = db.users.unfollow.call(this, userId, usernameToUnfollow);
  finished({profile: profile});
};
