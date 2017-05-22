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

  var username = messageObj.params.username;
  if (!username || username === '') {
    var errors = errorHandler.add('username', "must be specified");
    return errorHandler.errorResponse(errors, finished);
  }
  if (!db.users.usernameExists.call(this, username)) {
    return errorHandler.notFound(finished);
  }

  var byUserId = session.data.$('id').value;
  if (byUserId === '') byUserId = null;

  var ofUserId = db.users.idByUsername.call(this, username);
  var profile = db.users.getProfile.call(this, ofUserId, byUserId);
  if (profile.error) {
    return errorHandler.errorResponse(profile.error, finished);
  }
  finished({profile: profile});
};
