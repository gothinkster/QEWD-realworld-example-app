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

  9 May 2017

*/

var bcrypt = require('bcrypt');

function exists(id) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byId', id]).exists;
}

function emailExists(email) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byEmail', email]).exists;
}

function getEmail(id) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byId', id, 'email']).value;
}

function changeEmail(id, newEmail) {
  var oldEmail = getEmail.call(this, id);
  var usersDoc = new this.documentStore.DocumentNode('conduitUsers');
  var emailIndex = usersDoc.$('byEmail');
  emailIndex.$(oldEmail).delete();
  emailIndex.$(newEmail).value = id;
  usersDoc.$(['byId', id, 'email']).value = newEmail;
}

function usernameExists(username) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byUsername', username]).exists;
}

function idByUsername(username) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byUsername', username]).value;
}

function changeUsername(id, newUsername) {
  var usersDoc = new this.documentStore.DocumentNode('conduitUsers');
  var usernameIndex = usersDoc.$('byUsername');
  var usernameNode = usersDoc.$(['byId', id, 'username']);

  usernameIndex.$(usernameNode.value).delete();
  usernameIndex.$(newUsername).value = id;
  usernameNode.value = newUsername;
}

function getUsername(id) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byId', id, 'username']).value;
}

function idByEmail(email) {
  if (emailExists.call(this, email)) {
    return new this.documentStore.DocumentNode('conduitUsers', ['byEmail', email]).value;
  }
  else {
    return false;
  }
}

function authenticate(email, password) {
  if (emailExists.call(this, email)) {
    var id = idByEmail.call(this, email);
    var hash = new this.documentStore.DocumentNode('conduitUsers', ['byId', id, 'password']).value;
    return bcrypt.compareSync(password, hash);
  }
  else {
    return false;
  }
}

function get(id) {
  var userDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId', id]);
  if (!userDoc.exists) return false;
  return userDoc.getDocument();
}

function getNextId() {
  return new this.documentStore.DocumentNode('conduitUsers', ['nextId']).increment();
}

function create(user) {

  /*
     user: {
       username,
       email,
       password
     }
  */

  var id = getNextId.call(this);
  user.id = id;
  var now = new Date().toISOString();
  user.createdAt = now;
  user.updatedAt = now

  var salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);

  user.bio = '';
  user.image = '';

  var usersDoc = new this.documentStore.DocumentNode('conduitUsers');

  usersDoc.$(['byId', id]).setDocument(user);
  usersDoc.$(['byUsername', user.username]).value = id;
  usersDoc.$(['byEmail', user.email]).value = id;
  return id;
}

function update(id, newData) {

  if (!exists.call(this, id)) return false;

  if (newData.email) changeEmail.call(this, id, newData.email);
  if (newData.username) changeUsername.call(this, id, newData.username);

  var userDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId', id]);

  if (newData.password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(newData.password, salt);
    userDoc.$('password').value = hash;
  }

  if (newData.image) {
    userDoc.$('image').value = newData.image;
  }

  if (newData.bio) {
    userDoc.$('bio').value = newData.bio;
  }

  userDoc.$('updatedAt').value = new Date().toISOString();
  return true;
}

function favorited(userId, articleId) {
  return new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'favorited', articleId]).exists;
}

function favorite(userId, articleId) {
  var favoritedDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'favorited', articleId]);
  var favoriteCountDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'favoritesCount']);
  favoritedDoc.value = articleId;
  favoriteCountDoc.increment();
}

function unfavorite(userId, articleId) {
  var favoritedDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'favorited', articleId]);
  var favoriteCountDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'favoritesCount']);
  favoritedDoc.delete();
  var count = favoriteCountDoc.value - 1;
  if (count < 0) count = 0; // just in case
  favoriteCountDoc.value = count;
}

function getProfile(ofUserId, byUserId) {

  var usersDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId']);
  var ofUserDoc = usersDoc.$(ofUserId);
  if (!ofUserDoc.exists) {
    return {error: 'User whose profile is being requested does not exist'};
  }
  var byUserDoc;
  if (byUserId) {
    byUserDoc = usersDoc.$(byUserId);
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

  if (byUserId) {
    if (byUserDoc.$(['follows', ofUserId]).exists) {
      profile.following = true;
    }
  }
  return profile;
}

function follows(userId, usernameToFollow) {
  var idToFollow = idByUsername.call(this, usernameToFollow);
  return new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'follows', idToFollow]).exists;
}

function follow(userId, usernameToFollow) {
  var idToFollow = idByUsername.call(this, usernameToFollow);
  new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'follows', idToFollow]).value = idToFollow;

  // get profile data from the id to be followed

  return getProfile.call(this, idToFollow, userId);
}

function unfollow(userId, usernameToUnfollow) {
  var idToUnfollow = idByUsername.call(this, usernameToUnfollow);
  new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'follows', idToUnfollow]).delete();

  // get profile data from the id to be followed

  return getProfile.call(this, idToUnfollow, userId);
}


module.exports = {
  emailExists,
  getEmail,
  usernameExists,
  authenticate,
  exists,
  idByEmail,
  get,
  getNextId,
  getProfile,
  getUsername,
  idByUsername,
  create,
  update,
  favorited,
  favorite,
  unfavorite,
  follows,
  follow,
  unfollow
};
