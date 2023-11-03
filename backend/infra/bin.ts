#!/usr/bin/env node
import { config } from 'dotenv';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
config({ path: `.env.${ENVIRONMENT}` });

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClfrSignedUrlStack } from './stack';

export const stackName = process.env.STACK_NAME || 'ClfrSignedUrlStack';

const stackEnv = {
  CERTIFICATE_ARN: process.env.CERTIFICATE_ARN || '',
  CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN || '',
  // -- CONFIG --
  S3_IMAGE_FOLDER: "images",
}

const app = new cdk.App();
new ClfrSignedUrlStack(app, stackName, stackEnv);
