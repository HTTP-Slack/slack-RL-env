# MongoDB Setup Guide

## Prerequisites

The backend requires MongoDB to be running. Follow these steps to set up MongoDB on macOS.

## Option 1: Install via Homebrew (Recommended)

### Step 1: Update Command Line Tools (if needed)

If you get an error about outdated Command Line Tools, update them:

```bash
# Remove old Command Line Tools
sudo rm -rf /Library/Developer/CommandLineTools

# Install/Update Command Line Tools
sudo xcode-select --install
```

Alternatively, download from: https://developer.apple.com/download/all/

### Step 2: Install MongoDB

```bash
# Add MongoDB tap (if not already added)
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@8.0

# Or install version 7.0 if 8.0 fails
brew install mongodb-community@7.0
```

### Step 3: Start MongoDB

```bash
# Start MongoDB as a service (runs automatically on boot)
brew services start mongodb-community@8.0

# Or start MongoDB manually (one-time)
mongod --config /opt/homebrew/etc/mongod.conf
```

### Step 4: Verify MongoDB is Running

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Or test connection
mongosh mongodb://localhost:27017
```

## Option 2: Install MongoDB using Docker

If Homebrew installation fails, you can use Docker:

```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:latest

# Verify it's running
docker ps | grep mongodb
```

## Option 3: MongoDB Atlas (Cloud - Free Tier)

For a cloud-based solution:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free cluster
4. Get your connection string
5. Update `.env` file with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=slack-clone-dev
```

## Configuration

The backend is configured to use:
- **MongoDB URI**: `mongodb://localhost:27017`
- **Database Name**: `slack-clone-dev`

These are set in `/backend/legacy-backend/.env`

## Verify Setup

After starting MongoDB, restart the backend server:

```bash
cd backend/legacy-backend
npm start
```

You should see: `MongoDB connected: <hostname>` in the logs.

## Troubleshooting

### MongoDB won't start

```bash
# Check MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log

# Check if port 27017 is already in use
lsof -i :27017

# Create data directory if it doesn't exist
sudo mkdir -p /opt/homebrew/var/mongodb
sudo chown -R $(whoami) /opt/homebrew/var/mongodb
```

### Connection refused

- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check MongoDB is listening: `lsof -i :27017`
- Verify the connection string in `.env` matches your setup

## Useful Commands

```bash
# Stop MongoDB
brew services stop mongodb-community@8.0

# Restart MongoDB
brew services restart mongodb-community@8.0

# Connect to MongoDB shell
mongosh mongodb://localhost:27017

# List databases
mongosh mongodb://localhost:27017 --eval "db.adminCommand('listDatabases')"

# Use specific database
mongosh mongodb://localhost:27017/slack-clone-dev
```





