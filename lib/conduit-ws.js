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

  20 May 2017

*/

var ws_handlers = {
  'users.register':       require('./ws/users/register'),
  'users.login':          require('./ws/users/login'),

  'user.update':          require('./ws/user/update'),
  'user.get':             require('./ws/user/get'),

  'tags.get':             require('./ws/tags/get'),

  'articles.create':      require('./ws/articles/create'),
  'articles.update':      require('./ws/articles/update'),
  'articles.byAuthor':    require('./ws/articles/byAuthor'),
  'articles.byTag':       require('./ws/articles/byTag'),
  'articles.favoritedBy': require('./ws/articles/favoritedBy'),
  'articles.del':         require('./ws/articles/del'),
  'articles.get':         require('./ws/articles/get'),
  'articles.list':        require('./ws/articles/list'),
  'articles.feed':        require('./ws/articles/feed'),
  'articles.favorite':    require('./ws/articles/favorite'),
  'articles.unfavorite':  require('./ws/articles/unfavorite'),

  'comments.create':      require('./ws/comments/create'),
  'comments.del':         require('./ws/comments/del'),
  'comments.forArticle':  require('./ws/comments/forArticle'),

  'profile.follow':       require('./ws/profile/follow'),
  'profile.unfollow':     require('./ws/profile/unfollow'),
  'profile.get':          require('./ws/profile/get')
};

module.exports = {

  // map these handlers into the main conduit.js module

  init: function(application) {
    for (var name in ws_handlers) {
      this.handlers[application][name] = ws_handlers[name];
    }
  }
};


