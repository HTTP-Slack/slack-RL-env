# Quick Start - Docker Edition

Run the entire Slack Clone application with one command!

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+

### Install Docker Desktop

**Windows:** Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

**Mac:**
```bash
brew install --cask docker
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 🚀 Start Application (One Command)

```powershell
# Clone and start
git clone https://github.com/HTTP-Slack/slack-RL-env.git
cd slack-RL-env
docker-compose up -d
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **MongoDB:** localhost:27017 (admin/admin123)

## 📊 Manage Services

```powershell
# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

## 🔧 Optional Configuration

For Google OAuth or email features, create `.env` file:

```bash
cp .env.example .env
# Edit .env with your credentials
```

## 📚 Full Documentation

See **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** for:
- Detailed setup instructions
- Database management
- Troubleshooting guide
- Production deployment
- Advanced configuration

---

**That's it! Start coding! 🎉**
