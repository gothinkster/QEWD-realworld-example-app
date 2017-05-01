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
var getArticle = require('./getArticle');
var slugify = require('slugify');

function create(args, callback) {

  // Create Article

  // first, validate request object...

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'article', ['title', 'description', 'body']);
  var article = args.req.body.article;
  var tagList = article.tagList;
  if (tagList !== 'undefined' && (!Array.isArray(tagList) || tagList.length === 0)) {
    errors = errorHandler.add('tagList', "must be an array with at least 1 element", errors);
  }
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var id = status.payload.id;

  // create article object

  var slug = slugify(article.title).toLowerCase();
  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  var articleId = articlesDoc.$('nextId').increment();

  if (articlesDoc.$(['bySlug', slug]).exists) {
    slug = slug + '-x' + articleId;
  }

  var now = new Date();
  var iso = now.toISOString();
  var ts = 100000000000000 - now.getTime();
  article.createdAt = iso;
  article.updatedAt = iso;
  article.timestampIndex = ts;
  article.favoritesCount = 0;
  article.author = id;
  article.slug = slug;

  // save to database and save indices

  articlesDoc.$(['byId', articleId]).setDocument(article);
  articlesDoc.$(['bySlug', slug]).value = articleId;
  articlesDoc.$(['byAuthor', id, articleId]).value = articleId;
  articlesDoc.$(['byTimestamp', ts]).value = articleId;

  if (article.tagList) {
    article.tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).value = articleId;
    });
  }

  // output article object

  var article = getArticle.call(this, articleId, id);

  callback({article: article});
}

module.exports = create;
