#!/bin/bash

# Install AWS CLI
sudo apt-get update -y
sudo apt-get install -y awscli

# Load AWS ECR login
aws ecr get-login-password --region ${{ secrets.AWS_REGION }} | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com

# Explicitly pull the latest images
docker-compose pull

# Start services with Docker Compose
docker-compose up -d

# Pause the script for 30 seconds to allow services to start
sleep 30

# Perform a curl request to check if frontend serves content correctly
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "Server responded with HTTP 200. Proceeding to push images to new ECR repository."

    # Define new ECR repositories (modify these according to your needs)
    NEW_FRONTEND_ECR="${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/frontend-host:latest"
    NEW_BACKEND_ECR="${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/backend-host:latest"

    # Tag and push frontend image
    docker tag ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/frontend:latest $NEW_FRONTEND_ECR
    docker push $NEW_FRONTEND_ECR

    # Tag and push backend image
    docker tag ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/backend:latest $NEW_BACKEND_ECR
    docker push $NEW_BACKEND_ECR

    echo "Images have been pushed to new ECR repositories."
else
    echo "Server response was not HTTP 200. Not pushing images."
fi

# Optionally stop services
docker-compose down