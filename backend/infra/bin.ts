#!/usr/bin/env node
import { config } from 'dotenv';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
config({ path: `.env.${ENVIRONMENT}` });

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

export const stackName = process.env.STACK_NAME || 'ClfrSignedUrlStack';


const app = new cdk.App();
const stack = new cdk.Stack(app, stackName, {});

app.synth();

