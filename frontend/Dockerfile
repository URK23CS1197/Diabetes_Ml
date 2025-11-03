# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
#docekr_file
# Fix executable permissions for react-scripts and other binaries
RUN chmod -R +x ./node_modules/.bin

RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
