const debug = require('debug')('feathers-authentication-keystone');
const merge = require('lodash.merge');
const omit = require('lodash.omit');
const pick = require('lodash.pick');
const DefaultVerifier = require('./verifier');
const { Strategy } = require('./passport');

const defaults = {
  name: 'keystone',
  usernameField: 'username',
  passwordField: 'password'
};

const INCLUDE_KEYS = [
  'authUrl',
  'service',
  'entity',
  'usernameField',
  'passwordField',
  'passReqToCallback'
];

const init = function init (options = {}) {
  return function keystoneAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-keystone?`);
    }

    let name = options.name || defaults.name;
    let authOptions = app.get('authentication') || {};
    let keystoneOptions = authOptions[name] || {};

    let keystoneSettings = merge({}, defaults,
      pick(authOptions, INCLUDE_KEYS), keystoneOptions, omit(options, ['Verifier']));

    if (typeof keystoneSettings.authUrl === 'undefined') {
      throw new Error(`You must provide an 'authUrl' in your authentication configuration`);
    }

    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, keystoneSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a keystone passport verify callback.`);
      }

      debug('Registering keystone authentication strategy with options:', keystoneSettings);
      app.passport.use(keystoneSettings.name,
        new Strategy(keystoneSettings, verifier.verify.bind(verifier))
      );
      app.passport.options(keystoneSettings.name, keystoneSettings);

      return result;
    };
  };
};

init.Verifier = DefaultVerifier;

module.exports = init;
