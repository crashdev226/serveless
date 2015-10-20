'use strict';

/**
 * Test: Plugins
 */

let JAWS       = require('../../lib/Jaws.js'),
    JawsPlugin = require('../../lib/JawsPlugin'),
    path       = require('path'),
    assert     = require('chai').assert,
    config     = require('../config');

/**
 * JAWS
 */

let Jaws = new JAWS({
  awsAdminKeyId:     '123', //TODO: why is this needed? the profile is set in process.env.TEST_JAWS_PROFILE (./config)
  awsAdminSecretKey: '123', //TODO: why is this needed? the profile is set in process.env.TEST_JAWS_PROFILE (./config)
  interactive:       false,
});

/**
 * Define Plugin
 */

class CustomPlugin extends JawsPlugin {

  constructor(Jaws, config) {
    super(Jaws, config);
  }

  /**
   * Define your plugins name
   *
   * @returns {string}
   */
  static getName() {
    return 'com.yourdomain.' + CustomPlugin.name;
  }

  /**
   * Register Actions
   */

  registerActions() {
    this.Jaws.action(this._action.bind(this), {
      handler:       'pluginTest',
      description:   'A test plugin',
      context:       'plugin',
      contextAction: 'test',
      options:       [{
        option:      'option',
        shortcut:    'o',
        description: 'test option 1'
      }],
    });

    return Promise.resolve();
  }

  /**
   * Register Hooks
   */

  registerHooks() {
    this.Jaws.hook(this._hookPre.bind(this), {
      handler: 'pluginTest',
      event:   'pre'
    });
    this.Jaws.hook(this._hookPost.bind(this), {
      handler: 'pluginTest',
      event:   'post'
    });

    return Promise.resolve();
  }

  /**
   * Plugin Logic
   * @returns {Promise}
   * @private
   */

  _action(paramsTest1, paramsTest2) {
    let _this = this;
    return new Promise(function(resolve) {
      console.log('Action fired');
      setTimeout(function() {
        _this.Jaws.testAction  = true;
        _this.Jaws.paramsTest1 = paramsTest1;
        _this.Jaws.paramsTest2 = paramsTest2;
        return resolve();
      }, 250);
    });
  }

  _hookPre() {
    let _this = this;
    return new Promise(function(resolve) {
      console.log('Hook "Pre" fired');
      setTimeout(function() {
        _this.Jaws.testHookPre = true;
        return resolve();
      }, 250);
    });
  }

  _hookPost() {
    let _this = this;
    return new Promise(function(resolve) {
      console.log('Hook "Post" fired');
      setTimeout(function() {
        _this.Jaws.testHookPost = true;
        return resolve();
      }, 250);
    });
  }
}

/**
 * Run Tests
 */

describe('Test Custom Plugin', function() {

  before(function(done) {
    Jaws.addPlugin(new CustomPlugin(Jaws, {}));
    done();
  });

  after(function(done) {
    done();
  });

  describe('Test Custom Plugin', function() {
    it('should run and attach values to context', function(done) {

      this.timeout(0);
      Jaws.actions.pluginTest(true, true)
          .then(function() {
            // Test context
            assert.isTrue(Jaws.testHookPre);
            assert.isTrue(Jaws.testHookPost);
            assert.isTrue(Jaws.testAction);
            // Test Params are passed through action handler
            assert.isTrue(Jaws.paramsTest1);
            assert.isTrue(Jaws.paramsTest2);
            done();
          })
          .catch(function(e) {
            done(e);
          });
    });
  });
});