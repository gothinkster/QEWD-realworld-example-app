// Using the WebSockets version of the Conduit UI

var serverAddress = '192.168.1.122:8080';

function customise(config, q, intercept) {
  var cp = require('child_process');

  // install qewd-conduit back-end module

  cp.execSync('npm install qewd-conduit',{stdio:[0,1,2]});

  // copy the UI from the repo that we've just installed into the QEWD Web Server root path

  cp.execSync('cp -R /opt/qewd/node_modules/qewd-conduit/www/* /opt/qewd/www',{stdio:[0,1,2]});

  // change the UI logic's IP address to that of this server

  cp.execSync('sed -i s/178.62.26.29:8080/' + serverAddress + '/g /opt/qewd/www/bundle.js',{stdio:[0,1,2]});
  console.log('*** Ready for use ***');
}

module.exports = {
  run: customise
};
