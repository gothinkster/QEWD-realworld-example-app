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

var db = require('../db/objects');

function getUser(id, session) {

  var user = db.users.get.call(this, id);  // get raw User object

  if (!session) {
    // create a new Session
    session = this.sessions.create({
      application: 'conduit',
      timeout: 5184000, // 60 days timeout !! as advised by RealWorld team for now
      jwtPayload: {
        id: id,
        username: user.username
      }
    });
    session.authenticated = true;
    user.token = session.jwt;
  }
  else {

    //console.log('***!!! getUser: session = ' + session.id + '; JWT = ' + session.jwt);
    var payload;
    if (session.jwt === '') {
      payload = {
        id: id,
        username: user.username
      };
      user.token = session.createJWT(payload);
    }
    else {
      // make sure the JWT uses the most recent username
      payload = {username: user.username};
      user.token = session.updateJWT(payload);
    }
  }
  delete user.password;
  delete user.follows;
  return user;
}

module.exports = getUser;
