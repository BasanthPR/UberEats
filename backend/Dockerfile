FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories for uploads
RUN mkdir -p uploads/profile-pictures
RUN mkdir -p uploads/dishes

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "server.js"] 