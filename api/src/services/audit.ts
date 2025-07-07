import { knex } from '@/database/knex';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'export' | 'import' | 'validate';
  entityType: 'pds' | 'template' | 'user';
  entityId: string;
  changes?: any;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogInput {
  userId: string;
  action: AuditLog['action'];
  entityType: AuditLog['entityType'];
  entityId: string;
  changes?: any;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  private tableName = 'audit_logs';

  /**
   * Log an action to the audit trail
   */
  async logAction(input: AuditLogInput): Promise<AuditLog> {
    try {
      const auditLog = {
        id: uuidv4(),
        user_id: input.userId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        changes: input.changes ? JSON.stringify(input.changes) : null,
        details: input.details ? JSON.stringify(input.details) : null,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
        created_at: new Date()
      };

      const [created] = await knex(this.tableName)
        .insert(auditLog)
        .returning('*');

      logger.info(`Audit log created: ${created.id} - ${input.action} on ${input.entityType}:${input.entityId} by user ${input.userId}`);

      return this.mapToAuditLog(created);
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error to prevent disrupting the main operation
      return null as any;
    }
  }

  /**
   * Log PDS changes with before/after comparison
   */
  async logPDSChange(userId: string, pdsId: string, action: 'create' | 'update' | 'delete' | 'restore', oldData?: any, newData?: any, request?: any): Promise<void> {
    const changes = this.generateChanges(oldData, newData);
    
    await this.logAction({
      userId,
      action,
      entityType: 'pds',
      entityId: pdsId,
      changes,
      details: {
        title: newData?.title || oldData?.title,
        description: newData?.description || oldData?.description
      },
      ipAddress: request?.ip,
      userAgent: request?.headers?.['user-agent']
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityLogs(entityType: AuditLog['entityType'], entityId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const logs = await knex(this.tableName)
        .where({
          entity_type: entityType,
          entity_id: entityId
        })
        .orderBy('created_at', 'desc')
        .limit(limit);

      return logs.map(this.mapToAuditLog);
    } catch (error) {
      logger.error('Failed to retrieve audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(userId: string, limit: number = 50, offset: number = 0): Promise<AuditLog[]> {
    try {
      const logs = await knex(this.tableName)
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return logs.map(this.mapToAuditLog);
    } catch (error) {
      logger.error('Failed to retrieve user audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by action type
   */
  async getLogsByAction(action: AuditLog['action'], limit: number = 50, offset: number = 0): Promise<AuditLog[]> {
    try {
      const logs = await knex(this.tableName)
        .where({ action })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return logs.map(this.mapToAuditLog);
    } catch (error) {
      logger.error('Failed to retrieve audit logs by action:', error);
      throw error;
    }
  }

  /**
   * Get audit logs within a date range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date, filters?: Partial<AuditLog>): Promise<AuditLog[]> {
    try {
      let query = knex(this.tableName)
        .whereBetween('created_at', [startDate, endDate])
        .orderBy('created_at', 'desc');

      if (filters?.userId) {
        query = query.where('user_id', filters.userId);
      }
      if (filters?.entityType) {
        query = query.where('entity_type', filters.entityType);
      }
      if (filters?.action) {
        query = query.where('action', filters.action);
      }

      const logs = await query;
      return logs.map(this.mapToAuditLog);
    } catch (error) {
      logger.error('Failed to retrieve audit logs by date range:', error);
      throw error;
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await knex(this.tableName)
        .where('created_at', '<', cutoffDate)
        .delete();

      logger.info(`Cleaned up ${deletedCount} audit logs older than ${retentionDays} days`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old audit logs:', error);
      throw error;
    }
  }

  /**
   * Generate a diff of changes between old and new data
   */
  private generateChanges(oldData: any, newData: any): any {
    if (!oldData) return { created: newData };
    if (!newData) return { deleted: oldData };

    const changes: any = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key]
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Map database row to AuditLog interface
   */
  private mapToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      changes: row.changes ? JSON.parse(row.changes) : undefined,
      details: row.details ? JSON.parse(row.details) : undefined,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    };
  }
}

// Export singleton instance
export const auditService = new AuditService();