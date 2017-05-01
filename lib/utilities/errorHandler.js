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

function isEmptyObject(obj) {
  for (var name in obj) {
    return false;
  }
  return true;
}

function init() {
  return {
    errors: {}
  };
}

function add(type, text, errorObj) {
  if (!errorObj || !errorObj.errors) errorObj = init();
  if (!errorObj.errors[type]) errorObj.errors[type] = [];
  errorObj.errors[type].push(text);
  return errorObj;
}

function hasErrors(errorObj) {
  if (isEmptyObject(errorObj.errors)) return false; // no errors
  return true;
}

function errorResponse(errorObj, callback, statusCode) {
  var statusCode = statusCode || '422';
  callback({
    error: {
      response: errorObj
    },
    status: {
      code: statusCode
    }
  });
}

function notFound(callback) {
  callback({
    error: 'Not Found',
    status: {
      code: '404'
    }
  });
}

module.exports = {
  init, 
  add,
  hasErrors,
  errorResponse,
  notFound
};


