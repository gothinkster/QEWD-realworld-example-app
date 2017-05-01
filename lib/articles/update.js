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
var slugify = require('slugify');

function update(args, callback) {
  // Update Article

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'article', null, ['title', 'description', 'body']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // validate JWT

  var errors;
  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var username = status.payload.username;
  var id = status.payload.id;

  // check that slug exists

  var slug = args.slug;
  var articleId = getArticleIdBySlug.call(this, slug);
  if (!articleId) {
    return errorHandler.notFound(callback);
  }

  // check that user is the author

  var article = getArticle.call(this, articleId);
  if (article.author.username !== username) {
    errors = errorHandler.add('article', "not owned by author", errors);
    return errorHandler.errorResponse(errors, callback, 403);
  }

  // update the article

  article.author = id;

  var request = args.req.body.article;

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');

  if (request.title && request.title !== article.title) {
    // remove the old slug index
    articlesDoc.$(['bySlug', slug]).delete();
    //create and index a new slug
    var newSlug = slugify(request.title).toLowerCase();
    if (articlesDoc.$(['bySlug', newSlug]).exists) {
      newSlug = newSlug + '-x' + articleId;
    }
    articlesDoc.$(['bySlug', newSlug]).value = articleId;
    article.slug = newSlug;
    article.title = request.title;
  }

  if (request.description) article.description = request.description;
  if (request.body) article.body = request.body;

  var articleDoc = articlesDoc.$(['byId', articleId]);

  //update time stamp and reverse timestamp index

  var now = new Date();
  article.updatedAt = now.toISOString();

  var ts = articleDoc.$('timestampIndex').value;
  articlesDoc.$(['byTimestamp', ts]).delete();
  ts = 100000000000000 - now.getTime();
  articlesDoc.$(['byTimestamp', ts]).value = articleId;
  article.timestampIndex = ts;

  // update main article database record

  articlesDoc.$(['byId', articleId]).setDocument(article);

  // output updated article object

  var article = getArticle.call(this, articleId, id);

  callback({article: article});
}

module.exports = update;
