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

var db = require('../db/objects');

function addComments(args, callback) {

  // Add comment to an article

  // first, validate request object...

  // check for requuest body and required field ('body')

  var errors = validation.bodyAndFields(args, 'comment', ['body']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, callback);

  // validate JWT and if OK, get the user database pointer

  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var id = status.payload.id;

  // if slug exists, get pointer to article

  var slug = args.slug;
  var articleId = db.articles.getIdBySlug.call(this, slug);
  if (!articleId) {
    return errorHandler.notFound(callback);
  }

  // create comment database record

  var commentId = db.comments.create.call(this, id, articleId, args.req.body.comment.body);

  // fetch and return the comment document, with author profile

  var comment = db.comments.get.call(this, commentId, id);
  callback({comment: comment});
}

module.exports = addComments;
