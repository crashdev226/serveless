/**
 * This example generated adds content to the repos README.md file
 */
const fs = require('fs');
const path = require('path');
const markdownMagic = require('markdown-magic');
const remoteRequest = require('markdown-magic/lib/transforms/remote').remoteRequest;

function formatPluginName(string) {
  return toTitleCase(string.replace(/-/g, ' '));
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt =>
     txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

const config = {
  transforms: {
    GENERATE_SERVERLESS_PLUGIN_TABLE(content, options) {
      const pluginUrl = 'https://raw.githubusercontent.com/serverless/community-plugins/master/plugins.json';
      const remoteContent = remoteRequest(pluginUrl);
      let md = '| Plugin name | description  |\n';
      md += '|:--------------------------- |:-----|\n';
      JSON.parse(remoteContent).plugins.sort((a, b) =>
         a.name < b.name ? -1 : 1
      ).forEach((data) => {
        md += `| [${formatPluginName(data.name)}](${data.githubUrl}) | ${data.description} |\n`;
      });
      return md.replace(/^\s+|\s+$/g, '');
    },
  },
};

const markdownPath = path.join(__dirname, '..', 'README.md');
// const markdownPath = path.join(__dirname, '..', 'test/fixtures/test.md')
markdownMagic(markdownPath, config, () => {
  console.log(`${markdownPath} updated!`); // eslint-disable-line
});
