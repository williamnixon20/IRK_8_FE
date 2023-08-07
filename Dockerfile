# Use the official Node.js image as the base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the frontend application source code and package.json/package-lock.json files to the container's working directory
COPY package*.json ./
COPY src ./src  
COPY public ./public  
# Install dependencies
RUN npm install --no-package-lock

# RUN npm run build
# Expose the port the frontend will run on (adjust if necessary based on your React app's configuration)
EXPOSE 3000

# Command to run the frontend application
CMD ["npm", "start"]
