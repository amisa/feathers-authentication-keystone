# feathers-authentication-keystone

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-keystone.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-keystone)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-keystone/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-keystone)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-keystone/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-keystone/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-keystone.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-keystone)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-keystone.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-keystone)

> Keystone authentication strategy for feathers-authentication using Passport

## Installation

```
npm install feathers-authentication-keystone --save
```

## Documentation

Please refer to the [feathers-authentication-keystone documentation](http://docs.feathersjs.com/) for more details.


#### Default Options

```js
{
    name: 'keystone', // the name to use when invoking the authentication Strategy
    entity: 'user', // the entity that will be added to the request, socket, and hook.params. (ie. req.user, socket.user, hook.params.user)
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    authUrl: 'http://<address>:<port>', // keystone endpoint
    usernameField: 'username', // key name of username field
    passwordField: 'password', // key name of password field
    Verifier: Verifier, // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

### Verifier

This is the verification class that receives the JWT payload (if verification is successful) and either returns the payload or, if an `id` is present in the payload, populates the entity (normally a `user`) and returns both the entity and the payload. It has the following methods that can all be overridden. The `verify` function has the exact same signature as [passport-jwt](https://github.com/themikenicholson/passport-jwt).

```js
{
    constructor(app, options) // the class constructor
    verify(req, payload, done) // queries the configured service
}
```

#### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import keystone, { Verifier } from 'feathers-authentication-keystone';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and
  // return values as a vanilla passport strategy
  verify(req, payload, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
    done(null, payload);
  }
}

app.configure(keystone({ Verifier: CustomVerifier }));
```

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-keystone`.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const keystone = require('../lib/index');

// Initialize the application.
const app = feathers();

app.configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login).
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication.
  .configure(auth({ secret: 'super secret' }))
  // Configure authentication by JWT token.
  .configure(jwt())
  // Keystone endpoint, this value should be taken from the config in real application.
  .configure(keystone({ authUrl: 'https://127.0.0.1:5000' }))
  .use('/users', memory())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
