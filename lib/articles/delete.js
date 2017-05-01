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
var getArticle = require('./getArticle');

function deleteArticle(args, callback) {

  // Delete Article

  // validate JWT

  var errors;
  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var username = status.payload.username;
  var id = status.payload.id;

  // check that the slug exists

  var slug = args.slug;
  var articleId = getArticleIdBySlug.call(this, slug);
  if (!articleId) {
    return errorHandler.notFound(callback);
  }

  //check that the user is the author

  var article = getArticle.call(this, articleId);
  if (article.author.username !== username) {
    errors = errorHandler.add('article', "not owned by author", errors);
    return errorHandler.errorResponse(errors, callback, 403);
  }

  // delete article indices

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  articlesDoc.$(['bySlug', slug]).delete();
  articlesDoc.$(['byAuthor', id, articleId]).delete();
  var ts = articlesDoc.$(['byId', articleId, 'timestampIndex']).value;
  articlesDoc.$(['byTimestamp', ts]).delete();
  if (article.tagList) {
    article.tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).delete();
    });
  }

  // delete any associated comment records

  var commentsDoc = new this.documentStore.DocumentNode('conduitComments', ['byId']);
  articlesDoc.$(['byId', articleId, 'comments']).forEachChild(function(commentId) {
    commentsDoc.$(commentId).delete();
  });

  // finally, delete article record

  articlesDoc.$(['byId', articleId]).delete();

  callback({});
}

module.exports = deleteArticle;
