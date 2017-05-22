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

function list(args, callback) {

  // optional authorization

  var byUserId;
  if (args.req.headers.authorization) {
    var status = validation.jwt.call(this, args);
    if (status.error) return callback(status);
    byUserId = status.payload.id;
  }

  var max = 20;
  if (args.req.query.limit) max = parseInt(args.req.query.limit);
  var offset = 0;
  if (args.req.query.offset) offset = parseInt(args.req.query.offset);

  // if no query string, list up to 20 most recent articles

  if (args.req.query.author) {
    var results = db.articles.byAuthor.call(this, args.req.query.author, byUserId, offset, max);
    return callback(results);
  }

  if (args.req.query.tag) {
    var results = db.articles.byTag.call(this, args.req.query.tag, byUserId, offset, max);
    return callback(results);
  }

  if (args.req.query.favorited) {
    var results = db.articles.favoritedBy.call(this, args.req.query.favorited, byUserId, offset, max);
    return callback(results);
  }

  // otherwise get latest articles for any author

  var results = db.articles.latest.call(this, byUserId, offset, max);
  return callback(results);

}

module.exports = list;
