import Debug from 'debug';

const debug = Debug('feathers-authentication-keystone:verify');


class KeystoneVerifier {
  constructor(app, options = {}) {
    this.app = app;
    this.options = options;

    this.service = typeof options.service === 'string' ? app.service(options.service) : options.service;

    if (!this.service) {
      throw new Error(`options.service does not exist.\n\tMake sure you are passing a valid service path or service instance and it is initialized before feathers-authentication-keystone.`);
    }

    this.verify = this.verify.bind(this);
  }

  verify(req, identity, done) {
    debug('Received Keystone identity:', identity);

    let user = {
      id: identity.user.id,
      username: identity.user.name,
      token: identity.token,
      expires_at: identity.expires_at,
    };

    const payload = {
      [`${this.options.entity}Id`]: identity.user.id,
    };

    return done(null, user, payload);
  }
}

export default KeystoneVerifier;
