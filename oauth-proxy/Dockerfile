FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache wget
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
