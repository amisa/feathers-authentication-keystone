const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const keystone = require('../lib/index');

function printUserPayload () {
  return function (hook) {
    console.log('Received payload: ', hook.params.payload.user);
    return Promise.resolve(hook);
  };
}

// Initialize the application.
const app = feathers();

app.configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login).
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication.
  .configure(auth({ secret: 'super secret' }))
  // Configure authentication by JWT token.
  .configure(jwt())
  // Keystone endpoint, this value should be taken from the config in real application.
  // v3 auth is used by default.
  .configure(keystone({ authUrl: 'https://127.0.0.1:5000' }))
  .use('/users', memory())
  .use(errorHandler());

// Authenticate the user using the keystone strategy and
// if successful return a token.
app.service('authentication').hooks({
  before: {
    // The credentials should be taken from the request.
    create: [auth.hooks.authenticate('keystone')]
  }
});

// Authenticate using the JWT token provided to
// the 'authentication' request.
app.service('users').hooks({
  before: {
    find: [auth.hooks.authenticate('jwt'), printUserPayload()]
  }
});

app.listen(3030);

console.log('Feathers authentication with keystone auth started on 127.0.0.1:3030');
