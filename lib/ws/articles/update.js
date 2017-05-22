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

  19 May 2017

*/

var errorHandler = require('../../utilities/errorHandler');
var db = require('../../db/objects');

module.exports = function(messageObj, session, send, finished) {

  var errors = {};

  var title = messageObj.params.title;
  var description = messageObj.params.description;
  var body = messageObj.params.body;

  // validate title

  if (typeof title  !== 'undefined' && title.length > 255) {
    errors = errorHandler.add('title', "must be no longer than 255 characters", errors);
  }

  // validate description

  if (typeof description  !== 'undefined' && description.length > 255) {
    errors = errorHandler.add('description', "must be no longer than 255 characters", errors);
  }

  // validate tagList

  var tagList = messageObj.params.tagList;
  if (typeof tagList !== 'undefined' && !Array.isArray(tagList)) {
    errors = errorHandler.add('tagList', "must be an array", errors);
  }

  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, finished);

  var userId = session.data.$('id').value;

  // check that slug exists

  var articleId = db.articles.getIdBySlug.call(this, messageObj.params.slug);
  if (!articleId) {
    // no article with that slug
    return errorHandler.notFound(finished);
  }

  // check that user is the author

  if (userId !== db.articles.getAuthor.call(this, articleId)) {
    errors = errorHandler.add('article', "not owned by author", errors);
    return errorHandler.errorResponse(errors, finished, 403);
  }

  db.articles.update.call(this, articleId, userId, messageObj.params);

  // output article object

  var article = db.articles.get.call(this, articleId, userId);

  finished({article: article});
};
