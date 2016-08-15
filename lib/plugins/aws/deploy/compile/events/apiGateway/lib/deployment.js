'use strict';

const _ = require('lodash');
const BbPromise = require('bluebird');

module.exports = {
  compileDeployment() {
    const deploymentTemplate = `
      {
        "Type" : "AWS::ApiGateway::Deployment",
        "Properties" : {
          "RestApiId" : { "Ref": "RestApiApigEvent" },
          "StageName" : "${this.options.stage}"
        }
      }
    `;

    const deploymentLogicalId = `DeploymentApigEvent${(new Date).getTime().toString()}`;
    const deploymentTemplateJson = JSON.parse(deploymentTemplate);
    deploymentTemplateJson.DependsOn = this.methodDependencies;

    const newDeploymentObject = {
      [deploymentLogicalId]: deploymentTemplateJson,
    };

    _.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources,
      newDeploymentObject);

    // create CLF Output for endpoint
    const outputServiceEndpointTemplate = `
    {
      "Description": "URL of the service endpoint",
      "Value": { "Fn::Join" : [ "", [ "https://", { "Ref": "RestApiApigEvent" },
        ".execute-api.${this.options.region}.amazonaws.com/${this.options.stage}"] ] }
    }`;

    const newOutputEndpointObject = {
      ServiceEndpoint: JSON.parse(outputServiceEndpointTemplate),
    };

    this.serverless.service.provider.compiledCloudFormationTemplate.Outputs =
      this.serverless.service.provider.compiledCloudFormationTemplate.Outputs || {};

    _.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Outputs,
      newOutputEndpointObject);

    return BbPromise.resolve();
  },
};
