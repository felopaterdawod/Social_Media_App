import admin from "firebase-admin";
import {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY
} from "../../config/config";

export class NotificationService {
    private client: admin.app.App;

    constructor() {
        this.client = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
        });
    }

    async sendNotification({
        token,
        data
    }: {
        token: string,
        data: { title: string, body: string }
    }) {
        const message = {
            token,
            data
        };

        return await this.client.messaging().send(message);
    }

    async sendNotifications({
        tokens,
        data
    }: {
        tokens: string[],
        data: { title: string, body: string }
    }) {
        await Promise.allSettled(
            tokens.map(token => {
                return this.sendNotification({ token, data });
            })
        );
    }
}

export const notificationService = new NotificationService();