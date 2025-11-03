#!/bin/bash

# Slack Clone - Docker Startup Script
# This script builds and starts all services

echo "🚀 Starting Slack Clone Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down
echo ""

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""

# Display access information
echo "✅ Application is ready!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8080"
echo "   MongoDB:   localhost:27017"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop application:"
echo "   docker-compose down"
echo ""
echo "Happy coding! 🎉"
