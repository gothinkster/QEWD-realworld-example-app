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
var updateUser = require('./updateUser');


function update(args, callback) {

  // Update User

  // first, validate request object...

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'user', null, ['email', 'password', 'username']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var params = args.req.body.user;

  // validate JWT and get the payload contents

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var session = status.session;
  params.id = status.payload.id;
  params.currentUsername = status.payload.username;

  var results = updateUser.call(this, params, session);

  console.log('*** results = ' + JSON.stringify(results));
  if (results.error) {
    return errorHandler.errorResponse(results.error, callback);
  }
  callback(results);
}

module.exports = update;
