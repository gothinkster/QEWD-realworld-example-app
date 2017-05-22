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

  9 May 2017

*/

var slugify = require('slugify');
var db = {
  users: require('./users'),
  comments: require('./comments')
};

function getNextId() {
  return new this.documentStore.DocumentNode('conduitArticles', ['nextId']).increment();
}

function articleExists(articleId) {
  return new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId]).exists;
}

function getAuthor(articleId) {
  return new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'author']).value;
}

function slugExists(slug) {
 return new this.documentStore.DocumentNode('conduitArticles', ['bySlug', slug]).exists;
}

function createSlug(title, articleId) {
  var slug = slugify(title).toLowerCase();
  if (slugExists.call(this, slug)) {
    slug = slug + '-x' + articleId;
  }
  return slug;
}

function create(authorId, data) {

  var articleId = getNextId.call(this);

  // derive a unique slug based on title

  var slug = createSlug.call(this, data.title, articleId);

  var now = new Date();
  var iso = now.toISOString();
  // get reverse chronological index timestamp value
  var ts = 100000000000000 - now.getTime();

  var article = {
    title: data.title,
    description: data.description,
    body: data.body,
    tagList: data.tagList,
    createdAt: iso,
    updatedAt: iso,
    timestampIndex: ts,
    favoritesCount: 0,
    author: authorId,
    slug: slug
  };

  // save to database

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');

  articlesDoc.$(['byId', articleId]).setDocument(article);

  // create indices

  articlesDoc.$(['bySlug', slug]).value = articleId;
  articlesDoc.$(['byAuthor', authorId, articleId]).value = articleId;
  articlesDoc.$(['byTimestamp', ts]).value = articleId;

  if (article.tagList) {
    article.tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).value = articleId;
    });
  }
  return articleId;
}

function del(articleId) {

  var self = this;

  if (!articleExists.call(this, articleId)) return;

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  var articleDoc = articlesDoc.$(['byId', articleId]);

  // delete slug index

  var slug = articleDoc.$('slug').value;
  articlesDoc.$(['bySlug', slug]).delete();

  // delete author index

  var authorId = getAuthor.call(this, articleId);
  articlesDoc.$(['byAuthor', authorId, articleId]).delete();

  // delete timestamp index

  var ts = articleDoc.$('timestampIndex').value;
  articlesDoc.$(['byTimestamp', ts]).delete();

  // delete tagList indices

  var tagList = articleDoc.$('tagList').getDocument(true);
  if (tagList && Array.isArray(tagList)) {
    tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).delete();
    });
  }

  // delete any associated comment records

  articleDoc.$('comments').forEachChild(function(commentId) {
    db.comments.del.call(self, commentId, false);
  });

  // finally, delete article record

  articleDoc.delete();
}

function getTags() {
  var tags = [];
  var tagsDoc = new this.documentStore.DocumentNode('conduitArticles', ['byTag']);
  tagsDoc.forEachChild(function(tag) {
    tags.push(tag);
  });
  return tags;
}

function getIdBySlug(slug) {
  var slugIndex = new this.documentStore.DocumentNode('conduitArticles', ['bySlug', slug]);
  if (!slugIndex.exists) {
    return false;
  }
  return slugIndex.value;
}

function getFeed(userId, offset, max) {

  var followsDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'follows']);
  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  var articlesAuthorIndex = articlesDoc.$('byAuthor');
  var self = this;

  // use a temporary global storage document for easy sorting by timestamp
  var tempDoc = new this.documentStore.DocumentNode('conduitTemp', [process.pid]);
  tempDoc.delete();  // clear down just in case

  // get articles written by user's followed users
  var skipped = 0;
  var count = 0;
  followsDoc.forEachChild(function(followsId) {
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

  var articles = [];
  tempDoc.forEachChild(function(ts, childNode) {
    var article = get.call(self, childNode.value, userId);
    articles.push(article);
  });

  tempDoc.delete();  // we're done with the temporary document, so delete it

  return {
    articles: articles,
    articlesCount: count
  };
}

function get(articleId, byUserId) {
  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId]);
  var article = articlesDoc.getDocument(true);
  if (!article.tagList) article.tagList = [];
  delete article.timestampIndex;
  delete article.comments;
  article.favorited = db.users.favorited.call(this, byUserId, articleId);
  article.author = db.users.getProfile.call(this, article.author, byUserId);
  article.favoritesCount = parseInt(article.favoritesCount);
  return article;
}

function byAuthor(username, byUserId, offset, max) {
  var userId = db.users.idByUsername.call(this, username);
  if (userId === '') return {error: 'notFound'};

  // use a temporary global storage document for easy sorting by timestamp
  var tempDoc = new this.documentStore.DocumentNode('conduitTemp', [process.pid]);
  tempDoc.delete();  // clear down just in case

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');

  var skipped = 0;
  var count = 0;
  articlesDoc.$(['byAuthor', userId]).forEachChild(function(articleId) {
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

  // now spin through the temporary document to pull out articles latest first
  var articles = [];
  var self = this;

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      var article = get.call(self, childNode.value, byUserId);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return {
    articles: articles,
    articlesCount: count
  };
}

function byTag(tag, byUserId, offset, max) {

  // use a temporary global storage document for easy sorting by timestamp
  var tempDoc = new this.documentStore.DocumentNode('conduitTemp', [process.pid]);
  tempDoc.delete();  // clear down just in case

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');

  var skipped = 0;
  var count = 0;
  articlesDoc.$(['byTag', tag]).forEachChild(function(articleId) {
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

  // now spin through the temporary document to pull out articles latest first
  var articles = [];
  var self = this;

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      var article = get.call(self, childNode.value, byUserId);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return {
    articles: articles,
    articlesCount: count
  };
}

function favoritedBy(username, byUserId, offset, max) {

  var userId = db.users.idByUsername.call(this, username);
  if (userId === '') return {error: 'notFound'};

  // use a temporary global storage document for easy sorting by timestamp
  var tempDoc = new this.documentStore.DocumentNode('conduitTemp', [process.pid]);
  tempDoc.delete();  // clear down just in case

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  var favDoc = new this.documentStore.DocumentNode('conduitUsers', ['byId', userId, 'favorited']);


  var skipped = 0;
  var count = 0;
  favDoc.forEachChild(function(articleId) {
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

  // now spin through the temporary document to pull out articles latest first
  var articles = [];
  var self = this;

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      var article = get.call(self, childNode.value, byUserId);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return {
    articles: articles,
    articlesCount: count
  };
}

function latest(byUserId, offset, max) {

  var skipped = 0;
  var count = 0;
  var self = this;
  var articles = [];

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');

  articlesDoc.$('byTimestamp').forEachChild(function(ts, childNode) {
    if (offset > 0 && skipped < offset) {
      skipped++;
    }
    else {
      var articleId = childNode.value;
      var article = get.call(this, articleId, byUserId);
      articles.push(article);
      count++;
      if (count === max) return true;
    }
  });

  return {
    articles: articles,
    articlesCount: count
  };

}

function update(articleId, userId, newData) {

  var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
  var articleDoc = articlesDoc.$(['byId', articleId]);

  var article = articleDoc.getDocument(true);

  var currentTitle = article.title;
  var currentSlug = article.slug;
  var newTitle = newData.title;

  // If title has changed, then update the slug index

  if (newTitle && newTitle !== currentTitle) {
    // remove the old slug index
    articlesDoc.$(['bySlug', currentSlug]).delete();
    //create and index a new slug

    var newSlug = createSlug.call(this, newTitle, articleId);

    articlesDoc.$(['bySlug', newSlug]).value = articleId;
    article.slug = newSlug;
    article.title = newTitle;
  }

  if (newData.description) article.description = newData.description;
  if (newData.body) article.body = newData.body;

  //update time stamp and reverse timestamp index

  var now = new Date();
  article.updatedAt = now.toISOString();

  // delete old index
  var ts = article.timestampIndex;
  articlesDoc.$(['byTimestamp', ts]).delete();
  // create new index
  ts = 100000000000000 - now.getTime();
  articlesDoc.$(['byTimestamp', ts]).value = articleId;
  article.timestampIndex = ts;

  //update tags

  if (newData.tagList) {
    // remove the current tags from the index
    if (article.tagList) {
      article.tagList.forEach(function(tag) {
        articlesDoc.$(['byTag', tag, articleId]).delete();
      });
    }

    // now update tags in article and create new taglist index

    article.tagList = newData.tagList;
    newData.tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).value = articleId;
    });
  }

  // update main article database record

  articleDoc.setDocument(article);
}

module.exports = {
  byAuthor: byAuthor,
  byTag: byTag,
  get: get,
  create: create,
  del: del,
  update: update,
  favoritedBy: favoritedBy,
  getAuthor: getAuthor,
  getIdBySlug: getIdBySlug,
  getTags: getTags,
  latest: latest,
  getFeed: getFeed
};
