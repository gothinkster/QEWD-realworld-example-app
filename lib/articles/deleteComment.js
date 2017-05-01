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

function deleteComment(args, callback) {

  // Delete Comment

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var id = status.payload.id;

  // if slug exists, get pointer to article

  var slug = args.slug;
  var articleId = getArticleIdBySlug.call(this, slug);
  if (!articleId) {
    // no article with that slug
    return errorHandler.notFound(callback);
  }

  // next get the pointer to the comment within that article

  var commentId = args.id;

  var articleCommentDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'comments', commentId]);
  if (!articleCommentDoc.exists) {
    // no comment with that Id in the article
    return errorHandler.notFound(callback);
  }

  // is the current user the author of the comment?

  if (articleCommentDoc.$('author').value !== id) {
    errors = errorHandler.add('comment', "not owned by author", errors);
    return errorHandler.errorResponse(errors, callback, 403);
  }

  // ok, delete the comment

  var commentDoc = new this.documentStore.DocumentNode('conduitComments', ['byId', commentId]);
  commentDoc.delete();

  // and delete the reference to it in the article

  articleCommentDoc.delete();

  // that's it done!

  callback({});
}

module.exports = deleteComment;
