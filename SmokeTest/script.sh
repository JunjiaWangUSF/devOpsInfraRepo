#!/bin/bash


# Pause the script for 30 seconds to allow services to start
sleep 30

# Perform a curl request to check if frontend serves content correctly
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$STATUS_CODE" -eq 200 ]; then
    echo "Server responded with HTTP 200. Proceeding to push images to new ECR repository."

    # Define new ECR repositories
    NEW_FRONTEND_ECR="377816764053.dkr.ecr.us-east-1.amazonaws.com/frontend-host:latest"
    NEW_BACKEND_ECR="377816764053.dkr.ecr.us-east-1.amazonaws.com/backend-host:latest"

    # Tag and push frontend image using sudo
    sudo docker tag 377816764053.dkr.ecr.us-east-1.amazonaws.com/frontend:latest $NEW_FRONTEND_ECR
    sudo docker push $NEW_FRONTEND_ECR

    # Tag and push backend image using sudo
    sudo docker tag 377816764053.dkr.ecr.us-east-1.amazonaws.com/backend:latest $NEW_BACKEND_ECR
    sudo docker push $NEW_BACKEND_ECR

    echo "Images have been pushed to new ECR repositories."
else
    echo "Server response was not HTTP 200. Not pushing images."
fi

# Optionally stop services
sudo docker-compose down
