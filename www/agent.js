import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';


const superagent = superagentPromise(_superagent, global.Promise);

//const API_ROOT = 'https://conduit.productionready.io/api';

const API_ROOT = 'http://178.62.26.29:8080/api';

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
  if (token) {
    req.set('authorization', `Token ${token}`);
  }
}

var qewd;

//qewdMessage({type: 'test'}).then(responseObj => responseObj.message);

const Promise = global.Promise;

const responseMessage = responseObj => {
  console.log('*** responseMessage for ' + responseObj.type + '; token = ' + token);
  if (responseObj.message.error && responseObj.message.error.response) return responseObj.message.error.response;
  return responseObj.message;
};

function qewdMessage(payload) {
  return new Promise(function(resolve, reject) {
    qewd.send(payload, function(responseObj) {
      if (responseObj.message.error) {
        console.log('**** error ' + JSON.stringify(responseObj));

        if (responseObj.type === 'user.get' && responseObj.message.error.response && responseObj.message.error.response.errors && responseObj.message.error.response.errors.user && responseObj.message.error.response.errors.user[0] === 'You must be logged in') {
          // JWT is out of sync with QEWD Session - log the user out and reload

         window.localStorage.setItem('jwt', '');
         token = null;
         location.reload();
        }

        reject({
          response: {
            statusCode: responseObj.message.status.code,
            body: responseObj.message.error.response,
            status: responseObj.message.status.code
          }
        });
      }
      else {
        resolve(responseObj);
      }
    });
  });
}

const requests = {
  del: url =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: url =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url, body) =>
    superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (url, body) =>
    superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody)
};

const Auth = {
  current: () =>

    qewdMessage({
      type: 'user.get',
    }).then(responseMessage),


    //requests.get('/user'),

  login: (email, password) =>

    qewdMessage({
      type: 'users.login',
      params: {  
        email: email,
        password: password
      }
    }).then(responseMessage),

    //requests.post('/users/login', { user: { email, password } }),

  register: (username, email, password) =>

    qewdMessage({
      type: 'users.register',
      params: {
        username: username,
        email: email,
        password: password
      }
    }).then(responseMessage),

    //requests.post('/users', { user: { username, email, password } }),

  save: user =>

    qewdMessage({
      type: 'user.update',
      params: user
    }).then(responseMessage),

    //requests.put('/user', { user })
};

//const responseMessage = responseObj => ({tags: ['xxx', 'yyy', 'zzz']});

const Tags = {
  getAll: () => qewdMessage({type: 'tags.get'}).then(responseMessage)
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = article => Object.assign({}, article, { slug: undefined })
const Articles = {

  all: page => 
    qewdMessage({
      type: 'articles.list',
      params: {  
        limit: 10,
        offset: page ? page * 10 : 0
      }
    }).then(responseMessage),

  //requests.get(`/articles?${limit(10, page)}`),
    
  byAuthor: (author, page) =>

    qewdMessage({
      type: 'articles.byAuthor',
      params: {
        author: author,
        limit: 5,
        offset: page ? page * 5 : 0
      }
    }).then(responseMessage),

    //requests.get(`/articles?author=${encode(author)}&${limit(5, page)}`),

  byTag: (tag, page) =>

    qewdMessage({
      type: 'articles.byTag',
      params: {
        tag: tag,
        limit: 10,
        offset: page ? page * 10 : 0
      }
    }).then(responseMessage),

    //requests.get(`/articles?tag=${encode(tag)}&${limit(10, page)}`),

  del: slug =>

    qewdMessage({
      type: 'articles.del',
      params: {
        slug: slug
      }
    }).then(responseMessage),

   // requests.del(`/articles/${slug}`),

  favorite: slug =>

    qewdMessage({
      type: 'articles.favorite',
      params: {
        slug: slug
      }
    }).then(responseMessage),

    //requests.post(`/articles/${slug}/favorite`),

  favoritedBy: (author, page) =>

    qewdMessage({
      type: 'articles.favoritedBy',
      params: {
        author: author,
        limit: 5,
        offset: page ? page * 5 : 0
      }
    }).then(responseMessage),

    //requests.get(`/articles?favorited=${encode(author)}&${limit(5, page)}`),

  feed: () =>

    qewdMessage({
      type: 'articles.feed',
      params: {
        limit: 10,
        offset: 0
      }
    }).then(responseMessage),

    //requests.get('/articles/feed?limit=10&offset=0'),

  get: slug =>

    qewdMessage({
      type: 'articles.get',
      params: {
        slug: slug
      }
    }).then(responseMessage),

    //requests.get(`/articles/${slug}`),

  unfavorite: slug =>

    qewdMessage({
      type: 'articles.unfavorite',
      params: {
        slug: slug
      }
    }).then(responseMessage),

    //requests.del(`/articles/${slug}/favorite`),

  update: article =>

    qewdMessage({
      type: 'articles.update',
      params: article
    }).then(responseMessage),

    //requests.put(`/articles/${article.slug}`, { article: omitSlug(article) }),

  create: article =>

    qewdMessage({
      type: 'articles.create',
      params: article
    }).then(responseMessage),

    //requests.post('/articles', { article })
};

const Comments = {
  create: (slug, comment) =>

    qewdMessage({
      type: 'comments.create',
      params: {
        slug: slug,
        comment: comment
      }
    }).then(responseMessage),

    //requests.post(`/articles/${slug}/comments`, { comment }),

  delete: (slug, commentId) =>

    qewdMessage({
      type: 'comments.del',
      params: {
        slug: slug,
        commentId: commentId
      }
    }).then(responseMessage),

    //requests.del(`/articles/${slug}/comments/${commentId}`),

  forArticle: slug =>

    qewdMessage({
      type: 'comments.forArticle',
      params: {
        slug: slug
      }
    }).then(responseMessage),

   // requests.get(`/articles/${slug}/comments`)
};

const Profile = {
  follow: username =>

    qewdMessage({
      type: 'profile.follow',
      params: {  
        username: username
      }
    }).then(responseMessage),

    //requests.post(`/profiles/${username}/follow`),

  get: username =>
    qewdMessage({
      type: 'profile.get',
      params: {  
        username: username
      }
    }).then(responseMessage),

    //requests.get(`/profiles/${username}`),

  unfollow: username =>

    qewdMessage({
      type: 'profile.unfollow',
      params: {  
        username: username
      }
    }).then(responseMessage),

    //requests.del(`/profiles/${username}/follow`)
};

function init(q) {
  qewd = q;
  qewd.log = true;
}

export default {
  init,
  Articles,
  Auth,
  Comments,
  Profile,
  Tags,
  setToken: _token => { token = _token; }
};
