const app = require('app');
const http = require('http').Server(app);
const { exec } = require('child_process');

(async () => {
  await new Promise((resolve, reject) => {
    const migrate = exec('sequelize db:migrate', { env: process.env }, (err) => (err ? reject(err) : resolve()));
    // Forward stdout+stderr to this process
    migrate.stdout.pipe(process.stdout);
    migrate.stderr.pipe(process.stderr);
  });
})();

if (process.env.NODE_ENV !== 'test') {
  http.listen(app.get('port'), app.get('host'), (err) => {
    if (err) return console.log('error starting server : ', err);

    console.log(`Listening on port ${app.get('port')}`);
  });
}
