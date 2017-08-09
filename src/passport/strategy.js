const util = require('util');
const lookup = require('./utils').lookup;
const passport = require('passport-strategy');
const openstack = require('openstack-wrapper');

function Strategy (options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }

  if (!options.authUrl) {
    return this.fail({ message: options.badRequestMessage || 'Missing Identity Endpoint' }, 400);
  }

  if (!verify) {
    throw new TypeError('KeystoneStrategy requires a verify callback');
  }

  this._authUrl = options.authUrl + '/v3';

  this._usernameField = options.usernameField || 'username';
  this._passwordField = options.passwordField || 'password';

  passport.Strategy.call(this);
  this.name = 'keystone';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport.Strategy);

// Authenticate a user using the credentials provided in the request.
Strategy.prototype.authenticate = function (req, options) {
  options = options || {};

  let username = lookup(req.body, this._usernameField) ||
    lookup(req.query, this._usernameField);
  let password = lookup(req.body, this._passwordField) ||
    lookup(req.query, this._passwordField);

  if (!username || !password) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }

  const self = this;

  const verified = function (err, user, info) {
    if (err) {
      return self.error(err);
    }

    if (!user) {
      return self.fail(info);
    }

    return self.success(user, info);
  };

  const keystone = new openstack.Keystone(self._authUrl);

  keystone.getToken(username, password, function (err, token) {
    if (err) {
      if (err.errno === 'EHOSTUNREACH' || err.errno === 'ECONNREFUSED') {
        return self.fail({message: 'Unable to connect to keystone at ' + err.address + ':' + err.port}, 401);
      }

      if (err.detail && (err.detail.remoteStatusCode === 401)) {
        return self.fail({ message: 'Invalid username or password' }, 401);
      } else {
        return self.fail(err);
      }
    }

    if (self._passReqToCallback) {
      return self._verify(req, token, verified);
    }

    return self._verify(token, verified);
  });
};

module.exports = Strategy;
