# Use official Node.js LTS slim image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock if present
COPY package*.json ./

# Install only production dependencies to keep image small
RUN npm ci --only=production

# Copy app source
COPY . .

# Use a non-root user for security
RUN useradd --user-group --create-home --shell /bin/false appuser \
  && chown -R appuser:appuser /usr/src/app
USER appuser

# Expose default port for local Docker (backend uses PORT env var)
EXPOSE 5000

# Default NODE_ENV for production
ENV NODE_ENV=production

# Start the server. The app listens on process.env.PORT if provided by the environment.
CMD ["node", "src/server.js"]
