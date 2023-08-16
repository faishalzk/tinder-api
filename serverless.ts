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
      DB_CONNECTION: 'postgres://faishalnaufal:w7IryVUQTt1k@ep-patient-scene-98638697.us-west-2.aws.neon.tech/neondb?options=project%3Dep-patient-scene-98638697&sslmode=require',
      ACCESS_TOKEN_SECRET: '195678f1514b677b923c04339103c059e0a2f015dab28788749628f1b67a42cb',
      REFRESH_TOKEN_SECRET: 'ea0d8e355aa5d4f3b273ac9a051ab52701ebad9f91598a10e31f09b00d36183a'
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
