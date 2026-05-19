// src/modules/logs/log.types.ts

export interface AuditLogView {
  id: string;
  action: string;
  target: string;
  timestamp: Date;
  user: {
    name: string;
    username: string;
  };
}