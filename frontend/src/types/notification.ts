import type { IUser } from './user';

export type NotificationType = 
  | 'mention' 
  | 'channel_mention' 
  | 'reply' 
  | 'direct_message' 
  | 'thread_reply';

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  message: {
    _id: string;
    content: string;
  };
  channel?: {
    _id: string;
    name: string;
  };
  conversation?: {
    _id: string;
  };
  organisation: {
    _id: string;
    name: string;
  };
  sender: IUser;
  isRead: boolean;
  metadata?: {
    hasChannelMention?: boolean;
    hasHereMention?: boolean;
    channelName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unread: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

