// Set up an instance of the REST-based RealWorld Conduit application

var serverAddress = '192.168.1.122:8080';

function customise(config, q, intercept) {
  var cp = require('child_process');

  // install the qewd-conduit back-end

  cp.execSync('npm install qewd-conduit',{stdio:[0,1,2]});

  // download a pre-built copy of React/Redux version of REST-based Conduit UI

  cp.execSync('wget https://s3.amazonaws.com/mgateway/conduit/conduit.zip',{stdio:[0,1,2]});

  // install Node.js module for unzipping files

  cp.execSync('npm install extract-zip',{stdio:[0,1,2]});
  var unzip = require('extract-zip');

  // Unzip the UI, copying the extracted files to the QEWD Web Server root path

  unzip('/opt/qewd/conduit.zip',  { dir: '/opt/qewd/www' }, function (err) {

    // Once it's all unzipped, modify the UI's bundled JS file so it points REST requests at our QEWD Container

    cp.execSync('sed -i s/192.168.1.122:8080/' + serverAddress + '/g /opt/qewd/www/static/js/main.d4022d9e.js',{stdio:[0,1,2]});
    console.log('*** Ready for use ***');
  })

}

module.exports = {
  run: customise
};
