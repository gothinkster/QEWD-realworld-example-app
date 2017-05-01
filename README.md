# ![QEWD Example App](https://cloud.githubusercontent.com/assets/556934/25587724/182f95fc-2e5a-11e7-83db-1541c1bee128.png)

> ### Example QEWD Back-end codebase that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This repo is functionality complete — PR's and issues welcome!

----------

# qewd-conduit: QEWD-based Back-end for RealWorld Conduit Application
 
Rob Tweed <rtweed@mgateway.com>  
25 January 2017, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

## Installing

       npm install qewd-conduit

See the /startup folder for the QEWD startup file (*qewd.js*), which should be copied to your QEWD 
master directory, eg ~/qewd or ~/conduit, depending on where you installed QEWD itself.

	   
## About qewd-conduit

  *qewd-conduit* is a QEWD-based implementation of the REST back-end for the 
  [RealWorld Conduit](https://medium.com/@ericsimons/introducing-realworld-6016654d36b5)
  application.

  *qewd-conduit* requires [QEWD](https://github.com/robtweed/qewd) to be installed on your server.
  The simplest way to do this is to use one of the 
  [pre-built installers](https://github.com/robtweed/qewd/tree/master/installers) or the
  [QEWD Docker Appliance](https://www.slideshare.net/robtweed/ewd-3-training-course-part-42-the-qewd-docker-appliance)

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

## Demo System

I've made a live instance of *qewd-conduit* available at the endpoint:

      http://178.62.26.29:8080/api

Feel free to try it out against the 
[RealWorld Conduit PostMan Collection](https://github.com/gothinkster/realworld/blob/master/api/Conduit.json.postman_collection)


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
