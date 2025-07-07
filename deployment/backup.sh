#!/bin/bash

# PDS-Maker Database Backup Script
# This script creates backups of the PostgreSQL database

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="pds-maker_postgres_1"

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

create_backup_directory() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

check_database_connection() {
    log_info "Checking database connection..."
    
    if ! docker-compose exec -T postgres pg_isready -U "${DB_USER:-pds_user}" > /dev/null 2>&1; then
        log_error "Cannot connect to database"
        exit 1
    fi
    
    log_info "Database connection successful"
}

create_backup() {
    local backup_file="${BACKUP_DIR}/pds_maker_${TIMESTAMP}.sql"
    local backup_archive="${backup_file}.gz"
    
    log_info "Creating database backup..."
    
    # Create SQL dump
    if docker-compose exec -T postgres pg_dump \
        -U "${DB_USER:-pds_user}" \
        -d "${DB_NAME:-pds_maker}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-acl \
        --verbose > "$backup_file"; then
        
        log_info "Database dump created successfully"
        
        # Compress the backup
        log_info "Compressing backup..."
        gzip "$backup_file"
        
        # Create symlink to latest backup
        ln -sf "$(basename "$backup_archive")" "${BACKUP_DIR}/latest.sql.gz"
        
        # Get backup size
        local size=$(du -h "$backup_archive" | cut -f1)
        log_info "Backup created: $backup_archive (Size: $size)"
        
        # Create backup metadata
        cat > "${backup_archive}.meta" <<EOF
{
    "timestamp": "$TIMESTAMP",
    "database": "${DB_NAME:-pds_maker}",
    "size": "$size",
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "docker_image": "$(docker-compose images postgres | tail -n 1 | awk '{print $2}')"
}
EOF
        
    else
        log_error "Failed to create database backup"
        exit 1
    fi
}

backup_uploads() {
    local uploads_dir="./uploads"
    local uploads_backup="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"
    
    if [ -d "$uploads_dir" ] && [ "$(ls -A $uploads_dir)" ]; then
        log_info "Backing up uploaded files..."
        
        tar -czf "$uploads_backup" -C "$(dirname "$uploads_dir")" "$(basename "$uploads_dir")"
        
        local size=$(du -h "$uploads_backup" | cut -f1)
        log_info "Uploads backup created: $uploads_backup (Size: $size)"
    else
        log_warn "No uploaded files to backup"
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (retention: $BACKUP_RETENTION_DAYS days)..."
    
    # Find and delete old database backups
    find "$BACKUP_DIR" -name "pds_maker_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "pds_maker_*.sql.gz.meta" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
    
    # Find and delete old upload backups
    find "$BACKUP_DIR" -name "uploads_*.tar.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
    
    # Count remaining backups
    local count=$(find "$BACKUP_DIR" -name "pds_maker_*.sql.gz" -type f | wc -l)
    log_info "Remaining backups: $count"
}

verify_backup() {
    local latest_backup="${BACKUP_DIR}/latest.sql.gz"
    
    if [ ! -f "$latest_backup" ]; then
        log_error "Latest backup not found"
        exit 1
    fi
    
    log_info "Verifying backup integrity..."
    
    # Test gzip integrity
    if gzip -t "$latest_backup"; then
        log_info "Backup integrity verified"
    else
        log_error "Backup file is corrupted"
        exit 1
    fi
}

send_notification() {
    # This function can be extended to send notifications via email, Slack, etc.
    local status=$1
    local message=$2
    
    if [ "$status" = "success" ]; then
        log_info "Backup notification: $message"
    else
        log_error "Backup notification: $message"
    fi
    
    # Example: Send to webhook
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"PDS-Maker Backup: $message\"}" \
    #     "$SLACK_WEBHOOK_URL" 2>/dev/null || true
}

# Main backup flow
main() {
    log_info "Starting database backup process..."
    
    # Execute backup steps
    create_backup_directory
    check_database_connection
    create_backup
    backup_uploads
    cleanup_old_backups
    verify_backup
    
    # Send success notification
    send_notification "success" "Database backup completed successfully"
    
    log_info "Backup process completed!"
    
    # List recent backups
    log_info "Recent backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz | tail -5
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        --retention)
            BACKUP_RETENTION_DAYS="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dir DIR              Backup directory (default: ./backups)"
            echo "  --retention DAYS       Backup retention in days (default: 7)"
            echo "  --help                 Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run backup
main