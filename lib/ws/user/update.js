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

var updateUser = require('../../user/updateUser');
var errorHandler = require('../../utilities/errorHandler');

module.exports = function(messageObj, session, send, finished) {
  messageObj.params.id = session.data.$('id').value;
  messageObj.params.currentUsername = session.data.$('username').value;
  var results = updateUser.call(this, messageObj.params, session);
  if (results.error) {
    return errorHandler.errorResponse(results.error, finished);
  }
  // update the username in case it changed
  session.data.$('username').value = results.user.username;
  finished(results);
};
