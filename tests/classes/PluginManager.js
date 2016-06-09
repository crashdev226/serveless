'use strict';

const expect = require('chai').expect;
const PluginManager = require('../../lib/classes/PluginManager');
const Serverless = require('../../lib/Serverless');
const HelloWorld = require('../../lib/plugins/helloWorld/helloWorld');

describe('PluginManager', () => {
  let pluginManager;
  let serverless;
  let helloWorld;

  class ServicePluginMock1 {}

  class ServicePluginMock2 {}

  class PromisePluginMock {
    constructor() {
      this.commands = {
        deploy: {
          usage: 'Deploy to the default infrastructure',
          lifecycleEvents: [
            'resources',
            'functions',
          ],
          options: {
            resource: {
              usage: 'The resource you want to deploy (e.g. --resource db)',
            },
            function: {
              usage: 'The function you want to deploy (e.g. --function create)',
            },
          },
          commands: {
            onpremises: {
              usage: 'Deploy to your On-Premises infrastructure',
              lifecycleEvents: [
                'resources',
                'functions',
              ],
              options: {
                resource: {
                  usage: 'The resource you want to deploy (e.g. --resource db)',
                },
                function: {
                  usage: 'The function you want to deploy (e.g. --function create)',
                },
              },
            },
          },
        },
      };

      this.hooks = {
        'deploy:functions': this.functions.bind(this),
        'before:deploy:onpremises:functions': this.resources.bind(this),
      };

      // used to test if the function was executed correctly
      this.deployedFunctions = 0;
      this.deployedResources = 0;
      this.functionName = null;
      this.resourceName = null;
    }

    functions(options) {
      return new Promise((resolve) => {
        this.deployedFunctions = this.deployedFunctions + 1;
        if (options) this.functionName = options.function;
        return resolve();
      });
    }

    resources(options) {
      return new Promise((resolve) => {
        this.deployedResources = this.deployedResources + 1;
        if (options) this.resourceName = options.resource;
        return resolve();
      });
    }
  }

  class SynchronousPluginMock {
    constructor() {
      this.commands = {
        deploy: {
          usage: 'Deploy to the default infrastructure',
          lifecycleEvents: [
            'resources',
            'functions',
          ],
          options: {
            resource: {
              usage: 'The resource you want to deploy (e.g. --resource db)',
            },
            function: {
              usage: 'The function you want to deploy (e.g. --function create)',
            },
          },
          commands: {
            onpremises: {
              usage: 'Deploy to your On-Premises infrastructure',
              lifecycleEvents: [
                'resources',
                'functions',
              ],
              options: {
                resource: {
                  usage: 'The resource you want to deploy (e.g. --resource db)',
                },
                function: {
                  usage: 'The function you want to deploy (e.g. --function create)',
                },
              },
            },
          },
        },
      };

      this.hooks = {
        'deploy:functions': this.functions.bind(this),
        'before:deploy:onpremises:functions': this.resources.bind(this),
      };

      // used to test if the function was executed correctly
      this.deployedFunctions = 0;
      this.deployedResources = 0;
      this.functionName = null;
      this.resourceName = null;
    }

    functions(options) {
      this.deployedFunctions = this.deployedFunctions + 1;
      if (options) this.functionName = options.function;
    }

    resources(options) {
      this.deployedResources = this.deployedResources + 1;
      if (options) this.resourceName = options.resource;
    }
  }

  beforeEach(() => {
    serverless = new Serverless({});
    pluginManager = new PluginManager(serverless);
    helloWorld = new HelloWorld();
  });

  describe('#constructor()', () => {
    it('should set the serverless instance', () => {
      expect(pluginManager.serverless).to.deep.equal(serverless);
    });

    it('should create an empty plugins array', () => {
      expect(pluginManager.plugins.length).to.equal(0);
    });

    it('should create an empty commandsList array', () => {
      expect(pluginManager.commandsList.length).to.equal(0);
    });

    it('should create an empty commands object', () => {
      expect(pluginManager.commands).to.deep.equal({});
    });
  });

  describe('#addPlugin()', () => {
    it('should add a plugin instance to the plugins array', () => {
      pluginManager.addPlugin(SynchronousPluginMock);

      expect(pluginManager.plugins[0]).to.be.an.instanceof(SynchronousPluginMock);
    });

    it('should load the plugin commands', () => {
      pluginManager.addPlugin(SynchronousPluginMock);

      expect(pluginManager.commandsList[0]).to.have.property('deploy');
    });
  });

  describe('#loadAllPlugins()', () => {
    it('should load only core plugins when no service plugins are given', () => {
      // Note: We need the helloWorld plugin for this test to pass
      pluginManager.loadAllPlugins();

      expect(pluginManager.plugins).to.include(helloWorld);
    });

    it('should load all plugins when service plugins are given', () => {
      const servicePlugins = [ServicePluginMock1, ServicePluginMock2];
      pluginManager.loadAllPlugins(servicePlugins);

      const servicePluginMock1 = new ServicePluginMock1();
      const servicePluginMock2 = new ServicePluginMock2();

      expect(pluginManager.plugins).to.contain(servicePluginMock1);
      expect(pluginManager.plugins).to.contain(servicePluginMock2);
      expect(pluginManager.plugins).to.contain(helloWorld);
    });

    it('should load all plugins in the correct order', () => {
      const servicePlugins = [ServicePluginMock1, ServicePluginMock2];

      // we need to mock it so that tests won't break when more core plugins are added later on
      // because we access the plugins array with an index which will change every time a new core
      // plugin will be added
      const loadCorePluginsMock = () => {
        pluginManager.addPlugin(HelloWorld);
      };

      // This is the exact same functionality like loadCorePlugins()
      loadCorePluginsMock();
      pluginManager.loadServicePlugins(servicePlugins);

      expect(pluginManager.plugins[0]).to.be.instanceof(HelloWorld);
      expect(pluginManager.plugins[1]).to.be.instanceof(ServicePluginMock1);
      expect(pluginManager.plugins[2]).to.be.instanceof(ServicePluginMock2);
    });
  });

  describe('#loadCorePlugins()', () => {
    it('should load the Serverless core plugins', () => {
      pluginManager.loadCorePlugins();

      expect(pluginManager.plugins).to.contain(helloWorld);
    });
  });

  describe('#loadServicePlugins()', () => {
    it('should load the service plugins', () => {
      const servicePlugins = [ServicePluginMock1, ServicePluginMock2];
      pluginManager.loadServicePlugins(servicePlugins);

      const servicePluginMock1 = new ServicePluginMock1();
      const servicePluginMock2 = new ServicePluginMock2();

      expect(pluginManager.plugins).to.contain(servicePluginMock1);
      expect(pluginManager.plugins).to.contain(servicePluginMock2);
    });
  });

  describe('#loadCommands()', () => {
    it('should load the plugin commands', () => {
      pluginManager.loadCommands(SynchronousPluginMock);

      expect(pluginManager.commandsList[0]).to.have.property('deploy');
    });
  });

  describe('#getEvents()', () => {
    beforeEach(() => {
      pluginManager.loadCommands(SynchronousPluginMock);
    });

    it('should get all the matching events for a root level command in the correct order', () => {
      const commandsArray = ['deploy'];
      const events = pluginManager.getEvents(commandsArray, pluginManager.commands);

      expect(events[0]).to.equal('before:deploy:resources');
      expect(events[1]).to.equal('deploy:resources');
      expect(events[2]).to.equal('after:deploy:resources');
      expect(events[3]).to.equal('before:deploy:functions');
      expect(events[4]).to.equal('deploy:functions');
      expect(events[5]).to.equal('after:deploy:functions');
    });

    it('should get all the matching events for a nested level command in the correct order', () => {
      const commandsArray = ['deploy', 'onpremises'];
      const events = pluginManager.getEvents(commandsArray, pluginManager.commands);

      expect(events[0]).to.equal('before:deploy:onpremises:resources');
      expect(events[1]).to.equal('deploy:onpremises:resources');
      expect(events[2]).to.equal('after:deploy:onpremises:resources');
      expect(events[3]).to.equal('before:deploy:onpremises:functions');
      expect(events[4]).to.equal('deploy:onpremises:functions');
      expect(events[5]).to.equal('after:deploy:onpremises:functions');
    });

    it('should return an empty events array when the command is not defined', () => {
      const commandsArray = ['foo'];
      const events = pluginManager.getEvents(commandsArray, pluginManager.commands);

      expect(events.length).to.equal(0);
    });
  });

  describe('#getPlugins()', () => {
    it('should return all loaded plugins', () => {
      const servicePlugins = [ServicePluginMock1, ServicePluginMock2];
      pluginManager.loadServicePlugins(servicePlugins);

      expect(pluginManager.getPlugins()[0]).to.be.instanceof(ServicePluginMock1);
      expect(pluginManager.getPlugins()[1]).to.be.instanceof(ServicePluginMock2);
    });
  });

  describe('#run()', () => {
    it('should throw an error when the given command is not available', () => {
      pluginManager.addPlugin(SynchronousPluginMock);

      const commandsArray = ['foo'];

      expect(() => { pluginManager.run(commandsArray); }).to.throw(Error);
    });

    it('should run the hooks in the correct order', () => {
      class CorrectHookOrderPluginMock {
        constructor() {
          this.commands = {
            run: {
              usage: 'Pushes the current hook status on the hookStatus array',
              lifecycleEvents: [
                'beforeHookStatus',
                'midHookStatus',
                'afterHookStatus',
              ],
            },
          };

          this.hooks = {
            'before:run:beforeHookStatus': this.beforeHookStatus.bind(this),
            'run:midHookStatus': this.midHookStatus.bind(this),
            'after:run:afterHookStatus': this.afterHookStatus.bind(this),
          };

          // used to test if the hooks were run in the correct order
          this.hookStatus = [];
        }

        beforeHookStatus() {
          this.hookStatus.push('before');
        }

        midHookStatus() {
          this.hookStatus.push('mid');
        }

        afterHookStatus() {
          this.hookStatus.push('after');
        }
      }

      pluginManager.addPlugin(CorrectHookOrderPluginMock);
      const commandsArray = ['run'];
      return pluginManager.run(commandsArray)
        .then(() => {
          expect(pluginManager.plugins[0].hookStatus[0]).to.equal('before');
          expect(pluginManager.plugins[0].hookStatus[1]).to.equal('mid');
          expect(pluginManager.plugins[0].hookStatus[2]).to.equal('after');
        });
    });

    describe('when using a synchronous hook function', () => {
      beforeEach(() => {
        pluginManager.addPlugin(SynchronousPluginMock);
      });

      describe('when running a simple command', () => {
        it('should run a simple command', () => {
          const commandsArray = ['deploy'];
          return pluginManager.run(commandsArray)
            .then(() => expect(pluginManager.plugins[0].deployedFunctions)
              .to.equal(1));
        });

        it('should process the options when given', () => {
          const commandsArray = ['deploy'];
          const optionsObject = { function: 'function1' };
          return pluginManager.run(commandsArray, optionsObject)
            .then(() => expect(pluginManager.plugins[0].functionName)
              .to.equal(optionsObject.function));
        });
      });

      describe('when running a nested command', () => {
        it('should run the nested command', () => {
          const commandsArray = ['deploy', 'onpremises'];
          return pluginManager.run(commandsArray)
            .then(() => expect(pluginManager.plugins[0].deployedResources)
              .to.equal(1));
        });

        it('should process the options when given', () => {
          const commandsArray = ['deploy', 'onpremises'];
          const optionsObject = { resource: 'resource1' };
          pluginManager.run(commandsArray, optionsObject)
            .then(() => expect(pluginManager.plugins[0].resourceName)
              .to.equal(optionsObject.resource));
        });
      });
    });

    describe('when using a promise based hook function', () => {
      beforeEach(() => {
        pluginManager.addPlugin(PromisePluginMock);
      });

      describe('when running a simple command', () => {
        it('should run the simple command', () => {
          const commandsArray = ['deploy'];
          return pluginManager.run(commandsArray)
            .then(() => expect(pluginManager.plugins[0].deployedFunctions)
              .to.equal(1));
        });

        it('should process the options when given', () => {
          const commandsArray = ['deploy'];
          const optionsObject = { function: 'function1' };
          return pluginManager.run(commandsArray, optionsObject)
            .then(() => expect(pluginManager.plugins[0].functionName)
              .to.equal(optionsObject.function));
        });
      });

      describe('when running a nested command', () => {
        it('should run the nested command', () => {
          const commandsArray = ['deploy', 'onpremises'];
          pluginManager.run(commandsArray)
            .then(() => expect(pluginManager.plugins[0].deployedResources)
              .to.equal(1));
        });

        it('should process the options when given', () => {
          const commandsArray = ['deploy', 'onpremises'];
          const optionsObject = { resource: 'resource1' };
          pluginManager.run(commandsArray, optionsObject)
            .then(() => expect(pluginManager.plugins[0].resourceName)
              .to.equal(optionsObject.resource));
        });
      });
    });
  });
});
