// Slack/Telegram service abstraction
// Direct API calls are forbidden in client code - always use proxy
export class NotificationService {
    async sendSlackMessage(channel: string, message: string) {
        // Future: POST to /api/slack/send
        console.log(`Slack [${channel}]: ${message}`);
    }

    async sendTelegramMessage(chatId: string, message: string) {
        // Future: POST to /api/telegram/send
        console.log(`Telegram [${chatId}]: ${message}`);
    }
}

export const notifications = new NotificationService();
