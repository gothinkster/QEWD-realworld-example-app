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
var getArticle = require('./getArticle');

function feed(args, callback) {

  // validate JWT

  var errors;
  var status = validation.jwt.call(this, args);
  if (status.error) return callback(status);
  var usersDoc = status.userDoc;
  var userRecord = status.userRecord;
  var id = status.payload.id;

  var articles = [];
  var max = 20;
  if (args.req.query.limit) max = parseInt(args.req.query.limit);
  var offset = 0;
  if (args.req.query.offset) offset = parseInt(args.req.query.offset);
  var count = 0;
  var skipped = 0;
  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  var articlesAuthorIndex = articlesDoc.$('byAuthor');
  var self = this;

  // use a temporary global storage document for easy sorting by timestamp
  var tempDoc = new this.documentStore.DocumentNode('conduitTemp', [process.pid]);
  tempDoc.delete();  // clear down just in case

  // get articles written by user's followed users

  userRecord.$('follows').forEachChild(function(followsId) {
    articlesAuthorIndex.$(followsId).forEachChild(function(articleId) {
      if (offset > 0 && skipped < offset) {
        skipped++;
      }
      else {
        var ts = articlesDoc.$(['byId', articleId, 'timestampIndex']).value;
         // add to temporary index by reverse timestamp
        tempDoc.$(ts).value = articleId;
        count++;
        if (count === max) return true;
      }
    });
  });

  // now spin through the temporary document to pull out articles latest first

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      var article = getArticle.call(self, childNode.value, id);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return callback({
    articles: articles,
    articlesCount: count
  });
}

module.exports = feed;
