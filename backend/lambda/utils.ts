import { S3Client, ListObjectsCommand, ListObjectsCommandOutput, _Object } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { SSMClient, GetParameterCommand, GetParameterCommandOutput } from "@aws-sdk/client-ssm";

const s3 = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const BUCKET_BASE_FOLDER = process.env.BUCKET_BASE_FOLDER || '';
const DOMAIN_CLOUDFRONT = process.env.DOMAIN_CLOUDFRONT || '';
const CLF_KEY_PAIR_ID = process.env.CLF_KEY_PAIR_ID || '';
const PK_PARAMETER_NAME = process.env.PK_PARAMETER_NAME || '';
const EXPIRE_HOURS = 24;

const replaceStringPrefix = (str: string, prefix: string, replacement: string = ""): string => {
  if (str.startsWith(prefix)) {
    return replacement + str.slice(prefix.length)
  }
  return str;
}

export const getFiles = async () => {
  // TODO: replace temporary S3 listObjects with DynamoDB query
  const prefix = BUCKET_BASE_FOLDER + "/"
  const command = new ListObjectsCommand({ Bucket: BUCKET_NAME, Prefix: prefix });
  const response: ListObjectsCommandOutput = await s3.send(command);
  const filesObjects: _Object[] = response.Contents || []
  const files = filesObjects.map(f => replaceStringPrefix(f.Key || "", prefix)).filter(f => f.length > 0)
  return files
}

export const getPrivateKey = async () => {
  const client = new SSMClient();

  const command = new GetParameterCommand({
    Name: PK_PARAMETER_NAME,
  })
  const data: GetParameterCommandOutput = await client.send(command);
  const privateKey = data.Parameter?.Value || '';
  return privateKey;
}

export const getUrl = async (fileName: string, privateKey: string) => {
  return getSignedUrl({
    url: `https://${DOMAIN_CLOUDFRONT}/${fileName}`,
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * EXPIRE_HOURS).toISOString(),
    keyPairId: CLF_KEY_PAIR_ID,
    privateKey,
  })
}

export const apiGtwResponse = (body: { [_key: string]: any }, statusCode: number = 200) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      ...body,
      ver: '0.0.2'
    })
  }
}