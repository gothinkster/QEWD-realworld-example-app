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
var getArticleIdBySlug = require('./getArticleIdBySlug');
var getComment = require('./getComment');

function getComments(args, callback) {

  // check optional authentication

  var auth = false;
  var byId;
  if (args.req.headers.authorization) {
    var status = validation.jwt.call(this, args);
    if (status.error) return callback(status);
    byId = status.payload.id;
    auth = true;
  }

  // get pointer to article from slug

  var articleId = getArticleIdBySlug.call(this, args.slug);
  if (!articleId) {
    return errorHandler.notFound(callback);
  }

  var comments = [];

  // get comment records for the article

  var articleDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'comments']);
  articleDoc.forEachChild(function(commentId) {
    var comment = getComment.call(this, commentId, byId);
    comments.push(comment);
  });

  callback({comments: comments});
}

module.exports = getComments;
