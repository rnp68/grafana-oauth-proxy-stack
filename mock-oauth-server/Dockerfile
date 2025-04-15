FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy and install
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
