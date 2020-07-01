const core = require('@actions/core');
const github = require('@actions/github');
const https = require('follow-redirects').https;

try {

    const monitors = [
      {type: 'postman', id: '1eab6268-40dc-4990-b999-5699b299ad7c'},
      {type: 'postman', id: '1eab622b-8892-4380-a1ab-29ec3b9b77b1'},
      {type: 'ghostinspector', id: '1eabb9c1-ab87-4550-a170-0b15251a3ba6'}
    ];

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



