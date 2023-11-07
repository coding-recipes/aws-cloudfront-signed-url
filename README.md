### CloudFront Signed URL Demo - Backend

Simple implementation of CloudFront Signed URL-s.  
The repo contains the Backend API and AWS infrastructure in the `/backend` folder. Infrastructure elements are created and deployed using AWS CDK (Cloud Development Kit).  
The demo UI can be found in the `/frontend` folder.  
For installation and deployment guidelines, please read `README` files in these folders.

**What is a CloudFront signed URL-s for?**  
CloudFront signed URLs are a security feature provided by Amazon Web Services (AWS) for their Content Delivery Network (CDN) service, Amazon CloudFront. They are used to restrict access to private or sensitive content distributed through CloudFront by generating time-limited, authenticated URLs. This ensures that only authorized users can access the content, preventing unauthorized access or hotlinking. To create a signed URL, a server generates a cryptographically signed token with specific access permissions and a limited time validity, which is then appended to the resource URL. When a user or client requests this signed URL, CloudFront's edge servers verify the token's authenticity and permissions, allowing or denying access accordingly. This mechanism is essential for protecting content such as premium video streams, software downloads, or confidential documents served through CloudFront.

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
- Cognito User Pool: authentication and authorization (On/Off configurable)

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

**Backend Mechanism**
![CloudFront Signed URL](/docs/architecture.png "CloudFront Signed URL")