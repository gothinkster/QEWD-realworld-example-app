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

function getProfile(ofId, byId) {

  var usersDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId']);
  var ofUserDoc = usersDoc.$(ofId);
  if (!ofUserDoc.exists) {
    return {error: 'User whose profile is being requested does not exist'};
  }
  var byUserDoc;
  if (byId) {
    byUserDoc = usersDoc.$(byId);
    if (!byUserDoc.exists) {
      return {error: 'User requesting profile does not exist'};
    }
  }

  var profile = {
    username: ofUserDoc.$('username').value,
    bio: ofUserDoc.$('bio').value,
    image: ofUserDoc.$('image').value,
    following: false
  };

  if (byId) {
    if (byUserDoc.$(['follows', ofId]).exists) {
      profile.following = true;
    }
  }
  return profile;
}

module.exports = getProfile;
