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
var getUser = require('./getUser');
var bcrypt = require('bcrypt');

function update(args, callback) {

  // Update User

  // first, validate request object...

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'user', null, ['email', 'password', 'username', 'image', 'bio']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var update = args.req.body.user;

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var session = status.session;
  var userDoc = status.userDoc;
  var userRecord = status.userRecord;
  var id = status.payload.id;
 
  // now start updating the user fields

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
