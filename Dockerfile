FROM node:22-alpine3.19

# Create app directory
WORKDIR /app
# Copy the dist folder into the container
COPY ./package*.json .

RUN npm install --production

COPY ./dist/ .
# Run the project when the container runs
CMD [ "node", "index.js" ]

LABEL com.docker.compose.project=vsdbmv2-worker