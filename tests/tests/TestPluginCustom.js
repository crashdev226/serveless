'use strict';

/**
 * Test: Plugin
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
  awsAdminKeyId:     '123',
  awsAdminSecretKey: '123',
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
   * @returns {string}
   */

  static getName() {
    return 'com.yourdomain.' + CustomPlugin.name;
  }

  /**
   * Register Actions
   */

  registerActions() {

    this.Jaws.addAction(this._actionOne.bind(this), {
      handler:       'actionOne',
      description:   'A test plugin',
      context:       'action',
      contextAction: 'one',
      options:       [{
        option:      'option',
        shortcut:    'o',
        description: 'test option 1'
      }],
    });

    this.Jaws.addAction(this._actionTwo.bind(this), {
      handler:       'actionTwo',
      description:   'A test plugin',
      context:       'action',
      contextAction: 'two',
      options:       [{
        option:      'option',
        shortcut:    'o',
        description: 'test option 1'
      }],
    });

    this.Jaws.addAction(this._actionThree.bind(this), {
      handler:       'actionThree',
      description:   'A test plugin',
      context:       'action',
      contextAction: 'three',
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

    this.Jaws.addHook(this._hookPre.bind(this), {
      action: 'actionOne',
      event:  'pre'
    });
    this.Jaws.addHook(this._hookPost.bind(this), {
      action: 'actionOne',
      event:  'post'
    });

    this.Jaws.addHook(this._hookPreTwo.bind(this), {
      action: 'actionTwo',
      event:  'pre'
    });
    this.Jaws.addHook(this._hookPostTwo.bind(this), {
      action: 'actionTwo',
      event:  'post'
    });

    this.Jaws.addHook(this._hookPreThree.bind(this), {
      action: 'actionThree',
      event:  'pre'
    });
    this.Jaws.addHook(this._hookPostThree.bind(this), {
      action: 'actionThree',
      event:  'post'
    });

    return Promise.resolve();
  }

  /**
   * Plugin Logic
   * @returns {Promise}
   * @private
   */

  _actionOne(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionOne');
        // Add evt data
        return resolve(evt);
      }, 250);
    });
  }

  _hookPre(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionOnePre');
        // Add evt data
        return resolve(evt);
      }, 250);
    });
  }

  _hookPost(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionOnePost');
        // Add evt data
        return resolve(evt);
      }, 250);
    });
  }

  /**
   * Test Nesting 1 Action
   * @param evt
   * @returns {*}
   * @private
   */

  _actionTwo(evt) {
    let _this = this;
    evt.sequence.push('actionTwo');
    return _this.Jaws.actions.actionOne(evt);
  }

  _hookPreTwo(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionTwoPre');
        // Add evt data
        return resolve(evt);
      }, 250);
    });
  }

  _hookPostTwo(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionTwoPost');
        // Add evt data
        return resolve(evt);
      }, 250);
    });
  }

  /**
   * Test Chaining & Nesting Sub-Actions
   * @param evt
   * @returns {*}
   * @private
   */

  _actionThree(evt) {
    let _this = this;
    evt.sequence.push('actionThree');
    return _this.Jaws.actions.actionOne(evt)
        .then(_this.Jaws.actions.actionTwo);
  }

  _hookPreThree(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionThreePre');
        // Add evt data
        return resolve(evt);
      }, 250);
    });
  }

  _hookPostThree(evt) {
    let _this = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        evt.sequence.push('actionThreePost');
        // Add evt data
        return resolve(evt);
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

  describe('Test Single Action', function() {
    it('should successfully run hooks and actions in sequence', function(done) {

      this.timeout(0);
      Jaws.actions.actionOne({
            sequence: []
          })
          .then(function(evt) {
            // Test event object
            assert.isTrue(evt.sequence[0] === 'actionOnePre');
            assert.isTrue(evt.sequence[1] === 'actionOne');
            assert.isTrue(evt.sequence[2] === 'actionOnePost');
            done();
          })
          .catch(function(e) {
            done(e);
          });
    });
  });

  describe('Test Nested Sub-Action', function() {
    it('should successfully run hooks and actions in sequence', function(done) {

      this.timeout(0);
      Jaws.actions.actionTwo({
            sequence: []
          })
          .then(function(evt) {
            // Test event object
            console.log("done: ", evt);
            assert.isTrue(evt.sequence[0] === 'actionTwoPre');
            assert.isTrue(evt.sequence[1] === 'actionTwo');
            assert.isTrue(evt.sequence[2] === 'actionOnePre');
            assert.isTrue(evt.sequence[3] === 'actionOne');
            assert.isTrue(evt.sequence[4] === 'actionOnePost');
            assert.isTrue(evt.sequence[5] === 'actionTwoPost');
            done();
          })
          .catch(function(e) {
            done(e);
          });
    });
  });

  describe('Test Chained & Nested Sub-Actions', function() {
    it('should successfully run hooks and actions in sequence', function(done) {

      this.timeout(0);
      Jaws.actions.actionThree({
            sequence: []
          })
          .then(function(evt) {
            // Test event object
            console.log("done: ", evt);
            assert.isTrue(evt.sequence[0] === 'actionThreePre');
            assert.isTrue(evt.sequence[1] === 'actionThree');
            assert.isTrue(evt.sequence[2] === 'actionOnePre');
            assert.isTrue(evt.sequence[3] === 'actionOne');
            assert.isTrue(evt.sequence[4] === 'actionOnePost');
            assert.isTrue(evt.sequence[5] === 'actionTwoPre');
            assert.isTrue(evt.sequence[6] === 'actionTwo');
            assert.isTrue(evt.sequence[7] === 'actionOnePre');
            assert.isTrue(evt.sequence[8] === 'actionOne');
            assert.isTrue(evt.sequence[9] === 'actionOnePost');
            assert.isTrue(evt.sequence[10] === 'actionTwoPost');
            assert.isTrue(evt.sequence[11] === 'actionThreePost');
            done();
          })
          .catch(function(e) {
            done(e);
          });
    });
  });
});