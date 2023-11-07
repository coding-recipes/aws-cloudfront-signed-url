### CloudFront Signed URL Demo - Backend

Simple implementation of CloudFront Signed URL-s with AWS CDK (Cloud Development Kit).  
The deployment process uploads some sample images to the origin S3 bucket.  
The REST API and the GraphQl API support two queries. One for listing the files, and another to request a CloudFront Signed URL for a specific file.

**AWS Infrastructure**
- S3: Bucket for storing static assets (image files)
- KMS: custom key to protect Bucket assets (necessary for CloudFront OAC)
- CloudFront: 
  - CDN: distributes/caches static assets from S3 origin
  - protection: permits direct access
  - controlled access: creates ClFr signed URL-s for S3 assets
- CloudFront Key Group: stores public key (.pem) for validation
- CloudFront OAC: safe channel between S3 and CloudFront
- SSM Parameter Store: stores private key (.pem) for signing
- API Gateway and Lambda function: REST API
- AppSync and Lambda function: GraphQL API
- Cognito User Pool: authentication and authorization (INACTIVE)

**IaC - Infrastructure as Code**  
The stack is built and deployed via AWS CDK (Cloud Development Kit)

**Folders**  
`/infra`: AWS CDK Code for AWS infrastructure  
`/lambda`: code for Lambda functions

**Commands**  
run `yarn` or `yarn install` to install dependencies  
run `yarn dev` to launch UI using `.env.dev`

**REST API endpoints**  
```
GET /files                      ... list files  
GET /url?file=<fileName>        ... request signed URL for a file  
```

**GraphQL schema**
```
type Query {
  getFiles: [String]            ... list files  
  getUrl(file: String!): String ... request signed URL for a file  
}
```

**Backend Mechanism**  
![CloudFront Signed URL](/docs/architecture.png "CloudFront Signed URL")