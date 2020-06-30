const core = require('@actions/core');
const github = require('@actions/github');

const https = require('follow-redirects').https;
//const fs = require('fs');

try {

    const paths = [
      '/monitors/1eab6268-40dc-4990-b999-5699b299ad7c/run',
      '/monitors/1eab622b-8892-4380-a1ab-29ec3b9b77b1/run'
    ];

    paths.forEach(path => {
      var options = {
        'method': 'POST',
        'hostname': 'api.getpostman.com',
        'path': path,
        'headers': {
          'X-Api-Key': process.env.POSTMANAPIKEY
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res) {
        var chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          if (res.statusCode == 200) {
            console.log(body.toString());
            const status = JSON.parse(body.toString()).run.info.status;
            if (status == 'failed') {
                core.setFailed(`1 or more tests failed`);
            }
          } else {
            core.setFailed(`Failed. Error code ${res.statusCode}`);
            console.error(body.toString());
          }
        });
      
        res.on("error", function (error) {
          console.error(error);
        });
      });
      req.end();
    });
    
} catch (error) {
  core.setFailed(error.message);
}



