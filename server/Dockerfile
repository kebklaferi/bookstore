# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Start the server
CMD ["node", "server.js"]
