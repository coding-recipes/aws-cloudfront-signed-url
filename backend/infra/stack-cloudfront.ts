import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { ClfrSignedUrlStack } from './stack';

export class CloudFront {

  public static setKMSkeyAccessForCloudFront(stack: ClfrSignedUrlStack) {
    stack.kmsKey.grantEncryptDecrypt(new iam.ServicePrincipal("cloudfront.amazonaws.com"));
  }

  public static createDistribution(stack: ClfrSignedUrlStack) {
    const certificate = stack.props.CERTIFICATE_ARN ? acm.Certificate.fromCertificateArn(stack, 'cert', stack.props.CERTIFICATE_ARN) : undefined

    const viewerCertificate = certificate ? cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
      aliases: stack.props.CUSTOM_DOMAIN ? [stack.props.CUSTOM_DOMAIN] : undefined,
    }) : undefined

    const distProps: cloudfront.CloudFrontWebDistributionProps = {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: stack.bucket,
            originPath: '/' + stack.props.S3_IMAGE_FOLDER,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: true,
              allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
              cachedMethods: cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
              viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.seconds(86400),
              defaultTtl: cdk.Duration.seconds(3600),
              trustedKeyGroups: [stack.clfKeyGroup],
              forwardedValues: {
                queryString: true,
                cookies: {
                  forward: 'all',
                },
              },
            },
          ],
        },
      ],
      viewerCertificate
    };

    const distribution = new cloudfront.CloudFrontWebDistribution(stack, 'signed-distribution', distProps)


    new cdk.CfnOutput(stack, 'distributionDomainName', { value: distribution.distributionDomainName });

    stack.distribution = distribution
    return distribution
  }

  public static setOAC(stack: ClfrSignedUrlStack) {
    const oac = new cloudfront.CfnOriginAccessControl(stack, 'clfr-dist-oac', {
      originAccessControlConfig: {
        name: stack.stackName + " OAC",
        originAccessControlOriginType: 's3',
        signingBehavior: 'always', // always | never | no-override
        signingProtocol: 'sigv4',
      },
    });


    const cfnDistribution = stack.distribution.node.defaultChild as cloudfront.CfnDistribution
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.getAtt('Id'))
  }

  public static setBucketPolicyForOAC(stack: ClfrSignedUrlStack) {
    stack.bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject"],
      principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
      resources: [stack.bucket.bucketArn + "/*"],
      conditions: {
        "StringEquals": {
          "AWS:SourceArn": `arn:aws:cloudfront::${stack.account}:distribution/${stack.distribution.distributionId}`
        }
      }
    }))
  }

  public static setKeyGroup(stack: ClfrSignedUrlStack) {
    const key = new cloudfront.PublicKey(stack, 'public-key-obj', {
      encodedKey: stack.public_key,
    })

    const keyGroup = new cloudfront.KeyGroup(stack, 'key-group-obj', {
      items: [key],
    })

    stack.clfKey = key;
    stack.clfKeyGroup = keyGroup;
  }
}
