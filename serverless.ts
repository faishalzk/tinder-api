import type { AWS } from '@serverless/typescript';

import getUserDetails from "@functions/getUserDetails";
import postUserMatches from "@functions/postUserMatches";
import postSignUp from "@functions/postSignUp";
import getRandomUser from "@functions/getRandomUser";
import postLogIn from "@functions/postLogIn";

const serverlessConfiguration: AWS = {
  service: 'tinder-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { getUserDetails, postUserMatches, postSignUp, getRandomUser, postLogIn },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
