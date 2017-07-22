const { expect } = require('chai');
const plugin = require('../src');

describe('feathers-authentication-keystone', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof plugin).to.equal('function', 'It worked');
  });
});
