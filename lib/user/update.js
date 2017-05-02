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
var getUser = require('./getUser');
var bcrypt = require('bcrypt');
var emailValidator = require('email-validator');
var validUrl = require('valid-url');


function update(args, callback) {

  // Update User

  // first, validate request object...

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'user', null, ['email', 'password', 'username']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var update = args.req.body.user;

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var session = status.session;
  var userDoc = status.userDoc;
  var userRecord = status.userRecord;
  var id = status.payload.id;
  var currentUsername = status.payload.username;

  // validate username

  if (update.username) {
    if (!validation.matches(update.username, /^[a-zA-Z0-9]+$/) || update.username.length > 50) {
      errors = errorHandler.add('username', "is invalid", errors);
    }
    else {
      var usernameIndex = userDoc.$(['byUsername', update.username]);
      if (update.username !== currentUsername && usernameIndex.exists) {
        errors = errorHandler.add('username', "has already been taken", errors);
      }
    }
  }

  // validate email

  var currentEmail = userRecord.$('email').value;

  if (update.email) {
    if (!emailValidator.validate(update.email) || update.email.length > 255) {
      errors = errorHandler.add('email', "is invalid", errors);
    }
    else {
      var emailIndex = userDoc.$(['byEmail', update.email]);
      if (update.email !== currentEmail && emailIndex.exists) {
        errors = errorHandler.add('email', "has already been taken", errors);
      }
    }
  }

  // validate password

  if (update.password && update.password.length < 6) {
    errors = errorHandler.add('password', "must be 6 or more characters in length", errors);
  }

  // validate bio

  if (update.bio && update.bio !== '' && update.bio.length < 255) {
    errors = errorHandler.add('bio', "must not exceed 255 characters in length", errors);
  }

  // validate image url

  if (update.image && update.image !== '' && !validUrl.isUri(update.image)) {
    errors = errorHandler.add('image', "is invalid", errors);
  }
 
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // validation OK: now start updating the user fields

  if (update.email) {
    var oldEmail = userRecord.$('email').value;
    var emailIndex = userDoc.$('byEmail');
    emailIndex.$(oldEmail).delete();
    emailIndex.$(update.email).value = id;
    userRecord.$('email').value = update.email;
  }

  if (update.username) {
    var oldUsername = userRecord.$('username').value;
    var usernameIndex = userDoc.$('byUsername');
    usernameIndex.$(oldUsername).delete();
    usernameIndex.$(update.username).value = id;
    userRecord.$('username').value = update.username;
  }

  if (update.password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(update.password, salt);
    userRecord.$('password').value = hash;
  }

  if (update.image) {
    userRecord.$('image').value = update.image;
  }

  if (update.bio) {
    userRecord.$('bio').value = update.bio;
  }

  userRecord.$('updatedAt').value = new Date().toISOString();

  // return the modified user

  var user = getUser.call(this, id, session);

  callback({user: user});
}

module.exports = update;
