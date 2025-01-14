# Use an official Node.js runtime as a parent image
FROM node:22.12.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the data folder
COPY data /usr/src/app/data

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]