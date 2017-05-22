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

  2 May 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');
var db = require('../db/objects');

function get(args, callback) {
  // validate JWT and if OK, get the user database pointer

  var byUserId;

  if (args.req.headers.authorization) {
    var status = validation.jwt.call(this, args);
    if (status.error) return callback(status);
    byUserId = status.payload.id;
  }
  var errors;

  var username = args.username;
  if (!username || username === '') {
    errors = errorHandler.add('username', "must be specified", errors);
    return errorHandler.errorResponse(errors, callback);
  }
  if (!db.users.usernameExists.call(this, username)) {
    return errorHandler.notFound(callback);
  }

  // get profile data for the user specified

  var ofUserId = db.users.idByUsername.call(this, username);
  var profile = db.users.getProfile.call(this, ofUserId, byUserId);
  callback({profile: profile});
}

module.exports = get;
