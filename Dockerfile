# Stage 0 - Build
FROM node:12-alpine as builder

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
# Copy contents
COPY . ./

# Build

RUN yarn build

# Stage 1 - Pack
FROM node:12-alpine 

# Install requirements
RUN yarn global add serve

COPY --from=builder ./build ./build

EXPOSE 5000

# Run application
ENTRYPOINT ["serve","-s","build"]

