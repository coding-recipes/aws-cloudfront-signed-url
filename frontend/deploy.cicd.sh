# -------- CHECK VARS --------
if [ -z "${AWS_ACCESS_KEY_ID}" ]; then
  echo "ERR: AWS_ACCESS_KEY_ID is not provided"
  exit 1
fi

if [ -z "${AWS_SECRET_ACCESS_KEY}" ]; then
  echo "ERR: AWS_SECRET_ACCESS_KEY is not provided"
  exit 1
fi

if [ -z "${S3_BUCKET}" ]; then
  echo "ERR: S3_BUCKET (S3 Bucket name) is not provided"
  exit 1
fi

if [ -z "${S3_FOLDER}" ]; then
  echo "ERR: S3_FOLDER (S3 Folder name) is not provided"
  exit 1
fi

if [ -z "${CLF_DIST}" ]; then
  echo "ERR: CLF_DIST (CloudFront Distribution ID) is not provided"
  exit 1
fi

echo "----- S3 bucket: $S3_BUCKET"
echo "----- S3 folder: $S3_FOLDER"
echo "----- CLF_DIST: $CLF_DIST"


# -------- BUILD --------
rm -rf dist
yarn build
if [ ! -d "./dist" ]; then
  echo "----- ERR: Build was not successful -----"
  exit 1
fi

cd dist


# -------- DEPLOY --------
echo "----- Deploying to S3 bucket: $S3_BUCKET"
aws s3 sync . s3://$S3_BUCKET/$S3_FOLDER/

echo "----- Setting cache-control to 0"
aws s3 cp index.html s3://$S3_BUCKET/$S3_FOLDER/index.html --cache-control max-age=0

echo "----- Invalidating CloudFront cache"
aws cloudfront create-invalidation --distribution-id $CLF_DIST --paths /$S3_FOLDER/index.html