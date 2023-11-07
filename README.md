### CloudFront Signed URL Demo - Backend

Simple implementation of CloudFront Signed URL-s.  
The repo contains the Backend API and AWS infrastructure in the `/backend` folder. Infrastructure elements are created and deployed using AWS CDK (Cloud Development Kit).  
The demo UI can be found in the `/frontend` folder.  
For installation and deployment guidelines, please read `README` files in these folders.

**AWS Infrastructure**
- S3: Bucket for storing static assets (image files)
- KMS: custom key to protect Bucket assets (necessary for CloudFront OAC)
- CloudFront: 
  - CDN: distributes/caches static assets from S3 origin
  - protection: permits direct access
  - controlled access: creates ClFr signed URL-s for S3 assets
- CloudFront key group: stores public key (.pem) for validation
- CloudFront OAC: save channel between S3 and CloudFront
- SSM Parameter Store: stores private key (.pem) for signing
- API Gateway and Lambda function: REST API
- AppSync and Lambda function: GraphQL API
- Cognito User Pool: authentication and authorization

**IaC - Infrastructure as Code**  
The stack is built and deployed via AWS CDK (Cloud Development Kit)

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