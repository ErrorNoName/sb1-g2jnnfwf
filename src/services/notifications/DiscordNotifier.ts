import { logger } from '../../utils/logger';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321336645949198336/fYlINgJl1_LsKNL_a1DnTytQtURFD0uvKjU5JXqdEtKXc3821dtTOqIZ6C_TzxcysQQN';

export class DiscordNotifier {
  static async sendBookingNotification(params: {
    date: Date;
    hostDiscordId: string;
    guestDiscordId: string;
    roomNumber: number;
  }) {
    const { date, hostDiscordId, guestDiscordId, roomNumber } = params;

    const message = {
      embeds: [{
        title: '📅 Nouveau rendez-vous réservé !',
        color: 0x5865F2,
        fields: [
          {
            name: 'Date',
            value: date.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            inline: true
          },
          {
            name: 'Heure',
            value: date.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            inline: true
          },
          {
            name: 'Salle VRChat',
            value: `#${roomNumber}`,
            inline: true
          },
          {
            name: 'Personne disponible',
            value: hostDiscordId,
            inline: true
          },
          {
            name: 'Réservé par',
            value: guestDiscordId,
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      logger.info('Discord notification sent', { hostDiscordId, guestDiscordId });
    } catch (error) {
      logger.error('Failed to send Discord notification', { error });
      throw error;
    }
  }
}