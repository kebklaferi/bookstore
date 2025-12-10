# 1️⃣ Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy all source code
COPY . .

# Install dependencies (including TypeScript)
RUN npm install

# Build the project (Vite automatically compiles TS)
RUN npm run build

# 2️⃣ Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
