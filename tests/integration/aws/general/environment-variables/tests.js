'use strict';

const path = require('path');
const expect = require('chai').expect;
const execSync = require('child_process').execSync;

const Utils = require('../../../../utils/index');

describe('AWS - General: Environment variables test', function () {
  this.timeout(0);

  before(() => {
    Utils.createTestService('aws-nodejs', path.join(__dirname, 'service'));
    Utils.deployService();
  });

  it('should expose environment variables', () => {
    const invoked = execSync(`${Utils.serverlessExec} invoke --function hello --noGreeting true`);

    const result = JSON.parse(new Buffer(invoked, 'base64').toString());

    expect(result.provider_level_variable).to.be.equal('provider_level');
    expect(result.function_level_variable).to.be.equal('function_level');
  });

  after(() => {
    Utils.removeService();
  });
});
