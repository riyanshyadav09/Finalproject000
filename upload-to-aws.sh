#!/bin/bash

echo "🚀 UPLOADING STREAMFLIX TO AWS..."

export AWS_PROFILE=Aarav
export AWS_REGION=ap-southeast-2

# Create S3 bucket for deployment
echo "📦 Creating deployment bucket..."
aws s3 mb s3://streamflix-deployment-bucket-$(date +%s) --region $AWS_REGION

# Upload zip to S3
echo "⬆️ Uploading StreamFlix code..."
aws s3 cp streamflix-app.zip s3://streamflix-deployment-bucket-$(date +%s)/streamflix-app.zip

# Create application version
echo "📋 Creating application version..."
aws elasticbeanstalk create-application-version \
  --application-name Strimflix \
  --version-label streamflix-v1.0 \
  --source-bundle S3Bucket=streamflix-deployment-bucket-$(date +%s),S3Key=streamflix-app.zip

# Deploy to environment
echo "🚀 Deploying to environment..."
aws elasticbeanstalk update-environment \
  --environment-name Strimflix-env \
  --version-label streamflix-v1.0

echo "✅ STREAMFLIX DEPLOYMENT COMPLETE!"
echo "🌐 URL: http://strimflix-env.eba-zc7c2qmt.ap-southeast-2.elasticbeanstalk.com/"