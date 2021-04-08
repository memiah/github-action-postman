const core = require('@actions/core');
const github = require('@actions/github');
const https = require('follow-redirects').https;


const fs = require('fs');

fs.readdirSync('./').forEach(file => {
  console.log(file);
});

try {
    let rawdata = fs.readFileSync('/github/workspace/postman-action-config.json');

    const monitors =  JSON.parse(rawdata);

    monitors.forEach(m => {
      var options = {
        'method': 'POST',
        'hostname': 'api.getpostman.com',
        'path': `/monitors/${m.id}/run`,
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
        res.on("end", () => {
          var body = Buffer.concat(chunks);
          console.log(body.toString());

          if (res.statusCode == 200) {
            if (m.type === 'postman') {
              if (JSON.parse(body.toString()).run.info.status == 'failed') {
                  core.setFailed(`1 or more Postman tests failed`);
                  console.log(body.toString());
              }
            } else if (m.type === 'ghostinspector') {
              const stats = JSON.parse(body.toString()).run.stats;
              if (stats.assertions.failed > 0) {
                core.setFailed(`1 or more Ghost Inspector tests failed`);
                console.log(stats);
              }
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



