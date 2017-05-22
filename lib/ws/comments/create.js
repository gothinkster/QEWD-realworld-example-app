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

  var body = messageObj.params.comment.body;
  if (typeof body === 'undefined' || body === '') {
    errors = errorHandler.add('body', "can't be blank", errors);
  }

  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, finished);

  var userId = session.data.$('id').value;

  // if slug exists, get pointer to article

  var slug = messageObj.params.slug;
  var articleId = db.articles.getIdBySlug.call(this, slug);
  if (!articleId) {
    return errorHandler.notFound(finished);
  }

  // create comment database record

  var commentId = db.comments.create.call(this, userId, articleId, body);

  // fetch and return the comment document, with author profile

  var comment = db.comments.get.call(this, commentId, userId);
  finished({comment: comment});
};
