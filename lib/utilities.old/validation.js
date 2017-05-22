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

var errorHandler = require('./errorHandler');

function isEmptyObject(obj) {
  for (var name in obj) {
    return false;
  }
  return true;
}

function authenticate(args) {
  var auth = args.req.headers.authorization;
  if (!auth || auth === '') {
    return {
      error: 'Missing authorization',
      response: '',
      status: {
        code: '401'
      }
    };
  }

  var jwtToken = auth.split('Token ')[1];
  if (!jwtToken || jwtToken === '') {
    return {
      error: 'Missing JWT',
      response: '',
      status: {
        code: '401'
      }
    };
  }

  return this.sessions.authenticateByJWT(jwtToken);
}

function bodyAndFields(args, category, requiredFields, optionalFields) {
  var errors = errorHandler.init();
  var body = args.req.body;

  if (isEmptyObject(body) || isEmptyObject(body[category])) {
    errors = errorHandler.add('body', "can't be empty", errors);
    return errors;
  }

  if (requiredFields && Array.isArray(requiredFields) && requiredFields.length > 0) {
    requiredFields.forEach(function(field) {
      if (typeof body[category][field] === 'undefined' || body[category][field] === null) {
        errors = errorHandler.add(field, "must be defined", errors);
      }
      else {
        if (body[category][field] === '') errors = errorHandler.add(field, "can't be empty", errors);
      }
    });
  }
  if (optionalFields && Array.isArray(optionalFields) && optionalFields.length > 0) {
    var noFields = true;
    optionalFields.forEach(function(field) {
      if (typeof body[category][field] !== 'undefined') {
        noFields = false;
        if (body[category][field] === '') {
          errors = errorHandler.add(field, "can't be blank", errors);
        }
      }
    });
    if (noFields) {
      errors = errorHandler.add('body', "doesn't contain any of the expected fields", errors);
    }
  }
  return errors;
}

function jwt(args, optional) {
  // validate JWT, and if OK, return session, payload and pointers to user document and user's specific document

  var status = authenticate.call(this, args);
  if (status.error) return status;

  var payload = status.payload;
  var session = status.session;

  // get the user id from the JWT payload

  var id = payload.id;
  if (id === '') {
    return {
      error: 'Unable to identify current user',
      status: {
        code: '403'
      }
    };
  }

  var userDoc = new this.documentStore.DocumentNode('conduitUsers');
  var userRecord = userDoc.$(['byId', id]);
  if (!userRecord.exists) {
    return {
      error: 'Unable to identify current user (2)',
      status: {
        code: '403'
      }
    };
  }
  
  return {
    payload: payload,
    session: session,
    userDoc: userDoc,
    userRecord: userRecord
  };
}

function matches(string, pattern) {
  var regx = new RegExp(pattern);
  return regx.test(string);
}

module.exports = {
  isEmptyObject,
  authenticate,
  bodyAndFields,
  jwt,
  matches
};
