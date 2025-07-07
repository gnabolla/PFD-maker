#!/bin/bash

# PDS-Maker Production Deployment Script
# This script handles the deployment of PDS-Maker to production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV="${DEPLOY_ENV:-production}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        log_error ".env file not found. Please create one from .env.example"
        exit 1
    fi
    
    log_info "All requirements satisfied"
}

backup_database() {
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
        log_info "Creating database backup..."
        ./deployment/backup.sh
    else
        log_warn "Skipping database backup (BACKUP_BEFORE_DEPLOY=false)"
    fi
}

pull_latest_images() {
    if [ -n "$DOCKER_REGISTRY" ]; then
        log_info "Pulling latest images from registry..."
        docker pull "${DOCKER_REGISTRY}/pds-maker/api:${IMAGE_TAG}"
        docker pull "${DOCKER_REGISTRY}/pds-maker/web:${IMAGE_TAG}"
    else
        log_info "Building images locally..."
        docker-compose build --parallel
    fi
}

deploy_services() {
    log_info "Deploying services..."
    
    # Stop and remove old containers
    docker-compose down --remove-orphans
    
    # Start services
    if [ "$DEPLOY_ENV" = "production" ]; then
        # Production deployment
        docker-compose -f docker-compose.yml up -d --remove-orphans
    else
        # Development deployment
        docker-compose up -d --remove-orphans
    fi
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    if docker-compose ps | grep -E "unhealthy|Exit"; then
        log_error "Some services are not healthy"
        docker-compose ps
        docker-compose logs --tail=50
        exit 1
    fi
}

run_migrations() {
    log_info "Running database migrations..."
    docker-compose exec -T api npm run migrate
}

health_check() {
    log_info "Performing health checks..."
    
    # Check API health
    if ! curl -f -s http://localhost:3001/api/health > /dev/null; then
        log_error "API health check failed"
        exit 1
    fi
    
    # Check Web health
    if ! curl -f -s http://localhost:3000 > /dev/null; then
        log_error "Web health check failed"
        exit 1
    fi
    
    log_info "All health checks passed"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
}

rollback() {
    log_error "Deployment failed, rolling back..."
    
    # Restore from backup if needed
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ] && [ -f "./backups/latest.sql" ]; then
        log_info "Restoring database from backup..."
        ./deployment/restore.sh ./backups/latest.sql
    fi
    
    # Revert to previous images
    docker-compose down
    docker-compose up -d
    
    exit 1
}

# Main deployment flow
main() {
    log_info "Starting deployment for environment: $DEPLOY_ENV"
    
    # Set trap for rollback on error
    trap rollback ERR
    
    # Execute deployment steps
    check_requirements
    backup_database
    pull_latest_images
    deploy_services
    run_migrations
    health_check
    cleanup
    
    # Remove trap after successful deployment
    trap - ERR
    
    log_info "Deployment completed successfully!"
    
    # Show running services
    docker-compose ps
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            DEPLOY_ENV="$2"
            shift 2
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        --no-backup)
            BACKUP_BEFORE_DEPLOY="false"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --env ENV          Deployment environment (default: production)"
            echo "  --tag TAG          Docker image tag (default: latest)"
            echo "  --registry REG     Docker registry URL"
            echo "  --no-backup        Skip database backup before deployment"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run deployment
main