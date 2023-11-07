import { ClfrSignedUrlStack } from './stack';
import { Duration } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as rest from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as appsync from "aws-cdk-lib/aws-appsync";


export class API {

  public static createExecutionRole(stack: ClfrSignedUrlStack) {
    const role = new iam.Role(stack, 'signed-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')]
    });
    stack.executionRole = role;
  }

  private static lambdaProps(stack: ClfrSignedUrlStack) {
    const lambdaProps: lambdanode.NodejsFunctionProps = {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      role: stack.executionRole,
      environment: {
        BUCKET_NAME: stack.bucket.bucketName,
        BUCKET_BASE_FOLDER: stack.props.S3_IMAGE_FOLDER,
        PK_PARAMETER_NAME: stack.pk_parameter.parameterName,
        CLF_KEY_PAIR_ID: stack.clfKey.publicKeyId,
        CUSTOM_DOMAIN: stack.props.CUSTOM_DOMAIN || '',
        DOMAIN_CLOUDFRONT: stack.distribution.distributionDomainName,
      },
      bundling: {
        externalModules: [
          'aws-sdk',
          '@aws-sdk/client-cognito-identity-provider',
          '@aws-sdk/client-s3',
          '@aws-sdk/client-ssm',
          "@aws-sdk/cloudfront-signer",
          '@aws-sdk/s3-request-presigner',
        ],
        minify: false,
        target: 'es2020',
      },
    }
    return lambdaProps;
  }

  public static createLambdaGraphApi(stack: ClfrSignedUrlStack) {
    const fxGraphApi = new lambdanode.NodejsFunction(stack, 'graphApiResolver', {
      entry: 'lambda/fx-graphql.ts',
      ...this.lambdaProps(stack),
    });
    stack.fxGraphApi = fxGraphApi
  }

  public static createLambdaRestApi(stack: ClfrSignedUrlStack) {
    const fxRestApi = new lambdanode.NodejsFunction(stack, 'restApiLambda', {
      ...this.lambdaProps(stack),
      entry: 'lambda/fx-rest.ts',
    });
    stack.fxRestApi = fxRestApi
  }

  public static createRestApi(stack: ClfrSignedUrlStack) {
    const api = new rest.RestApi(stack, 'signed-api', {
      restApiName: 'signed-api',
      deployOptions: {
        stageName: 'v1',
      },
      endpointConfiguration: {
        types: [rest.EndpointType.REGIONAL]
      },
      defaultCorsPreflightOptions: {
        allowOrigins: rest.Cors.ALL_ORIGINS,
        allowMethods: rest.Cors.ALL_METHODS,
      }
    });

    stack.restApi = api;
  }

  public static createRestApiProxyEndpoint(stack: ClfrSignedUrlStack, fx: lambda.Function) {
    const withAuthorizer = stack.props.RESTRICT_API;
    const createAuthorizer = () => {
      return new rest.CognitoUserPoolsAuthorizer(stack, 'UserAuthorizer', {
        cognitoUserPools: [stack.userPool]
      });
    }
    stack.restApi.root.addResource('{proxy+}').addMethod(
      'ANY',
      new rest.LambdaIntegration(fx),
      withAuthorizer ? {
        authorizer: createAuthorizer(),
        authorizationType: rest.AuthorizationType.COGNITO
      }
        : undefined
    );
  }


  public static createGraphqlApi(stack: ClfrSignedUrlStack) {
    const withAuthorizer = stack.props.RESTRICT_API;
    const authorizationConfig = withAuthorizer ? {
      defaultAuthorization: {
        authorizationType: appsync.AuthorizationType.USER_POOL,
        userPoolConfig: {
          userPool: stack.userPool,
        },
      },
    } : undefined

    const api = new appsync.GraphqlApi(stack, 'signed-graphql-api', {
      name: 'signed-graphql-api',
      definition: appsync.Definition.fromFile('./infra/shcema.graphql'),
      authorizationConfig
    });

    stack.graphqlApi = api;
  }

  private static addResolver(stack: ClfrSignedUrlStack, typeName: string, fieldName: string, fx: lambda.Function) {
    const ds = stack.graphqlApi.addLambdaDataSource(`${typeName}-${fieldName}-ds`, fx);
    ds.createResolver(`${fieldName}-res`, { typeName, fieldName });
  }

  public static addResolvers(stack: ClfrSignedUrlStack) {
    this.addResolver(stack, 'Query', 'getUrl', stack.fxGraphApi);
    this.addResolver(stack, 'Query', 'getFiles', stack.fxGraphApi);
  }

  public static addBucketPermissions(stack: ClfrSignedUrlStack) {
    stack.bucket.grantReadWrite(stack.fxGraphApi)
    stack.bucket.grantReadWrite(stack.fxRestApi)
  }

  public static addParamStorePermissions(stack: ClfrSignedUrlStack) {
    stack.pk_parameter.grantRead(stack.fxGraphApi)
    stack.pk_parameter.grantRead(stack.fxRestApi)
  }

}
