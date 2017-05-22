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

var db = require('../db/objects');
var getUser = require('../user/getUser');

var emailValidator = require('email-validator');

function register(args) {

  var errors = {};
  var username = args.username;
  var email = args.email;
  var password = args.password;

  if (!username || username === '') {
    errors = errorHandler.add('username', "is blank", errors);
  }
  if (!email || email === '') {
    errors = errorHandler.add('email', "is blank", errors);
  }
  if (!password || password === '') {
    errors = errorHandler.add('password', "is blank", errors);
  }

  if (errorHandler.hasErrors(errors)) return {error: errors};

  // check that username is valid and doesn't already exist

  if (!validation.matches(username, /^[a-zA-Z0-9]+$/) || username.length > 50) {
    errors = errorHandler.add('username', "is invalid", errors);
  }
  else {
    if (db.users.usernameExists.call(this, username)) {
      errors = errorHandler.add('username', "has already been taken", errors);
    }
  }

  // check that email is valid and doesn't already exist

  if (!emailValidator.validate(email) || email.length > 255) {
    errors = errorHandler.add('email', "is invalid", errors);
  }
  else {
    if (db.users.emailExists.call(this, email)) {
      errors = errorHandler.add('email', "has already been taken", errors);
    }
  }

  // check that password is valid

  if (password.length < 6) {
    errors = errorHandler.add('password', "must be 6 or more characters in length", errors);
  }

  if (errorHandler.hasErrors(errors)) return {error: errors};

  // validation OK - register the new user

  var id = db.users.create.call(this, {
    email: email,
    username: username,
    password: password
  });

  var user = getUser.call(this, id);  // starts new session

  return ({user: user});
}

module.exports = register;
