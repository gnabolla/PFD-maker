#!/bin/bash

# PDS-Maker Health Check and Monitoring Script
# This script monitors the health of all PDS-Maker services

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"
LOG_FILE="${LOG_FILE:-./logs/health-check.log}"

# Service endpoints
API_URL="${API_URL:-http://localhost:3001}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

# Thresholds
CPU_THRESHOLD="${CPU_THRESHOLD:-80}"
MEMORY_THRESHOLD="${MEMORY_THRESHOLD:-80}"
DISK_THRESHOLD="${DISK_THRESHOLD:-90}"
RESPONSE_TIME_THRESHOLD="${RESPONSE_TIME_THRESHOLD:-1000}" # milliseconds

# Functions
log_info() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] [INFO] $1"
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "$message" >> "$LOG_FILE"
}

log_warn() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] [WARN] $1"
    echo -e "${YELLOW}[WARN]${NC} $1"
    echo "$message" >> "$LOG_FILE"
}

log_error() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $1"
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$message" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_failure() {
    echo -e "${RED}✗${NC} $1"
}

send_alert() {
    local level="$1"
    local service="$2"
    local message="$3"
    
    log_error "ALERT [$level]: $service - $message"
    
    # Send to webhook if configured
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"level\": \"$level\",
                \"service\": \"$service\",
                \"message\": \"$message\",
                \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
            }" \
            "$ALERT_WEBHOOK" 2>/dev/null || true
    fi
}

check_api_health() {
    echo -e "\n${BLUE}Checking API Service...${NC}"
    
    # Basic health check
    local start_time=$(date +%s%3N)
    if response=$(curl -s -w "\n%{http_code}" "$API_URL/api/health" 2>/dev/null); then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        local http_code=$(echo "$response" | tail -n1)
        local body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" = "200" ]; then
            log_success "API health check passed (${response_time}ms)"
            
            # Check response time
            if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
                log_warn "API response time is high: ${response_time}ms"
                send_alert "WARNING" "API" "High response time: ${response_time}ms"
            fi
        else
            log_failure "API health check failed (HTTP $http_code)"
            send_alert "CRITICAL" "API" "Health check failed with HTTP $http_code"
            return 1
        fi
    else
        log_failure "API is not responding"
        send_alert "CRITICAL" "API" "Service is not responding"
        return 1
    fi
    
    # Check specific endpoints
    local endpoints=(
        "/api/auth/login:POST"
        "/api/pds:GET"
    )
    
    for endpoint_method in "${endpoints[@]}"; do
        local endpoint="${endpoint_method%:*}"
        local method="${endpoint_method#*:}"
        
        if curl -s -X "$method" -o /dev/null -w "%{http_code}" "$API_URL$endpoint" | grep -qE "^(200|401|404)$"; then
            log_success "Endpoint $endpoint is accessible"
        else
            log_failure "Endpoint $endpoint is not accessible"
        fi
    done
}

check_web_health() {
    echo -e "\n${BLUE}Checking Web Service...${NC}"
    
    # Basic health check
    local start_time=$(date +%s%3N)
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL" 2>/dev/null); then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        if [ "$response" = "200" ]; then
            log_success "Web service is accessible (${response_time}ms)"
            
            # Check response time
            if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
                log_warn "Web response time is high: ${response_time}ms"
            fi
        else
            log_failure "Web service returned HTTP $response"
            send_alert "CRITICAL" "Web" "Service returned HTTP $response"
            return 1
        fi
    else
        log_failure "Web service is not responding"
        send_alert "CRITICAL" "Web" "Service is not responding"
        return 1
    fi
    
    # Check static assets
    if curl -s -o /dev/null -w "%{http_code}" "$WEB_URL/static/js/main.js" | grep -q "200\|304"; then
        log_success "Static assets are accessible"
    else
        log_failure "Static assets are not accessible"
    fi
}

check_database_health() {
    echo -e "\n${BLUE}Checking Database Service...${NC}"
    
    # Check PostgreSQL connection
    if docker-compose exec -T postgres pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
        log_success "PostgreSQL is accepting connections"
        
        # Check database size
        local db_size=$(docker-compose exec -T postgres psql -U "${DB_USER:-pds_user}" -d "${DB_NAME:-pds_maker}" -t -c "SELECT pg_size_pretty(pg_database_size('${DB_NAME:-pds_maker}'));" 2>/dev/null | xargs)
        log_info "Database size: $db_size"
        
        # Check active connections
        local active_connections=$(docker-compose exec -T postgres psql -U "${DB_USER:-pds_user}" -d "${DB_NAME:-pds_maker}" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | xargs)
        log_info "Active connections: $active_connections"
        
    else
        log_failure "PostgreSQL is not responding"
        send_alert "CRITICAL" "Database" "PostgreSQL is not responding"
        return 1
    fi
}

check_redis_health() {
    echo -e "\n${BLUE}Checking Redis Service...${NC}"
    
    # Check Redis connection
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis is responding to PING"
        
        # Get Redis info
        local redis_memory=$(docker-compose exec -T redis redis-cli INFO memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
        local redis_clients=$(docker-compose exec -T redis redis-cli INFO clients | grep connected_clients | cut -d: -f2 | tr -d '\r')
        
        log_info "Redis memory usage: $redis_memory"
        log_info "Connected clients: $redis_clients"
        
    else
        log_failure "Redis is not responding"
        send_alert "CRITICAL" "Redis" "Redis is not responding"
        return 1
    fi
}

check_docker_containers() {
    echo -e "\n${BLUE}Checking Docker Containers...${NC}"
    
    # Get container status
    local containers=$(docker-compose ps --format json 2>/dev/null || echo "[]")
    
    # Check each container
    for service in postgres redis api web nginx; do
        if docker-compose ps "$service" 2>/dev/null | grep -q "Up"; then
            log_success "Container $service is running"
            
            # Get container stats
            local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemPerc}}" "pds-maker_${service}_1" 2>/dev/null | tail -n1)
            if [ -n "$stats" ]; then
                local cpu=$(echo "$stats" | awk '{print $1}' | tr -d '%')
                local mem=$(echo "$stats" | awk '{print $2}' | tr -d '%')
                
                # Check CPU usage
                if (( $(echo "$cpu > $CPU_THRESHOLD" | bc -l) )); then
                    log_warn "Container $service CPU usage is high: ${cpu}%"
                    send_alert "WARNING" "Docker/$service" "High CPU usage: ${cpu}%"
                fi
                
                # Check memory usage
                if (( $(echo "$mem > $MEMORY_THRESHOLD" | bc -l) )); then
                    log_warn "Container $service memory usage is high: ${mem}%"
                    send_alert "WARNING" "Docker/$service" "High memory usage: ${mem}%"
                fi
            fi
        else
            log_failure "Container $service is not running"
            send_alert "CRITICAL" "Docker/$service" "Container is not running"
        fi
    done
}

check_disk_space() {
    echo -e "\n${BLUE}Checking Disk Space...${NC}"
    
    # Check disk usage
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    
    if [ "$disk_usage" -lt "$DISK_THRESHOLD" ]; then
        log_success "Disk usage is at ${disk_usage}%"
    else
        log_failure "Disk usage is high: ${disk_usage}%"
        send_alert "WARNING" "System" "High disk usage: ${disk_usage}%"
    fi
    
    # Check specific directories
    for dir in ./uploads ./backups ./logs; do
        if [ -d "$dir" ]; then
            local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            log_info "Directory $dir size: $size"
        fi
    done
}

check_ssl_certificates() {
    echo -e "\n${BLUE}Checking SSL Certificates...${NC}"
    
    # Check if SSL is configured
    if [ -f "./deployment/nginx/ssl/cert.pem" ]; then
        # Check certificate expiration
        local expiry=$(openssl x509 -in "./deployment/nginx/ssl/cert.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry" +%s)
        local current_epoch=$(date +%s)
        local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [ "$days_until_expiry" -gt 30 ]; then
            log_success "SSL certificate valid for $days_until_expiry days"
        elif [ "$days_until_expiry" -gt 0 ]; then
            log_warn "SSL certificate expires in $days_until_expiry days"
            send_alert "WARNING" "SSL" "Certificate expires in $days_until_expiry days"
        else
            log_failure "SSL certificate has expired"
            send_alert "CRITICAL" "SSL" "Certificate has expired"
        fi
    else
        log_info "SSL certificates not configured"
    fi
}

generate_summary() {
    echo -e "\n${BLUE}Health Check Summary${NC}"
    echo "===================="
    echo "Timestamp: $(date)"
    echo "All checks completed"
    
    # Calculate uptime
    if [ -f "/proc/uptime" ]; then
        local uptime=$(awk '{print int($1/86400)"d "int($1%86400/3600)"h "int($1%3600/60)"m"}' /proc/uptime)
        echo "System uptime: $uptime"
    fi
}

continuous_monitoring() {
    log_info "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    
    while true; do
        clear
        echo -e "${BLUE}=== PDS-Maker Health Check ===${NC}"
        echo "$(date)"
        echo ""
        
        # Run all checks
        check_api_health || true
        check_web_health || true
        check_database_health || true
        check_redis_health || true
        check_docker_containers || true
        check_disk_space || true
        check_ssl_certificates || true
        
        generate_summary
        
        echo -e "\nNext check in ${CHECK_INTERVAL} seconds... (Press Ctrl+C to stop)"
        sleep "$CHECK_INTERVAL"
    done
}

# Main function
main() {
    # Create log directory if needed
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Parse command line arguments
    case "${1:-}" in
        --continuous|-c)
            continuous_monitoring
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --continuous, -c    Run continuous monitoring"
            echo "  --help, -h         Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  CHECK_INTERVAL     Interval between checks in seconds (default: 60)"
            echo "  ALERT_WEBHOOK      Webhook URL for alerts"
            echo "  CPU_THRESHOLD      CPU usage threshold in % (default: 80)"
            echo "  MEMORY_THRESHOLD   Memory usage threshold in % (default: 80)"
            echo "  DISK_THRESHOLD     Disk usage threshold in % (default: 90)"
            exit 0
            ;;
        *)
            # Run single check
            echo -e "${BLUE}=== PDS-Maker Health Check ===${NC}"
            echo "$(date)"
            echo ""
            
            check_api_health
            check_web_health
            check_database_health
            check_redis_health
            check_docker_containers
            check_disk_space
            check_ssl_certificates
            
            generate_summary
            ;;
    esac
}

# Run main function
main "$@"