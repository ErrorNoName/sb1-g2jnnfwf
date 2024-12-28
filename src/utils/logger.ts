import { LogLevel } from '../types/logger';
import { LoggingService } from '../services/loggingService';
import type { SeverityLevel } from '../types/logging';

class Logger {
  private static instance: Logger;
  private loggingService: LoggingService;
  
  private constructor() {
    this.loggingService = LoggingService.getInstance();
  }
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    
    // Console logging
    console[level.toLowerCase()]({
      timestamp,
      level,
      message,
      data
    });

    // Persist to Supabase
    if (import.meta.env.PROD) {
      this.loggingService.createLog({
        log_type: 'SYSTEM',
        severity_level: level as SeverityLevel,
        description: message,
        source: 'APP',
        metadata: data
      }).catch(error => {
        console.error('Failed to persist log:', error);
      });
    }
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARNING', message, data);
  }

  error(message: string, data?: any) {
    this.log('ERROR', message, data);
  }
}

export const logger = Logger.getInstance();