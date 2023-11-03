import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { API } from './stack-api';
import { CloudFront } from './stack-cloudfront';
import { Basics } from './stack-basics';
import * as fs from 'fs';

export interface ClfrSignedUrlStackProps extends cdk.StackProps {
  // -- inputs --
  CERTIFICATE_ARN?: string,
  CUSTOM_DOMAIN?: string,
  // -- config
  RESTRICT_API: boolean,
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

    this.private_key = fs.readFileSync('./keys/private_key.pem', 'utf8');
    this.public_key = fs.readFileSync('./keys/public_key.pem', 'utf8');

    Basics.createKMSkeyForBucket(this);
    Basics.createBucketWithKMS(this);
    Basics.createBucketDeployment(this);
    Basics.createUserPool(this);
    Basics.createParamStoreParameter(this);

    CloudFront.setKeyGroup(this);
    CloudFront.createDistribution(this);
    CloudFront.setOAC(this);
    CloudFront.setBucketPolicyForOAC(this);

    CloudFront.setKMSkeyAccessForCloudFront(this);

    API.createExecutionRole(this);
    API.createLambdaGraphApi(this);
    API.createLambdaRestApi(this);
    API.addBucketPermissions(this);
    API.addParamStorePermissions(this);

    API.createRestApi(this);
    API.createRestApiProxyEndpoint(this, this.fxRestApi, this.props.RESTRICT_API);

    API.createGraphqlApi(this, this.props.RESTRICT_API);
    API.addResolvers(this);
  }

}
