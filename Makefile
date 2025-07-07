# PDS-Maker Makefile
# Common commands for development and deployment

.PHONY: help install dev build test deploy clean backup restore health-check

# Default target
help:
	@echo "PDS-Maker - Available Commands"
	@echo "=============================="
	@echo "Development:"
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Start development environment"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linters"
	@echo "  make format       - Format code"
	@echo ""
	@echo "Docker:"
	@echo "  make build        - Build Docker images"
	@echo "  make up           - Start all services"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - Show service logs"
	@echo "  make ps           - Show running containers"
	@echo ""
	@echo "Database:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database"
	@echo "  make backup       - Backup database"
	@echo "  make restore      - Restore database from backup"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy       - Deploy to production"
	@echo "  make health-check - Run health checks"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make clean-all    - Clean everything including volumes"

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm install
	@cd api && npm install
	@cd web && npm install
	@echo "Dependencies installed successfully!"

# Development environment
dev:
	@echo "Starting development environment..."
	@docker-compose up -d postgres redis
	@sleep 5
	@cd api && npm run migrate
	@npm run dev

dev-docker:
	@echo "Starting development environment with Docker..."
	@docker-compose up

# Build Docker images
build:
	@echo "Building Docker images..."
	@docker-compose build --parallel

build-prod:
	@echo "Building production Docker images..."
	@docker-compose -f docker-compose.yml build --parallel

# Start services
up:
	@echo "Starting services..."
	@docker-compose up -d
	@echo "Services started. Waiting for health checks..."
	@sleep 10
	@docker-compose ps

up-prod:
	@echo "Starting production services..."
	@docker-compose -f docker-compose.yml up -d

# Stop services
down:
	@echo "Stopping services..."
	@docker-compose down

down-all:
	@echo "Stopping services and removing volumes..."
	@docker-compose down -v

# Show logs
logs:
	@docker-compose logs -f

logs-api:
	@docker-compose logs -f api

logs-web:
	@docker-compose logs -f web

# Show running containers
ps:
	@docker-compose ps

# Run tests
test:
	@echo "Running all tests..."
	@cd api && npm test
	@cd web && npm test -- --watchAll=false

test-api:
	@echo "Running API tests..."
	@cd api && npm test

test-web:
	@echo "Running web tests..."
	@cd web && npm test -- --watchAll=false

test-ci:
	@echo "Running tests in CI mode..."
	@cd api && npm run test:coverage
	@cd web && npm test -- --coverage --watchAll=false

# Linting
lint:
	@echo "Running linters..."
	@cd api && npm run lint
	@cd web && npm run lint

lint-fix:
	@echo "Fixing lint issues..."
	@cd api && npm run lint:fix
	@cd web && npm run lint:fix

# Code formatting
format:
	@echo "Formatting code..."
	@cd web && npm run format

# Database operations
migrate:
	@echo "Running database migrations..."
	@docker-compose exec api npm run migrate

migrate-rollback:
	@echo "Rolling back last migration..."
	@docker-compose exec api npm run migrate:rollback

seed:
	@echo "Seeding database..."
	@docker-compose exec api npm run seed

db-reset:
	@echo "Resetting database..."
	@docker-compose exec api npm run migrate:rollback
	@docker-compose exec api npm run migrate
	@docker-compose exec api npm run seed

# Backup and restore
backup:
	@echo "Creating database backup..."
	@./deployment/backup.sh

restore:
	@echo "Restoring database from backup..."
	@./deployment/restore.sh ./backups/latest.sql.gz

# Health check
health-check:
	@echo "Running health checks..."
	@./deployment/health-check.sh

health-check-continuous:
	@echo "Starting continuous health monitoring..."
	@./deployment/health-check.sh --continuous

# Deployment
deploy:
	@echo "Deploying to production..."
	@./deployment/deploy.sh

deploy-staging:
	@echo "Deploying to staging..."
	@./deployment/deploy.sh --env staging

# Clean up
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf api/dist
	@rm -rf web/build
	@rm -rf api/coverage
	@rm -rf web/coverage
	@docker image prune -f

clean-all: clean
	@echo "Cleaning everything including volumes..."
	@docker-compose down -v
	@docker system prune -af --volumes
	@rm -rf node_modules
	@rm -rf api/node_modules
	@rm -rf web/node_modules

# Docker utilities
shell-api:
	@docker-compose exec api sh

shell-web:
	@docker-compose exec web sh

shell-db:
	@docker-compose exec postgres psql -U pds_user -d pds_maker

# Environment setup
env-setup:
	@echo "Setting up environment files..."
	@cp -n .env.example .env || true
	@cp -n api/.env.example api/.env || true
	@echo "Environment files created. Please update them with your values."

# Security scan
security-scan:
	@echo "Running security scan..."
	@cd api && npm audit
	@cd web && npm audit

# Documentation
docs:
	@echo "Generating API documentation..."
	@cd api && npm run docs
	@echo "API documentation generated at api/docs/swagger.json"

# Version info
version:
	@echo "PDS-Maker Version Information"
	@echo "============================="
	@echo "API Version: $$(cd api && node -p "require('./package.json').version")"
	@echo "Web Version: $$(cd web && node -p "require('./package.json').version")"
	@echo "Node Version: $$(node --version)"
	@echo "NPM Version: $$(npm --version)"
	@echo "Docker Version: $$(docker --version)"
	@echo "Docker Compose Version: $$(docker-compose --version)"