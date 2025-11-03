# Docker Setup for Slack Clone

This guide will help you run the entire Slack Clone application (Frontend + Backend + MongoDB) using Docker.

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+

### Install Docker Desktop

**Windows:**
1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Run installer
3. Restart computer
4. Open Docker Desktop

**Mac:**
```bash
brew install --cask docker
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Quick Start (One Command)

```powershell
# Clone the repository (if not already)
git clone https://github.com/HTTP-Slack/slack-RL-env.git
cd slack-RL-env

# Start everything with one command
docker-compose up -d
```

That's it! The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **MongoDB:** localhost:27017

## Detailed Setup

### 1. Environment Configuration (Optional)

If you want to use Google OAuth or email features:

```powershell
# Copy example env file
cp .env.example .env

# Edit .env file with your credentials
notepad .env
```

### 2. Build and Start Services

```powershell
# Build images and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 3. Verify Services

Check if all services are running:

```powershell
docker-compose ps
```

You should see:
```
NAME                    STATUS          PORTS
slack-clone-backend     Up (healthy)    0.0.0.0:8080->8080/tcp
slack-clone-frontend    Up (healthy)    0.0.0.0:3000->80/tcp
slack-clone-mongodb     Up (healthy)    0.0.0.0:27017->27017/tcp
```

### 4. Access the Application

1. Open browser to **http://localhost:3000**
2. Click "Create an account"
3. Register with email and password
4. Start using the application!

## Docker Compose Services

### Frontend (React + Nginx)
- **Port:** 3000
- **Technology:** Multi-stage build with Node.js builder and Nginx server
- **Features:** Production-optimized build, static file serving, SPA routing

### Backend (Node.js + Express)
- **Port:** 8080
- **Technology:** Node.js 18 Alpine
- **Features:** REST API, Socket.io, JWT authentication, file uploads

### MongoDB
- **Port:** 27017
- **Version:** 6.0
- **Credentials:**
  - Username: `admin`
  - Password: `admin123`
  - Database: `slack_clone_db`
- **Data Persistence:** Docker volume `mongodb_data`

## Managing the Application

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

### Restart Services

```powershell
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Logs

```powershell
# All logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands in Containers

```powershell
# Access backend container shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123

# Run npm command in backend
docker-compose exec backend npm run dev
```

### Rebuild After Code Changes

```powershell
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

## Database Management

### Access MongoDB

```powershell
# Using MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123 slack_clone_db

# List collections
show collections

# Query users
db.users.find().pretty()

# Count messages
db.messages.countDocuments()
```

### Backup Database

```powershell
# Backup to local directory
docker-compose exec mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/slack_clone_db?authSource=admin" --out=/data/backup

# Copy backup from container
docker cp slack-clone-mongodb:/data/backup ./backup
```

### Restore Database

```powershell
# Copy backup to container
docker cp ./backup slack-clone-mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore --uri="mongodb://admin:admin123@localhost:27017/slack_clone_db?authSource=admin" /data/backup/slack_clone_db
```

### Import Slack Data (from scrapers)

If you have transformed JSONL files from the data scraper:

```powershell
# Copy files to container
docker cp users_transformed.jsonl slack-clone-mongodb:/tmp/
docker cp messages_transformed.jsonl slack-clone-mongodb:/tmp/
docker cp threads_transformed.jsonl slack-clone-mongodb:/tmp/
docker cp conversation_transformed.jsonl slack-clone-mongodb:/tmp/

# Import each collection
docker-compose exec mongodb mongoimport --uri="mongodb://admin:admin123@localhost:27017/slack_clone_db?authSource=admin" --collection=users --file=/tmp/users_transformed.jsonl

docker-compose exec mongodb mongoimport --uri="mongodb://admin:admin123@localhost:27017/slack_clone_db?authSource=admin" --collection=messages --file=/tmp/messages_transformed.jsonl

docker-compose exec mongodb mongoimport --uri="mongodb://admin:admin123@localhost:27017/slack_clone_db?authSource=admin" --collection=threads --file=/tmp/threads_transformed.jsonl

docker-compose exec mongodb mongoimport --uri="mongodb://admin:admin123@localhost:27017/slack_clone_db?authSource=admin" --collection=conversations --file=/tmp/conversation_transformed.jsonl
```

## Environment Variables

### Backend Environment Variables

All configured in `docker-compose.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | Auto-configured | MongoDB connection string |
| `JWT_SECRET` | docker-secret | JWT signing secret (change in production) |
| `SESSION_SECRET` | docker-secret | Session secret (change in production) |
| `PORT` | 8080 | Backend server port |
| `NODE_ENV` | production | Environment mode |
| `CLIENT_URL` | http://localhost:3000 | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | (optional) | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | (optional) | Google OAuth Secret |
| `EMAIL_HOST` | smtp.gmail.com | SMTP host |
| `EMAIL_USER` | (optional) | Email username |
| `EMAIL_PASSWORD` | (optional) | Email password |

### Frontend Environment Variables

Configured during build:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:8080/api | Backend API URL |

## Troubleshooting

### Services Not Starting

```powershell
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs

# Check if ports are available
netstat -ano | findstr "3000"
netstat -ano | findstr "8080"
netstat -ano | findstr "27017"
```

### MongoDB Connection Issues

```powershell
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh -u admin -p admin123 --eval "db.runCommand({ ping: 1 })"
```

### Backend Not Connecting to MongoDB

1. Wait for MongoDB to be healthy: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify MongoDB is accessible: `docker-compose exec backend ping mongodb`

### Frontend Can't Reach Backend

1. Check backend is running: `curl http://localhost:8080/api/users/me`
2. Verify CORS settings in backend
3. Check browser console for errors
4. Ensure API URL is correct: `http://localhost:8080/api`

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr "3000"

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
# frontend:
#   ports:
#     - "3001:80"  # Change 3000 to 3001
```

### Out of Disk Space

```powershell
# Remove unused Docker resources
docker system prune -a

# Remove volumes (WARNING: deletes data)
docker volume prune
```

### Container Crashes on Startup

```powershell
# View crash logs
docker-compose logs backend

# Start in debug mode
docker-compose up backend

# Check container health
docker inspect slack-clone-backend
```

## Production Deployment

### Security Considerations

**Before deploying to production:**

1. **Change Secrets** in `docker-compose.yml`:
   ```yaml
   JWT_SECRET: use-a-long-random-string-here
   SESSION_SECRET: another-long-random-string
   ```

2. **Update MongoDB Credentials**:
   ```yaml
   MONGO_INITDB_ROOT_USERNAME: your_secure_username
   MONGO_INITDB_ROOT_PASSWORD: your_secure_password
   ```

3. **Use Environment Files**:
   ```powershell
   # Create .env file
   JWT_SECRET=your-secret
   SESSION_SECRET=your-session-secret
   MONGO_PASSWORD=your-mongo-password
   
   # Reference in docker-compose.yml
   JWT_SECRET: ${JWT_SECRET}
   ```

4. **Enable HTTPS**: Use reverse proxy (Nginx/Traefik) with SSL certificates

5. **Restrict Ports**: Don't expose MongoDB port externally

### Production docker-compose.yml Example

```yaml
version: '3.8'

services:
  mongodb:
    ports: [] # Don't expose externally
    # ... rest of config
  
  backend:
    environment:
      NODE_ENV: production
      CLIENT_URL: https://yourdomain.com
      MONGO_URI: mongodb://user:${MONGO_PASSWORD}@mongodb:27017/slack_clone_db?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
  
  frontend:
    build:
      args:
        VITE_API_URL: https://api.yourdomain.com
```

## Advanced Configuration

### Custom Network

```yaml
networks:
  slack-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Multiple Environments

```powershell
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Health Checks

All services include health checks:

```powershell
# Check service health
docker inspect --format='{{json .State.Health}}' slack-clone-backend

# View health check logs
docker inspect slack-clone-backend | grep -A 10 Health
```

## Scaling Services

```powershell
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Note: Requires load balancer configuration
```

## Monitoring

### View Resource Usage

```powershell
# Real-time stats
docker stats

# Specific container
docker stats slack-clone-backend
```

### Export Logs

```powershell
# Export all logs
docker-compose logs > application.log

# Export backend logs
docker-compose logs backend > backend.log
```

## Cleanup

### Remove Everything

```powershell
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (WARNING: deletes database)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker-compose down -v --rmi all
docker system prune -a --volumes
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and start
        run: |
          docker-compose build
          docker-compose up -d
```

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify all services are healthy: `docker-compose ps`
3. Review this documentation
4. Open GitHub issue with logs and error messages

---

**Happy Dockerizing! 🐳**
