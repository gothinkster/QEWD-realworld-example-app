# ![QEWD Example App](https://cloud.githubusercontent.com/assets/556934/25587724/182f95fc-2e5a-11e7-83db-1541c1bee128.png)

> ### Example QEWD.js-based codebase that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.


----------
 
Rob Tweed <rtweed@mgateway.com>  
25 January 2017, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

----------
	   
## React/Redux UI Modified to use QEWD.js WebSocket / Realtime APIs

The *qewd-conduit* back-end implementation not only implements the 
[RealWorld Conduit REST APIs](https://github.com/gothinkster/realworld/tree/master/api), 
but also provides an equivalent WebSocket interface for each of the APIs.

These WebSocket APIs invoke exactly the same database back-end code as their REST equivalents.

QEWD.js uses Socket.io to provide its outward-facing WebSocket interface - this is all automatically
built-in to QEWD.js without the need for any further configuration or effort by the developer.

In order to use the WebSocket APIs from the UI in the browser, you need to install, configure
and integrate the [ewd-client](https://github.com/robtweed/ewd-client) module into the UI.  This
is because QEWD.js implements a security layer around its use of WebSockets: this is all
automatically handled for you by the *ewd-client* module.  If you're using React/Redux for your
UI, there's a special packaged-up version of *ewd-client*:
[react-qewd](https://github.com/wdbacker/react-qewd).  This is what I've used in the modified UI.

In this part of the *qewd-conduit* repo, I've included a modified version of the 
React/Redux version of the RealWorld Conduit UI.  I've included not only the modified source code, 
but also a pre-compiled *bundle.js* file, so you can very quickly and simply try it out for
yourself.


## Installing and Running the Modified UI

You'll need to have installed QEWD.js and the current version of qewd-conduit (see
the README file in this repo's root folder).

As part of your QEWD.js installation, you should have a main QEWD folder (named either
*~/qewd* or perhaps *~/conduit*), and within that you should see a sub-folder named *www*.  This
is QEWD's Web Server Root Directory from which it serves up static resource files.

So the first thing to do is create a new folder under the *~/qewd/www* (or *~/conduit/www*) one: name
it *qewd-conduit-ws*.  Next, copy everything in the *qewd-conduit* repository's */www* folder into your
new *~/qewd/www/qewd-conduit-ws/* folder.

If you haven't already done so, start up the QEWD-conduit master process.

Now simply point a browser at your QEWD system, using the URL:

     http://192.168.1.100:8080/qewd-conduit-ws/index.html

     (change the IP address and port to correspond with your system's configuration)

The familiar Conduit UI should appear and work as expected, but if you check in the browser's
console, you won't see any REST APIs being invoked.  All communication is occuring via WebSockets.


## The Modifications in a Nut-shell

The modifications have been made in two of the UI's files:

- index.js
- agent.js

In *index.js*, you'll see how *react-qewd* has been integrated, essentially just wrapping the original
UI JSX.  This makes sure that the QEWD.js WebSocket hand-shaking and security initialisation has 
been completed before the Conduit UI starts up.

In *agent.js* you'll see that the calls to the REST interface (using *requests*) have been replaced
by calls to a function named *qewdMessage()*.  Look near the top of *agent.js* and you'll find this
function: it's a Promise-based wrapper around the standard ewd-client messaging interface that emulates
the *requests* Promise.

You'll see that WebSocket messaging in QEWD.js is very simple: send a JSON object that defines a 
message type (the *type* property) and payload (the *params* property) and wait for a response JSON
object.

With the *qewdMessage* Promise wrapper function in place, the rest of the Conduit UI behaves as normal,
since it emulates the behaviour of the original REST *requests* Promise.

Note that the API_ROOT constant in the modified *agent.js* doesn't serve any purpose - the communication
channel to the back-end system is established in the *index.js* file, ie look for this:

      let qewd = QEWD({
        application: 'qewd-conduit', // application name
        log: true,
         url: 'http://178.62.26.29:8080'
      });

The URL that's provided is for my demo system (see below).  If you want to set up your own QEWD.js
back-end, change this URL and re-bundle the UI code (or simply hack the bundle.js file I've provided!).


## Demo System


The live instance of *qewd-conduit* available at:

      http://178.62.26.29:8080

includes both the standard REST interface and the Real-time WebSocket equivalent interface.  The
same instance of QEWD.js can support both interfaces simultaneously.

Point a browser at 
[http://178.62.26.29:8080/qewd-conduit-ws/index.html](http://178.62.26.29:8080/qewd-conduit-ws/index.html) 
to try out the WebSocket version.


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
