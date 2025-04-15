# Use an official Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the app files
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
