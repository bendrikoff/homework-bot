import axios from 'axios';
import { logger } from './logger';

export class Analytics {
    private counterId: string;
    private host: string;

    constructor(counterId: string) {
        this.counterId = counterId;
        this.host = 'https://mc.yandex.ru';
    }

    /**
     * Send a simple GET hit to Yandex.Metrika and log request/response.
     * Uses mc.yandex.ru/watch/<counterId>?page-url=... to register a realtime visit/event.
     */
    async trackEvent(eventName: string, userId?: string, params: any = {}) {
        if (!this.counterId) {
            logger.warn('YANDEX_METRIKA_ID не настроен');
            return;
        }

        const url = `${this.host}/watch/${this.counterId}`;

        // Build friendly page-url so it is visible in Real-time and Events.
        // Include a sanitized user identifier so different Telegram users are shown separately
        // in Real-time (e.g. bot_event_message_sent_user_324234993).
        // NOTE: this embeds user id into the page-url (privacy consideration). If you
        // want anonymity, replace with a hash or remove user part.
        const safeUser = (userId && String(userId))
            ? String(userId).replace(/[^a-zA-Z0-9_-]/g, '')
            : 'anon';
        const pageUrl = `bot_event_${eventName}_user_${safeUser}`;

        const query: any = {
            'page-url': pageUrl,
            'user-id': userId || 'anonymous',
            '_': Date.now()
        };

        // include a compact JSON of params for easier debugging (won't be indexed, but helps troubleshooting)
        if (params && Object.keys(params).length > 0) {
            try {
                query['params'] = JSON.stringify(params);
            } catch (e) {
                query['params'] = String(params);
            }
        }

        try {
            await logger.info(`Отправляю метрику в Yandex.Metrika: ${eventName}`, { url, query });

            const resp = await axios.get(url, {
                params: query,
                timeout: 7000,
                validateStatus: () => true // we'll handle status manually
            });

            // Yandex usually returns 204 No Content for such hits; log status for visibility
            await logger.info(`Событие отправлено в метрику: ${eventName}`, { status: resp.status, statusText: resp.statusText });

            // For debug, log response body when non-empty or non-2xx
            if (resp.data && JSON.stringify(resp.data) !== '{}') {
                await logger.info('Yandex response body', { data: resp.data });
            }
        } catch (error) {
            await logger.logErrorSilently('Ошибка отправки события в Яндекс.Метрику', error);
        }
    }
}