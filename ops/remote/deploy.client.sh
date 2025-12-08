#/bin/bash

docker build kernel/client --platform linux/amd64 --file ops/remote/Dockerfile.client --build-arg NEXT_PUBLIC_LEAP360_API_BASE_URL=https://leap360-api-105504536528.us-central1.run.app --tag us-central1-docker.pkg.dev/personal-337811/leap360/client:latest
if [ $? -ne 0 ]; then exit 1; fi

docker push us-central1-docker.pkg.dev/personal-337811/leap360/client:latest
if [ $? -ne 0 ]; then exit 1; fi

gcloud run deploy leap360-client --region us-central1 --image us-central1-docker.pkg.dev/personal-337811/leap360/client:latest
