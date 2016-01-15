'use strict';

/**
 * Test: Resources Deploy Action
 * - Creates a new private in your system's temp directory
 * - Makes a tiny update to the private's CF template
 * - Deploy new CF template
 * - Deploy/Rollback the original CF template for cleaning
 */

let Serverless = require('../../../lib/Serverless.js'),
    path       = require('path'),
    utils      = require('../../../lib/utils/index'),
    assert     = require('chai').assert,
    testUtils  = require('../../test_utils'),
    SUtils     = require('../../../lib/utils/index'),
    fs         = require('fs'),
    config     = require('../../config');

let serverless;

/**
 * Validate Event
 * - Validate an event object's properties
 */

let validateEvent = function(evt) {
  assert.equal(true, typeof evt.options.region !== 'undefined');
  assert.equal(true, typeof evt.options.stage !== 'undefined');
  assert.equal(true, typeof evt.data !== 'undefined');
};

describe('Test action: Resources Deploy', function() {

  before(function(done) {
    this.timeout(0);
    testUtils.createTestProject(config)
        .then(projPath => {
          process.chdir(projPath);
          serverless = new Serverless({
            interactive: false,
            awsAdminKeyId:     config.awsAdminKeyId,
            awsAdminSecretKey: config.awsAdminSecretKey,
            projectPath: projPath
          });

          SUtils.sDebug('Adding test bucket resource');
          let Project = new serverless.classes.Project(serverless);
          // generate unique bucket name to get a unique CF template on every test.
          // CF will remove the previous bucket for us!
          Project.get().cloudFormation.Resources['testBucket' + (new Date).getTime().toString()] = { "Type" : "AWS::S3::Bucket" };
          Project.save();

          done();
        });
  });

  after(function(done) {
    done();
  });

  describe('Resources Deploy positive tests', function() {

    it('deploys an updated CF template', function(done) {

      this.timeout(0);
      let evt = {
        stage:      config.stage,
        region:     config.region
      };

      serverless.actions.resourcesDeploy(evt)
          .then(function(evt) {

            // Validate Evt
            validateEvent(evt);

            done();

          })
          .catch(e => {
            done(e);
          });
    });
  });
});
