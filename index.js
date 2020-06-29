const core = require('@actions/core');
const github = require('@actions/github');

const https = require('follow-redirects').https;
//const fs = require('fs');

try {
    var options = {
        'method': 'POST',
        'hostname': 'api.getpostman.com',
        'path': '/monitors/1eab6268-40dc-4990-b999-5699b299ad7c/run',
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
} catch (error) {
  core.setFailed(error.message);
}



