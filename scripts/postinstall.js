'use strict';

const execSync = require('child_process').execSync;

const Serverless = require('../lib/Serverless');

const serverless = new Serverless();

(() => {
  serverless.init().then(() => {
    try {
      execSync('./node_modules/tabtab/bin/tabtab install --name serverless --auto');
    } catch (e) {
      execSync('./node_modules/tabtab/bin/tabtab install --name serverless --stdout');
      serverless.cli.consoleLog('Could not auto-install serverless autocompletion script.');
      serverless.cli.consoleLog('Please copy/paste the script above into your shell.');
    }
    serverless.utils.logStat(serverless, 'install').catch(() => Promise.resolve());
  });
})();
