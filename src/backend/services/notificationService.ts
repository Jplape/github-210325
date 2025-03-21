import admin from 'firebase-admin';
import { ApiError } from '../utils/errors';
import { collections } from '../../lib/firestore';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export class NotificationService {
  private messaging = admin.messaging();

  async sendNotificationToUser(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      // Get user's FCM token from Firestore
      const userDoc = await collections.Users.doc(userId).get();
      if (!userDoc.exists) {
        throw new ApiError(404, 'User not found');
      }

      const userData = userDoc.data();
      const fcmTokens = userData?.fcmTokens || [];

      if (fcmTokens.length === 0) {
        throw new ApiError(404, 'No FCM tokens found for user');
      }

      // Send to all user devices
      const message = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {}
      };

      const response = await this.messaging.sendEachForMulticast(message);

      // Save notification to Firestore
      await collections.Notifications.add({
        userId,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to send notification');
    }
  }

  async sendNotificationToTopic(topic: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {}
      };

      const response = await this.messaging.send(message);

      // Save notification to Firestore
      await collections.Notifications.add({
        topic,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return response;
    } catch (error) {
      throw new ApiError(500, 'Failed to send notification to topic');
    }
  }
}