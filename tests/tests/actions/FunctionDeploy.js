'use strict';

/**
 * Test: Function Deploy Action
 */

let JAWS      = require('../../../lib/Jaws.js'),
    path      = require('path'),
    utils     = require('../../../lib/utils/index'),
    assert    = require('chai').assert,
    testUtils = require('../../test_utils'),
    config    = require('../../config');

let Jaws;

describe('Test Action: Function Deploy', function() {

  before(function(done) {
    this.timeout(0);

    testUtils.createTestProject(config)
        .then(projPath => {
          process.chdir(projPath);

          Jaws = new JAWS({
            interactive: false,
            awsAdminKeyId:     config.awsAdminKeyId,
            awsAdminSecretKey: config.awsAdminSecretKey
          });

          done();
        });
  });

  after(function(done) {
    done();
  });

  describe('Function Deploy Code Lambda Nodejs', function() {
    it('Function Deploy Code Lambda Nodejs', function(done) {

      this.timeout(0);

      let event = {
        stage:      config.stage,
        region:     config.region,
        noExeCf:    config.noExecuteCf,
        type:       'code',
        functions:  ['aws_modules/users/create'],
      };

      Jaws.actions.functionDeploy(event)
          .then(function() {
            done();
          })
          .catch(e => {
            done(e);
          });
    });
  });

  //describe('Function Deploy: Endpoint: ApiGateway', function() {
  //
  //  it('Function Deploy Endpoint', function(done) {
  //    this.timeout(0);
  //
  //    let event = {
  //      stage:      config.stage,
  //      region:     config.region,
  //      noExeCf:    config.noExecuteCf,
  //      type:       'endpoint',
  //      functions:  ['aws_modules/users/create'],
  //    };
  //
  //    Jaws.actions.functionDeploy(event)
  //        .then(function() {
  //          done();
  //        })
  //        .catch(e => {
  //          done(e);
  //        });
  //  });
  //});
});
