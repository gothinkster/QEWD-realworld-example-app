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
var bcrypt = require('bcrypt');

function register(args, callback) {

  // validate request object...

  // check for body and required fields

  var errors = validation.bodyAndFields(args, 'user', ['username', 'email', 'password']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // check if username or password already exists

  var userDoc = new this.documentStore.DocumentNode('conduitUsers');

  var body = args.req.body;
  var username = body.user.username;
  var usernameIndex = userDoc.$(['byUsername', username]);

  if (usernameIndex.exists) {
    errors = errorHandler.add('username', "has already been taken", errors);
  }
  var email = body.user.email;
  var emailIndex = userDoc.$(['byEmail', email]);

  if (emailIndex.exists) {
    errors = errorHandler.add('email', "has already been taken", errors);
  }
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // validation OK - register the new user

  var id = userDoc.$('nextId').increment();
  var now = new Date().toISOString();

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(body.user.password, salt);

  var user = {
    id: id,
    email: email,
    createdAt: now,
    updatedAt: now,
    username: username,
    password: hash,
    bio: '',
    image: ''
  };

  // save to database
  userDoc.$(['byId', id]).setDocument(user);
  usernameIndex.value = id;
  emailIndex.value = id;

  // start a new QEWD session and return a JavaScript Web Token

  var session = this.sessions.create({
    application: 'conduit',
    timeout: 600, // 10 minutes timeout
    jwtPayload: {
      id: id,
      username: username
    }
  });
  session.authenticated = true;
  user.token = session.jwt;

  // save user id into session

  session.data.$(['conduit', 'userId']).value = id;

  // all done - return the registered user object, but leave off the password

  delete user.password;
  callback({user: user});
}

module.exports = register;
