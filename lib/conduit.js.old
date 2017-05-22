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


Main Worker Entry Point: Routes incoming Conduit
requests to the appropriate handler module

*/

var router = require('qewd-router');

var users = require('./users/endpoints');
var user = require('./user/endpoints');
var profiles = require('./profiles/endpoints');
var articles = require('./articles/endpoints');
var tags = require('./tags/endpoints');

var routes;

module.exports = {

  restModule: true,

  init: function(application) {

    this.setCustomErrorResponse.call(this, {
      application: application,
      errorType: 'noTypeHandler',
      text: 'Resource Not Found',
      statusCode: '404'
    });

    routes = [
      {
        url: '/api/users/login',
        method: 'POST',    
        handler: users.authenticate
      },
      {
        url: '/api/users',
        method: 'POST',
        handler: users.register
      },
      {
        url: '/api/user',
        method: 'GET',
        handler: user.get
      },
      {
        url: '/api/user',
        method: 'PUT',
        handler: user.update
      },
      {
        url: '/api/profiles/:username',
        method: 'GET',
        handler: profiles.get
      },
      {
        url: '/api/profiles/:username/follow',
        method: 'POST',
        handler: profiles.follow
      },
      {
        url: '/api/profiles/:username/follow',
        method: 'DELETE',
        handler: profiles.unfollow
      },
      {
        url: '/api/articles',
        method: 'GET',
        handler: articles.list
      },
      {
        url: '/api/articles/feed',
        method: 'GET',
        handler: articles.feed
      },
      {
        url: '/api/articles/:slug',
        method: 'GET',
        handler: articles.get
      },
      {
        url: '/api/articles',
        method: 'POST',
        handler: articles.create
      },
      {
        url: '/api/articles/:slug',
        method: 'PUT',
        handler: articles.update
      },
      {
        url: '/api/articles/:slug',
        method: 'DELETE',
        handler: articles.delete
      },
      {
        url: '/api/articles/:slug/comments',
        method: 'POST',
        handler: articles.addComments
      },
      {
        url: '/api/articles/:slug/comments',
        method: 'GET',
        handler: articles.getComments
      },
      {
        url: '/api/articles/:slug/comments/:id',
        method: 'DELETE',
        handler: articles.deleteComment
      },
      {
        url: '/api/articles/:slug/favorite',
        method: 'POST',
        handler: articles.favourite
      },
      {
        url: '/api/articles/:slug/favorite',
        method: 'DELETE',
        handler: articles.unfavourite
      },
      {
        url: '/api/tags',
        method: 'GET',
        handler: tags.get
      }
    ];
    routes = router.initialise(routes);
    router.setErrorResponse(404, 'Not Found');
  },

  handlers: {
    users: function(messageObj, finished) {
      router.route.call(this, messageObj, finished, routes);
    },
    user: function(messageObj, finished) {
      router.route.call(this, messageObj, finished, routes);
    },
    profiles: function(messageObj, finished) {
      router.route.call(this, messageObj, finished, routes);
    },
    articles: function(messageObj, finished) {
      router.route.call(this, messageObj, finished, routes);
    },
    tags: function(messageObj, finished) {
      router.route.call(this, messageObj, finished, routes);
    }
  }
};


