export const KAFKA_BROKER_URL = process.env.KAFKA_BROKER || 'localhost:9093';
export const KAFKA_CLIENT_ID = 'eventflowapp';
export const KAFKA_CONSUMER_GROUP = 'eventflowapp-consumer';

export const KAFKA_TOPICS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.loggedin',
  PASSWORD_RESET_REQUESTED: 'user.password-reset-requested',

  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_CANCELED: 'event.canceled',

  TICKET_PURCHASED: 'ticket.purchased',
  TICKET_CANCELED: 'ticket.canceled',
  TICKET_CHECKED_IN: 'ticket.checked-in',

  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  SENT_EMAIL: 'notification.sent-email',
  SEND_PUSH: 'notification.send-push',
} as const;

export type KafkaTopics = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
