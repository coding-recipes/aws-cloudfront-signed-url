import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { ClfrSignedUrlStack } from './stack';

export class Basics {

  public static createParamStoreParameter(stack: ClfrSignedUrlStack) {
    const parameter = new ssm.StringParameter(stack, 'parameter', {
      parameterName: 'CLF_PRIVATE_KEY',
      stringValue: stack.private_key,
    });
    stack.pk_parameter = parameter;
  }

  public static createKMSkeyForBucket(stack: ClfrSignedUrlStack) {
    const key = new kms.Key(stack, 'key', {
      enableKeyRotation: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    stack.kmsKey = key;
  }

  public static createBucketWithKMS(stack: ClfrSignedUrlStack) {
    const bucketProps: s3.BucketProps = {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryptionKey: stack.kmsKey,
      bucketKeyEnabled: true,
    }
    const bucket = new s3.Bucket(stack, 'signed-bucket', bucketProps);
    stack.bucket = bucket;
  }

  public static createBucketDeployment(stack: ClfrSignedUrlStack) {
    return new s3deploy.BucketDeployment(stack, 'signed-bucket-deployment', {
      sources: [s3deploy.Source.asset('./bucket')],
      destinationBucket: stack.bucket,
      destinationKeyPrefix: stack.props.S3_IMAGE_FOLDER,
      retainOnDelete: false,
    });
  }

  public static createUserPool(stack: ClfrSignedUrlStack) {
    const userPool = new cdk.aws_cognito.UserPool(stack, 'signed-user-pool', {
      userPoolName: 'signed-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cdk.aws_cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    stack.userPool = userPool;

    const userPoolClient = userPool.addClient('signed-user-pool-client', {
      authFlows: {
        custom: true,
        userPassword: false,
        userSrp: false
      }
    });

    stack.userPool = userPool;
    stack.userPoolClient = userPoolClient;
  }

}
