module.exports = function (rabbit, subscribeTo) {
  return rabbit
    .configure({
      // arguments used to establish a connection to a broker
      connection: {
        user: 'guest',
        pass: 'guest',
        server: ['127.0.0.1'],
        port: 5672,
        vhost: '%2f', //  "/" ASCII
        publishTimeout: 100,
        timeout: 1000,
        failAfter: 30,
        retryLimit: 400,
      },

      // define the exchanges
      exchanges: [
        {
          name: 'ex.pricesheet-pubsub-requests',
          type: 'direct',
          autoDelete: true,
        },
        {
          name: 'ex.pricesheet-pubsub-messages',
          type: 'fanout',
          autoDelete: true,
        },
      ],

      // setup the queues, only subscribing to the one this service
      // will consume messages from
      queues: [
        {
          name: 'q.pricesheet-pubsub-requests',
          durable: true,
          unique: 'hash',
          subscribe: subscribeTo === 'requests',
        },
        {
          name: 'q.pricesheet-pubsub-messages',
          autoDelete: true,
          subscribe: subscribeTo === 'messages',
        },
      ],

      // binds exchanges and queues to one another
      bindings: [
        {
          exchange: 'ex.pricesheet-pubsub-requests',
          target: 'q.pricesheet-pubsub-requests',
          keys: [''],
        },
        {
          exchange: 'ex.pricesheet-pubsub-messages',
          target: 'q.pricesheet-pubsub-messages',
          keys: [],
        },
      ],
    })
    .then(null, function () {});
};
