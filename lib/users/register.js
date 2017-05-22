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

  9 May 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');
var registerUser = require('./registerUser');

function register(args, callback) {

  // validate request object...

  // check for body and required fields

  var errors = validation.bodyAndFields(args, 'user', ['username', 'email', 'password']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var body = args.req.body;
  var params = {
    username: body.user.username,
    email: body.user.email,
    password: body.user.password
  };

  var results = registerUser.call(this, params);
  //console.log('*** results = ' + JSON.stringify(results));
  if (results.error) {
    return errorHandler.errorResponse(results.error, callback);
  }
  callback(results);
}

module.exports = register;
