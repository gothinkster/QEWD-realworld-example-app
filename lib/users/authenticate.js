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
var bcrypt = require('bcrypt');
var emailValidator = require('email-validator');

function authenticate(args, callback) {
  // validate request object...

  // check for body and required fields

  var errors = validation.bodyAndFields(args, 'user', ['email', 'password']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var email = args.req.body.user.email;
  var password = args.req.body.user.password;

  if (!emailValidator.validate(email) || email.length > 255) {
    errors = errorHandler.add('email', "is invalid", errors);
  }
  if (password.length < 6) {
    errors = errorHandler.add('password', "must be 6 or more characters in length", errors);
  }
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);


  // check if email exists

  var userDoc = new this.documentStore.DocumentNode('conduitUsers');
  var emailIndex = userDoc.$(['byEmail', email]);
  if (!emailIndex.exists) {
    errors = errorHandler.add('email or password', "is invalid", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  var id = emailIndex.value;
  var user = userDoc.$(['byId', id]).getDocument();
  var hash = user.password;
  var match = bcrypt.compareSync(password, hash);
  if (!match) {
    errors = errorHandler.add('email or password', "is invalid", errors);
    return errorHandler.errorResponse(errors, callback);
  }

  // start a new QEWD session and return a JavaScript Web Token

  var session = this.sessions.create({
    application: 'conduit',
    timeout: 5184000, // 60 days timeout !! as advised by RealWorld team for now
    jwtPayload: {
      id: id,
      username: user.username
    }
  });
  session.authenticated = true;
  user.token = session.jwt;

  // all done - return the registered user object, but leave off the password

  delete user.password;
  delete user.follows;

  callback({user: user});
}

module.exports = authenticate;
