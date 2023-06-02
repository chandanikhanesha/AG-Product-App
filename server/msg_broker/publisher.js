var rabbit = require('rabbot');
// var fs = require('fs');

function queuePriceSheetRequest() {
  rabbit.publish('ex.pricesheet-pubsub-requests', {
    type: 'pricesheet.request',
    contentType: 'application/json',
    body: { text: 'hello!' }, // pricesheet request data
    persistent: true,
  });
}

// rabbit.log(
//   { level: 'debug', stream: fs.createWriteStream('./debug.log'), objectMode: true }
// );

// it can make a lot of sense to share topology definition across
// services that will be using the same topology to avoid
// scenarios where you have race conditions around when
// exchanges, queues or bindings are in place
require('./topology.js')(rabbit, 'requests').then(function (x) {
  console.log('ready');
});

rabbit.on('unreachable', function () {
  console.log(':(');
  process.exit();
});
