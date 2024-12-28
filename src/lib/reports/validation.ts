import { logger } from '../../utils/logger';

export function validateAvatarId(avatarId: string): boolean {
  const avatarIdRegex = /^avtr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return avatarIdRegex.test(avatarId);
}

export function validateReportCounts(warnings: number, kicks: number, mutes: number): boolean {
  return (
    Number.isInteger(warnings) && warnings >= 0 &&
    Number.isInteger(kicks) && kicks >= 0 &&
    Number.isInteger(mutes) && mutes >= 0
  );
}

export function logReportValidation(reportData: any): void {
  logger.info('Validation du rapport:', {
    isValidAvatarId: validateAvatarId(reportData.avatarId),
    isValidCounts: validateReportCounts(
      reportData.warnings,
      reportData.kicks,
      reportData.mutes
    )
  });
}