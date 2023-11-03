import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Basics } from './stack-basics';

export interface ClfrSignedUrlStackProps extends cdk.StackProps {
  S3_IMAGE_FOLDER: string,
}

export class ClfrSignedUrlStack extends cdk.Stack {
  readonly props: ClfrSignedUrlStackProps;
  public bucket: cdk.aws_s3.Bucket;
  public fxGraphApi: cdk.aws_lambda.Function;
  public fxRestApi: cdk.aws_lambda.Function;
  public restApi: cdk.aws_apigateway.RestApi;
  public executionRole: cdk.aws_iam.Role;
  public userPool: cdk.aws_cognito.UserPool;
  public graphqlApi: cdk.aws_appsync.GraphqlApi;
  public kmsKey: cdk.aws_kms.Key;
  public distribution: cdk.aws_cloudfront.CloudFrontWebDistribution;
  public clfKeyGroup: cdk.aws_cloudfront.KeyGroup;
  public clfKey: cdk.aws_cloudfront.PublicKey;
  public pk_parameter: cdk.aws_ssm.StringParameter;
  public private_key: string;
  public public_key: string;

  constructor(scope: Construct, id: string, props: ClfrSignedUrlStackProps) {
    super(scope, id, props);
    this.props = props;

    Basics.createKMSkeyForBucket(this);
    Basics.createBucketWithKMS(this);
    Basics.createBucketDeployment(this);
    Basics.createUserPool(this);
    Basics.createParamStoreParameter(this);

  }

}
