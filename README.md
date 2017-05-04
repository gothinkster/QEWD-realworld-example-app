# ![QEWD Example App](https://cloud.githubusercontent.com/assets/556934/25587724/182f95fc-2e5a-11e7-83db-1541c1bee128.png)

> ### Example QEWD Back-end codebase that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This repo is functionality complete — PR's and issues welcome!

----------
 
Rob Tweed <rtweed@mgateway.com>  
25 January 2017, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

----------
	   
## About qewd-conduit

  *qewd-conduit* is a full implementation of the REST back-end for the 
  [RealWorld Conduit](https://medium.com/@ericsimons/introducing-realworld-6016654d36b5)
  application using [QEWD](http://qewdjs.com).

  *qewd-conduit* requires [QEWD](https://github.com/robtweed/qewd) to be installed on your server
  (see below).

  *qewd-conduit* uses Redis as a Document Database and Persistent JavaScript Objects.  QEWD itself
  is a Node.js-based Web Application & REST run-time platform.

  [Read my article](https://robtweed.wordpress.com/2017/04/18/having-your-node-js-cake-and-eating-it-too/) 
  that explains the rationale and objectives of QEWD.
  
  Since the back-end specification of the RealWorld Conduit application is 
  [fully documented](https://github.com/gothinkster/realworld/tree/master/api) 
  and implemented using 
  [several other technologies and/or frameworks](https://github.com/gothinkster/realworld), 
  it provides a great way of comparing and contrasting the different development approaches
  used for each option.

  Although QEWD is a Node.js-based platform, you'll see that the way in which the back-end has
  been able to be developed is very different from what you'd expect.  Whilst it's all
  been written in JavaScript, there's no asynchronous logic, even for the database
  manipulation.  That's possible due to QEWD's master process / queue / worker process-pool
  architecture.

  The RealWorld Conduit initiative also allows direct comparisons to be made in terms of
  back-end performance.  I think you'll be favourably impressed by the performance of 
  *qewd-conduit*.

  What may be less easy to appreciate is the speed of development when using the different
  RealWorld Conduit back-end technologies.  I can tell you that, in the case of *qewd-conduit*, 
  the entire back-end was implemented from scratch in just 2 man-days, including the time taken
  to read up on and understand the application's objectives, requirements and APIs.  Part of
  the speed of development comes from not having to worry about asynchronous logic, but it's
  also due to its very high-level database abstraction.  See 
  [Parts 17 - 27 of the QEWD Online Training Course](http://ec2.mgateway.com/ewd/ws/training.html).

## A Quick Guided Tour of *qewd-conduit*

### Install QEWD

  The simplest way to do this is to use one of the 
  [pre-built installers](https://github.com/robtweed/qewd/tree/master/installers) or the
  [QEWD Docker Appliance](https://www.slideshare.net/robtweed/ewd-3-training-course-part-42-the-qewd-docker-appliance)

  If you prefer to install manually, [use this guide](https://www.slideshare.net/robtweed/installing-configuring-ewdxpress).

  You'll probably want to install and use Redis with *qewd-conduit*, but it will also work with
  GT.M or Cach&eacute;

### Install *qewd-conduit*

From the directory in which you installed QEWD (eg *~/qewd*):

       npm install qewd-conduit


### Master Process Startup File


We'll start with the QEWD Master Process startup file that you'll find in the repo at /startup/qewd.js

This file tells QEWD how to configure Express, the Worker Pool size and how to set up the basic
URL REST routing.  

The first part is a configuration object (*config*), the properties of which you can change before
starting QEWD, eg:

- managementPassword: If you also installed the *qewd-monitor* application as part of the QEWD
installation (recommended so you can monitor and manage the QEWD run-time environment from a browser), 
you MUST change this password - it's what provides access to the *qewd-monitor* application.

- serverName:  This is the name that appears in the *qewd-monitor* application's banner.  You can leave
this alone if you wish

- port: the port on which Express will listen.  Change if you prefer a different port to 8080

- poolSize: the maximum number of Worker Processes that QEWD will use.  On a very busy system you may
want to increase this value

- database: currently specifies Redis.  Each Worker Process will connect to Redis using its default port

The *routes* object should be left unchanged.  It defines the basic REST routing that will be 
configured using Express middleware provided by QEWD.  You'll see that it specifies that any 
incoming URI prefixed */api* will be handled by the *qewd-conduit* module.  Note that this handling 
actually takes place in the QEWD Worker Processes, not the QEWD Master Process.

The *routes* object also defines a custom error object response structure that conforms to the
RealWorld Conduit API specification for Not Found errors.

### Starting QEWD

Once you're happy with your QEWD startup file, copy it to your QEWD installation directory, eg to:

       ~/qewd/qewd.js

Then start it up.  You can either run it manually, eg:

         cd ~/qewd   (or whatever directory you installed QEWD in)
         node qewd

Or use something like [PM2](http://pm2.keymetrics.io/) to run QEWD as a background service, eg:

         cd ~/qewd
         pm2 start qewd.js

[Read this document](https://www.slideshare.net/robtweed/ewd-3-training-course-part-29-running-ewdxpress-as-a-service-on-windows)
 for details of how to run QEWD as a service on Windows.

### Stopping QEWD

If you're running QEWD in a foreground window process, simply type CTRL & C

If you're using PM2:

        pm2 stop qewd

Alternatively, you can stop QEWD by using the *qewd-monitor* application:  

- In a browser, start it up:

        http://192.168.1.100:8080/qewd-monitor/index.html

        Note: change the IP address & port to match your server and QEWD configuration

- Login using the management password that you specified in the QEWD startup file

- Click the red X button next to the Master Process PID


### Main Routing For the RealWorld Conduit API

When REST requests for RealWorld Conduit are received (eg *GET /api/tags*), the request is
queued by the QEWD master process and dispatched to an available worker process.

This worker process will load the *qewd-conduit* module (if it hasn't already done so), and
all subsequent processing of the request is handled by *qewd-conduit*.

Everything starts in the file you'll find in the repo at */lib/conduit.js*

When the module is first loaded, its *init()* function is automatically invoked.  You'll see that 
this defines all the URI routing for RealWorld Conduit's APIs.  The routing is actually managed by
a sub-module named [qewd-router](https://github.com/robtweed/qewd-router)

The processing of each specific API is handled by the module specified in the *routes* array, eg:


       {
        url: '/api/users/login',
        method: 'POST',    
        handler: users.authenticate
      }

This specifies that POST requests for */api/users/login* will be handled by the *users.authenticate*
module that you'll find in */lib/user/authenticate.js*


At the bottom of the *conduit.js* file you'll see the *handlers* object.  This is needed by
QEWD's Worker Process to handle the 2nd-level URI options, ie:

       /api/users
       /api/user
       /api/articles
       /api/profiles
       /api/tags


So the main *qewd-conduit* is hopefully pretty straightforward to understand, and you can see that
it is easily extensible in future to cater for new APIs.

### Handlers for Specific APIs

So, as a result of the *routes* object in the *conduit.js* file (described above), each of the
RealWorld Conduit APIs is handled by its own module file. eg, *GET /api/tags* is handled by */lib/tags/get.js*

You'll find that they all conform to a pretty similar pattern:

- if the API is a POST or PUT that requires a body payload, the body is checked to ensure all
required fields are present and not empty strings, or to ensure that any optional fields are
not empty strings.  All the information contained in an incoming REST request is made available
by QEWD to the handler module function via the handler function's first argument: *args*, eg:

  - args.req.headers: contains all the HTTP request headers
  - args.req.body: contains the body payload for POST and PUT requests (if relevant)
  - args.req.query: contains any URI QueryString name/value pairs

  - any variables specified in the route (eg */api/articles/:slug*) are available as a property of
    *args* (eg *args.slug*) 

- if the API requires authentication, the JSON Web Token (JWT) is checked against the Secret that
was used by the QEWD Worker when it was created or updated.  The user Id and Username are extracted 
from the JWT payload if needed by the handler.  JWT support is provided by the
[ewd-session](https://github.com/robtweed/ewd-session) module.  Although this can be used by
QEWD applications to support 
[Sessions and associated Session Storage](https://www.slideshare.net/robtweed/ewd-3-training-course-part-27-the-ewd-3-session),
 *qewd-conduit* actually only uses QEWD Sessions for secure storage of the JWT Secret.

- Any required specific field validation then takes place

- The database containing the User, Article, Profile or Tag information is accessed.  See the next
section for information on how database handling is carried out in *qewd-conduit*.

- Finally the response is returned.  This is handled by the handler function's 2nd argument: *callback*

The purpose of this callback function is two-fold:

- it conveys the JSON response object that is to be returned to the QEWD Master Process (which forwards it to
the REST Client that originally sent the request)

- it tells QEWD that Worker processing has completed, which results in the Worker Process being 
returned to the available pool, ready to handle the next incoming request from QEWD's queue.

### QEWD Database Handling

Even though QEWD may be using Redis, it's not using it in a conventional way.  QEWD uses the
[ewd-redis-globals](https://github.com/robtweed/ewd-redis-globals) module to implement a style of
database storage known as [*Global Storage*](https://www.slideshare.net/robtweed/ewd-3-training-course-part-17-introduction-to-global-storage-databases).
Global Storage is a very powerful database design with 
[multi-model NoSQL capability](https://www.slideshare.net/robtweed/ewd-3-training-course-part-18-modelling-nosql-databases-using-global-storage).

QEWD then further abstracts these basic database APIs by using the 
[ewd-document-store](https://github.com/robtweed/ewd-document-store) module.

The *ewd-document-store* module abstracts the database (eg Redis) as what are known as
[DocumentNode objects](https://www.slideshare.net/robtweed/ewd-3-training-course-part-20-the-documentnode-object).

These allow the database to be simultaneously accessible as:

- a fine-grained [Document Database](https://www.slideshare.net/robtweed/ewd-3-training-course-part-25-document-database-capabilities)
- [Persistent JavaScript Objects](https://www.slideshare.net/robtweed/ewd-3-training-course-part-21-persistent-javascript-objects),
 allowing direct manipulation of on-disk storage via the *DocumentNode* objects

*qewd-conduit* stores the Conduit data in three Persistent Documents:

- conduitUsers
- conduitArticles
- conduitComments

If you're intested in inspecting their raw storage, you can use the *qewd-monitor* application and
click the *Document Store* Nav link in the banner.

Here's some examples of their use in the *qewd-conduit* API handler modules:

- In */lib/tags/get.js*, it spins through the *conduitArticles* document *byTag* index, using
 the DocumentNode's *forEachChild* method:

        var tags = [];
        var tagsDoc = new this.documentStore.DocumentNode('conduitArticles', ['byTag']);
        tagsDoc.forEachChild(function(tag) {
          tags.push(tag);
        });

[Read this](https://www.slideshare.net/robtweed/ewd-3-training-course-part-22-traversing-documents-using-documentnode-objects)
 for more details on traversing DocumentNode objects.


- In */lib/articles/create.js*, this code creates the various indices for a new article:

      var articlesDoc = new this.documentStore.DocumentNode('conduitArticles');
       ...

      articlesDoc.$(['byId', articleId]).setDocument(article);
      articlesDoc.$(['bySlug', slug]).value = articleId;
      articlesDoc.$(['byAuthor', id, articleId]).value = articleId;
      articlesDoc.$(['byTimestamp', ts]).value = articleId;

The *setDocument()* method is an example of the Document Database capability in action, whilst setting the 
*value* shows how another part of the same DocumentNode object can be handled as a Persistent 
Javascript Object.

- In */lib/artciles/deleteComment.js*, this is how a comment is deleted from the database:

      var commentDoc = new this.documentStore.DocumentNode('conduitComments', ['byId', commentId]);
      commentDoc.delete();

You'll notice that, even though QEWD is a Node.js-based platform, all the database handling is done
synchronously.  This is possible due to the Master Process/Queue/Worker Pool architecture of QEWD.

You'll hopefully agree that the approach to database handling adopted by QEWD is straightforward, 
intuitive, yet very powerful.  You'll also find that it's very fast.


That's basically the *qewd-conduit* application in a nutshell.  To find out more, I'd encourage
you to dig into the code and consult the [training slide decks](http://ec2.mgateway.com/ewd/ws/training.html).

## Demo System

I've made a live instance of *qewd-conduit* available at the endpoint:

      http://178.62.26.29:8080/api

Feel free to try it out against the 
[RealWorld Conduit PostMan Collection](https://github.com/gothinkster/realworld/blob/master/api/Conduit.json.postman_collection)

I've also installed the 
[React/Redux version of the Conduit UI](https://github.com/gothinkster/react-redux-realworld-example-app)
on this same server, so you can see the *qewd-conduit* back-end working with it.

Point a browser at [http://178.62.26.29:8080](http://178.62.26.29:8080) to try it out.



## License

 Copyright (c) 2017 M/Gateway Developments Ltd,                           
 Redhill, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  http://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
