#/bin/bash

docker build kernel/web --platform linux/amd64 --file ops/remote/Dockerfile.web --tag us-central1-docker.pkg.dev/personal-337811/leap360/api:latest
if [ $? -ne 0 ]; then exit 1; fi

docker push us-central1-docker.pkg.dev/personal-337811/leap360/api:latest
if [ $? -ne 0 ]; then exit 1; fi

gcloud run deploy leap360-api --region us-central1 --image us-central1-docker.pkg.dev/personal-337811/leap360/api:latest
