'use strict';

const path = require('path');
const expect = require('chai').expect;
const Utils = require('../../../../utils/index');

beforeAll('AWS - SNS: Multiple topics single function', () => {
  Utils.createTestService('aws-nodejs', path.join(__dirname, 'service'));
  Utils.deployService();
});

it('should trigger function when new message is published', () => Utils
  .publishSnsMessage(process.env.TOPIC_1, 'topic1')
  .then(() => Utils.publishSnsMessage(process.env.TOPIC_2, 'topic2'))
  .delay(60000)
  .then(() => {
    const logs = Utils.getFunctionLogs('hello');
    expect(/aws:sns/g.test(logs)).to.equal(true);
    expect(/topic1/g.test(logs)).to.equal(true);
    expect(/topic2/g.test(logs)).to.equal(true);
  })
);

afterAll(() => {
  Utils.removeService();
});
