# Using the Docker Version of QEWD with QEWD-Conduit

- Install Docker
- On your host server, create a directory for the docker-specific control files, eg ~/qewd-docker-files

## If you want to use the React/Redux version of the RealWorld Conduit front-end

- copy custom-React-REST.js to the directory you created, and rename it to custom,js, eg

      ~/qewd-docker-files/custom.js

## If you want to use the pre-built WebSocket version of the RealWorld Conduit front-end that comes with QEWD-conduit

- copy custom-websocket-UI.js to the directory you created, and rename it to custom,js, eg

      ~/qewd-docker-files/custom.js


## Copy routes.js to the same directory, eg:

      ~/qewd-docker-files/routes.js



## Start the Docker version of QEWD:

      replace {username} with the home username for your server

      sudo docker run -it -p 8080:8080 --link redis:redis -v /home/{username}/qewd-docker-files:/opt/qewd/mapped rtweed/qewd

      If you want to run silently as a daemon, replace the -it option with -d


If you're using a Raspberry Pi, use this instead:

      sudo docker run -it -p 8080:8080 --link redis:redis -v /home/{username}/qewd-docker-files:/opt/qewd/mapped rtweed/rpi-qewd

      If you want to run silently as a daemon, replace the -it option with -d


## Start the UI in a browser

      http://{ip-address}:8080/index.html

You're now running the RealWorld Conduit front-end against a dockerised version of QEWD.js




