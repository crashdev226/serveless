'use strict';

/**
 * Test: CLI Class
 */

const expect = require('chai').expect;
const CLI = require('../../lib/classes/CLI');
const Serverless = require('../../lib/Serverless');

describe('CLI', () => {
  let cli;
  let serverless;
  const interactive = false;
  const emptyObject = { commands: [], options: {} };

  beforeEach(() => {
    serverless = new Serverless({});
  });

  describe('#construtor()', () => {
    it('should set the serverless instance', () => {
      cli = new CLI(serverless, interactive);
      expect(cli.serverless).to.deep.equal(serverless);
    });

    it('should set the isInteractive option', () => {
      cli = new CLI(serverless, interactive);
      expect(cli.interactive).to.equal(interactive);
    });

    it('should set an empty loadedPlugins array when none is provided', () => {
      cli = new CLI(serverless, interactive);
      expect(cli.loadedPlugins.length).to.equal(0);
    });

    it('should set a loadedPlugins array when provided', () => {
      class PluginMock {}

      const pluginMock = new PluginMock();
      const plugins = [pluginMock];

      cli = new CLI(serverless, interactive, plugins);
      expect(cli.loadedPlugins[0]).to.equal(pluginMock);
    });

    it('should set an empty inputArray when none is provided', () => {
      cli = new CLI(serverless, interactive);
      expect(cli.inputArray.length).to.equal(0);
    });

    it('should set the inputObject when provided', () => {
      cli = new CLI(serverless, interactive, [], ['foo', 'bar', '--baz', '-qux']);

      expect(cli.inputArray[0]).to.equal('foo');
      expect(cli.inputArray[1]).to.equal('bar');
      expect(cli.inputArray[2]).to.equal('--baz');
      expect(cli.inputArray[3]).to.equal('-qux');
    });
  });

  describe('#processInput()', () => {
    it('should return an "empty" object when the "help" parameter is given', () => {
      cli = new CLI(serverless, interactive, [], ['help']);
      const inputToBeProcessed = cli.processInput();

      expect(inputToBeProcessed).to.deep.equal({ commands: [], options: {} });
    });

    it('should return an "empty" object when the "--help" parameter is given', () => {
      cli = new CLI(serverless, interactive, [], ['--help']);
      const inputToBeProcessed = cli.processInput();

      expect(inputToBeProcessed).to.deep.equal(emptyObject);
    });

    it('should return an "empty" object when the "--h" parameter is given', () => {
      cli = new CLI(serverless, interactive, [], ['--h']);
      const inputToBeProcessed = cli.processInput();

      expect(inputToBeProcessed).to.deep.equal(emptyObject);
    });

    it('should return an "empty" object when the "version" parameter is given', () => {
      cli = new CLI(serverless, interactive, [], ['version']);
      const inputToBeProcessed = cli.processInput();

      expect(inputToBeProcessed).to.deep.equal(emptyObject);
    });

    it('should return an "empty" object when the "--version" parameter is given', () => {
      cli = new CLI(serverless, interactive, [], ['--version']);
      const inputToBeProcessed = cli.processInput();

      expect(inputToBeProcessed).to.deep.equal(emptyObject);
    });

    it('should return an "empty" object when the "--v" parameter is given', () => {
      cli = new CLI(serverless, interactive, [], ['--v']);
      const inputToBeProcessed = cli.processInput();

      expect(inputToBeProcessed).to.deep.equal(emptyObject);
    });

    it('should only return the commands when only commands are given', () => {
      cli = new CLI(serverless, interactive, [], ['deploy', 'functions']);
      const inputToBeProcessed = cli.processInput();

      const expectedObject = { commands: ['deploy', 'functions'], options: {} };

      expect(inputToBeProcessed).to.deep.equal(expectedObject);
    });

    it('should only return the options when only options are given', () => {
      cli = new CLI(serverless, interactive,
        [], ['-f', 'function1', '-r', 'resource1']);
      const inputToBeProcessed = cli.processInput();

      const expectedObject = { commands: [], options: { f: 'function1', r: 'resource1' } };

      expect(inputToBeProcessed).to.deep.equal(expectedObject);
    });

    it('should return commands and options when both are given', () => {
      cli = new CLI(serverless, interactive,
        [], ['deploy', 'functions', '-f', 'function1']);
      const inputToBeProcessed = cli.processInput();

      const expectedObject = { commands: ['deploy', 'functions'], options: { f: 'function1' } };

      expect(inputToBeProcessed).to.deep.equal(expectedObject);
    });
  });
});
