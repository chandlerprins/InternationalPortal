# Use official Node.js LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose API port
EXPOSE 3447

# Run app
CMD ["npm", "start"]
