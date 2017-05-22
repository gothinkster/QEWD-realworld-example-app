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

  3 May 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');
var loginUser = require('./loginUser');

function authenticate(args, callback) {
  // validate request object...

  // check for body and required fields

  var errors = validation.bodyAndFields(args, 'user', ['email', 'password']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var params = {
    email: args.req.body.user.email,
    password: args.req.body.user.password
  };

  var results = loginUser.call(this, params);
  if (results.error) {
    return errorHandler.errorResponse(results.error, callback);
  }
  callback(results);
}

module.exports = authenticate;
