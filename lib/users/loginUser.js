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

var db = require('../db/objects');
var getUser = require('../user/getUser');
var errorHandler = require('../utilities/errorHandler');
var emailValidator = require('email-validator');

function authenticate(args, session) {

  var errors = {};
  var email = args.email;
  var password = args.password;

  if (!email || email === '') {
    errors = errorHandler.add('email', "is blank", errors);
  }
  if (!password || password === '') {
    errors = errorHandler.add('password', "is blank", errors);
  }
  console.log('*** errors = ' + JSON.stringify(errors));
  if (errorHandler.hasErrors(errors)) return {error: errors};

  // check that email is valid

  if (!emailValidator.validate(email) || email.length > 255) {
    errors = errorHandler.add('email', "is invalid", errors);
  }

  // check that password is valid

  if (password.length < 6) {
    errors = errorHandler.add('password', "must be 6 or more characters in length", errors);
  }

  if (errorHandler.hasErrors(errors)) return {error: errors};

  // authenticate

  if (!db.users.authenticate.call(this, email, password)) {
    errors = errorHandler.add('email or password', "is invalid", errors);
    return {error: errors};
  }

  // Start new Session, create JWT and return User

  var id = db.users.idByEmail.call(this, email);
  var user = getUser.call(this, id, session);  // starts new session

  return ({user: user})
}

module.exports = authenticate;
