var rabbit = require('rabbot');

// this handler will handle messages sent from the publisher
rabbit.handle('pricesheet.request', function (msg) {
  // console.log( "Received:", JSON.stringify( msg.body ) );
  // msg.ack();
});

require('./topology.js')(rabbit, 'messages').then(() => {
  //Suscriber ready
});
