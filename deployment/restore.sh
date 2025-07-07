#!/bin/bash

# PDS-Maker Database Restore Script
# This script restores PostgreSQL database from backup

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_FILE="${1:-}"
FORCE_RESTORE="${FORCE_RESTORE:-false}"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

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

show_usage() {
    echo "Usage: $0 BACKUP_FILE [OPTIONS]"
    echo ""
    echo "Arguments:"
    echo "  BACKUP_FILE    Path to the backup file (.sql or .sql.gz)"
    echo ""
    echo "Options:"
    echo "  --force        Force restore without confirmation"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 ./backups/pds_maker_20231201_120000.sql.gz"
    echo "  $0 ./backups/latest.sql.gz --force"
}

validate_backup_file() {
    if [ -z "$BACKUP_FILE" ]; then
        log_error "No backup file specified"
        show_usage
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    # Check if it's a gzip file
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        log_info "Validating compressed backup file..."
        if ! gzip -t "$BACKUP_FILE"; then
            log_error "Backup file is corrupted"
            exit 1
        fi
    fi
    
    log_info "Backup file validated: $BACKUP_FILE"
}

check_database_connection() {
    log_info "Checking database connection..."
    
    if ! docker-compose exec -T postgres pg_isready -U "${DB_USER:-pds_user}" > /dev/null 2>&1; then
        log_error "Cannot connect to database. Is PostgreSQL running?"
        exit 1
    fi
    
    log_info "Database connection successful"
}

confirm_restore() {
    if [ "$FORCE_RESTORE" = "true" ]; then
        return 0
    fi
    
    log_warn "WARNING: This will OVERWRITE the current database!"
    log_warn "Database: ${DB_NAME:-pds_maker}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

create_temp_backup() {
    log_info "Creating temporary backup of current database..."
    
    local temp_backup="/tmp/pds_maker_temp_$(date +%s).sql"
    
    if docker-compose exec -T postgres pg_dump \
        -U "${DB_USER:-pds_user}" \
        -d "${DB_NAME:-pds_maker}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-acl > "$temp_backup"; then
        
        log_info "Temporary backup created: $temp_backup"
        echo "$temp_backup"
    else
        log_error "Failed to create temporary backup"
        exit 1
    fi
}

stop_api_services() {
    log_info "Stopping API services..."
    docker-compose stop api web nginx || true
    sleep 5
}

restore_database() {
    local sql_file="$1"
    
    log_info "Restoring database from backup..."
    
    # Handle compressed files
    if [[ "$sql_file" == *.gz ]]; then
        log_info "Decompressing backup file..."
        if gunzip -c "$sql_file" | docker-compose exec -T postgres psql \
            -U "${DB_USER:-pds_user}" \
            -d "${DB_NAME:-pds_maker}" \
            --single-transaction \
            --set ON_ERROR_STOP=on; then
            
            log_info "Database restored successfully"
        else
            log_error "Failed to restore database"
            return 1
        fi
    else
        # Handle uncompressed files
        if docker-compose exec -T postgres psql \
            -U "${DB_USER:-pds_user}" \
            -d "${DB_NAME:-pds_maker}" \
            --single-transaction \
            --set ON_ERROR_STOP=on < "$sql_file"; then
            
            log_info "Database restored successfully"
        else
            log_error "Failed to restore database"
            return 1
        fi
    fi
}

restore_uploads() {
    local backup_dir=$(dirname "$BACKUP_FILE")
    local timestamp=$(basename "$BACKUP_FILE" | sed 's/pds_maker_\(.*\)\.sql.*/\1/')
    local uploads_backup="${backup_dir}/uploads_${timestamp}.tar.gz"
    
    if [ -f "$uploads_backup" ]; then
        log_info "Found uploads backup: $uploads_backup"
        read -p "Do you want to restore uploaded files as well? (yes/no): " -r
        
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Restoring uploaded files..."
            
            # Backup current uploads
            if [ -d "./uploads" ] && [ "$(ls -A ./uploads)" ]; then
                mv ./uploads "./uploads.bak.$(date +%s)"
            fi
            
            # Extract uploads
            tar -xzf "$uploads_backup" -C .
            
            log_info "Uploaded files restored"
        fi
    else
        log_info "No uploads backup found for this database backup"
    fi
}

start_api_services() {
    log_info "Starting API services..."
    docker-compose start api web nginx
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
}

verify_restore() {
    log_info "Verifying restored database..."
    
    # Check if we can connect and query
    if docker-compose exec -T postgres psql \
        -U "${DB_USER:-pds_user}" \
        -d "${DB_NAME:-pds_maker}" \
        -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
        
        log_info "Database verification successful"
    else
        log_error "Database verification failed"
        return 1
    fi
    
    # Check API health
    if curl -f -s http://localhost:3001/api/health > /dev/null; then
        log_info "API health check passed"
    else
        log_warn "API health check failed - may need more time to start"
    fi
}

rollback_restore() {
    local temp_backup="$1"
    
    log_error "Restore failed! Rolling back..."
    
    if [ -f "$temp_backup" ]; then
        restore_database "$temp_backup"
        rm -f "$temp_backup"
        log_info "Rollback completed"
    else
        log_error "Cannot rollback - temporary backup not found"
    fi
}

# Main restore flow
main() {
    log_info "Starting database restore process..."
    
    # Validate backup file
    validate_backup_file
    
    # Check database connection
    check_database_connection
    
    # Confirm restore
    confirm_restore
    
    # Create temporary backup
    TEMP_BACKUP=$(create_temp_backup)
    
    # Stop services
    stop_api_services
    
    # Perform restore
    if restore_database "$BACKUP_FILE"; then
        # Restore uploads if available
        restore_uploads
        
        # Start services
        start_api_services
        
        # Verify restore
        if verify_restore; then
            log_info "Database restore completed successfully!"
            
            # Clean up temporary backup
            rm -f "$TEMP_BACKUP"
        else
            rollback_restore "$TEMP_BACKUP"
            exit 1
        fi
    else
        rollback_restore "$TEMP_BACKUP"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_RESTORE="true"
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                log_error "Unknown option: $1"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Run restore
main