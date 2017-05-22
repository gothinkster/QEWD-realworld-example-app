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

var db = {
  users: require('./users')
};


function getNextId() {
  return new this.documentStore.DocumentNode('conduitComments', ['nextId']).increment();
}

function exists(commentId) {
  return new this.documentStore.DocumentNode('conduitComments', ['byId', commentId]).exists;
}

function getAuthor(commentId) {
  return new this.documentStore.DocumentNode('conduitComments', ['byId', commentId, 'author']).value;
}

function linkComment(articleId, commentId) {

  // link a comment to its article record

  new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'comments', commentId]).value = commentId;
}

function unlinkComment(articleId, commentId) {

  // unlink a comment from its article record

  new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'comments', commentId]).delete();
}

function create(authorId, articleId, commentBody) {

  var commentsDoc = new this.documentStore.DocumentNode('conduitComments');
  var commentId = getNextId.call(this);
  var iso = new Date().toISOString();

  var comment = {
    id: commentId,
    articleId: articleId,
    body: commentBody,
    author: authorId,
    createdAt: iso,
    updatedAt: iso
  };

  new this.documentStore.DocumentNode('conduitComments', ['byId', commentId]).setDocument(comment);

  // link to article

  linkComment.call(this, articleId, commentId);
  return commentId;
}

function del(commentId, unlinkArticle) {
  if (typeof unlinkArticle === 'undefined') unlinkArticle = true;
  var commentDoc = new this.documentStore.DocumentNode('conduitComments', ['byId', commentId]);
  var articleId = commentDoc.$('articleId').value;
  commentDoc.delete();
  if (unlinkArticle) unlinkComment.call(this, articleId, commentId);
}

function get(commentId, byUserId) {
  var commentDoc = new this.documentStore.DocumentNode('conduitComments', ['byId', commentId]);
  var comment = commentDoc.getDocument(true);
  delete comment.articleId;
  var ofUserId = comment.author;
  comment.author = db.users.getProfile.call(this, ofUserId, byUserId);
  return comment;
}

function byUser(userId, articleId) {

 var comments = [];

  // get comment records for the article

  var commentsDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'comments']);
  commentsDoc.forEachChild(function(commentId) {
    var comment = get.call(this, commentId, userId);
    comments.push(comment);
  });
  return comments;
}

module.exports = {
  byUser: byUser,
  exists: exists,
  get: get,
  getAuthor: getAuthor,
  create: create,
  del: del
};
