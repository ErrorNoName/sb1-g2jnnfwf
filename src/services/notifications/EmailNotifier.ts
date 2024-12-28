import { logger } from '../../utils/logger';

export class EmailNotifier {
  static async sendBookingConfirmation(params: {
    date: Date;
    hostDiscordId: string;
    guestDiscordId: string;
    roomNumber: number;
  }) {
    const { date, hostDiscordId, guestDiscordId, roomNumber } = params;

    // TODO: Implement actual email sending
    logger.info('Email notification sent', {
      date,
      hostDiscordId,
      guestDiscordId,
      roomNumber
    });
  }
}