#!/bin/bash

echo "🚀 STREAMFLIX AWS DEPLOYMENT STARTING..."

# Set AWS Profile
export AWS_PROFILE=Aarav
export AWS_REGION=us-east-1

echo "✅ AWS Profile: $AWS_PROFILE"
echo "✅ Region: $AWS_REGION"

# Create S3 bucket for video storage
echo "📦 Creating S3 bucket..."
aws s3 mb s3://streamflix-videos-storage --region $AWS_REGION

# Create CloudFront distribution
echo "🌐 Setting up CloudFront CDN..."
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "streamflix-'$(date +%s)'",
  "Comment": "StreamFlix CDN",
  "DefaultCacheBehavior": {
    "TargetOriginId": "streamflix-s3",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {"Enabled": false, "Quantity": 0}
  },
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "streamflix-s3",
      "DomainName": "streamflix-videos-storage.s3.amazonaws.com",
      "S3OriginConfig": {"OriginAccessIdentity": ""}
    }]
  },
  "Enabled": true
}'

# Deploy to Elastic Beanstalk
echo "🚀 Deploying to Elastic Beanstalk..."
zip -r streamflix-app.zip . -x "*.git*" "node_modules/*" ".next/*"

aws elasticbeanstalk create-application --application-name streamflix

aws elasticbeanstalk create-environment \
  --application-name streamflix \
  --environment-name streamflix-prod \
  --solution-stack-name "64bit Amazon Linux 2 v5.8.0 running Node.js 18"

echo "✅ STREAMFLIX DEPLOYED TO AWS!"
echo "🌐 URL: Will be available in AWS Console"