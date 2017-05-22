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
  var max = messageObj.params.limit;
  if (!max || max === '') max = 20;
  var offset = messageObj.params.offset;
  if (!offset || offset === '') offset = 0;
  var userId = session.data.$('id').value;
  if (userId === '') userId = null;
  var author = messageObj.params.author;
  var articles = db.articles.favoritedBy.call(this, author, userId, offset, max);
  if (articles.error) {
    return errorHandler.errorResponse(articles.error, finished);
  }
  finished(articles);
};
