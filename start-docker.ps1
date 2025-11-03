# Slack Clone - Docker Startup Script (Windows)
# This script builds and starts all services

Write-Host "🚀 Starting Slack Clone Application..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if docker-compose is available
$composeAvailable = Get-Command docker-compose -ErrorAction SilentlyContinue
if (-not $composeAvailable) {
    Write-Host "❌ docker-compose not found. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker Compose is available" -ForegroundColor Green
Write-Host ""

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Build and start services
Write-Host "🏗️  Building and starting services..." -ForegroundColor Cyan
docker-compose up -d --build

# Wait for services to be healthy
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Display access information
Write-Host "✅ Application is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "   MongoDB:   localhost:27017" -ForegroundColor White
Write-Host ""
Write-Host "📝 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Stop application:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
