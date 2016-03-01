'use strict';
process.env.DEBUG = '*';
require('./config');  // Init config

describe('All Tests', function() {

  before(function(done) {
    this.timeout(0);  // Don't timeout anything
    done();
  });

  after(function() {});
  require('./tests/classes/Project'); // working
  require('./tests/classes/Component'); // working
  require('./tests/classes/Function'); // working
  require('./tests/classes/Endpoint'); // working
  require('./tests/classes/Stage'); // working
  require('./tests/classes/Region'); // working
  require('./tests/actions/TestPluginCustom'); // working
  //require('./tests/actions/TestDefaultActionHook'); // BROKEN. Something has to do with getParentTemplate
  require('./tests/actions/StageCreate'); // working
  require('./tests/actions/RegionCreate'); // working
  require('./tests/actions/ComponentCreate'); // working
  require('./tests/actions/FunctionCreate'); // working
  require('./tests/actions/EnvList'); // working
  require('./tests/actions/EnvGet'); // working
  require('./tests/actions/EnvSetUnset'); // working
  require('./tests/actions/ResourcesDeploy'); // working
  require('./tests/actions/FunctionRun'); // working. HOWEVER, test handler.js doesn't use lodash template syntax, which is broken
  require('./tests/actions/FunctionLogs'); // working
  require('./tests/actions/FunctionDeploy'); // working
  require('./tests/actions/EndpointDeploy'); // working
  require('./tests/actions/EventDeploy'); // working
  require('./tests/actions/ProjectInit'); // working
  //require('./tests/actions/ProjectInstall'); // BROKEN. Something has to do with getParentTemplate
  require('./tests/actions/ProjectLifeCycle.js'); // test again with CF ON!
  require('./tests/actions/ResourcesDiff'); // working
  require('./tests/actions/PluginCreate'); // working
});