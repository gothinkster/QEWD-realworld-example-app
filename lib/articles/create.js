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

  3 May 2017

*/

var validation = require('../utilities/validation');
var errorHandler = require('../utilities/errorHandler');

var db = require('../db/objects');

function create(args, callback) {

  // Create Article

  // first, validate request object...

  // check for body and optional fields

  var errors = validation.bodyAndFields(args, 'article', ['title', 'description', 'body']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  var article = args.req.body.article;

  // validate title

  if (article.title !== '' && article.title.length > 255) {
    errors = errorHandler.add('title', "must be no longer than 255 characters", errors);
  }

  // validate description

  if (article.description !== '' && article.description.length > 255) {
    errors = errorHandler.add('description', "must be no longer than 255 characters", errors);
  }

  // validate tagList

  var tagList = article.tagList;
  //if (tagList !== 'undefined' && (!Array.isArray(tagList) || tagList.length === 0)) {
  if (typeof tagList !== 'undefined' && !Array.isArray(tagList)) {
    errors = errorHandler.add('tagList', "must be an array", errors);
  }

  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var id = status.payload.id;

  // Save the article to the database

  var articleId = db.articles.create.call(this, id, article);

  // output article object

  var article = db.articles.get.call(this, articleId, id);

  callback({article: article});
}

module.exports = create;
