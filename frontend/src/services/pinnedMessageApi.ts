import api from '../config/axios';
import type { Message, User } from './messageApi';

export interface PinnedMessage {
  _id: string;
  message: Message;
  channel?: string;
  conversation?: string;
  organisation: string;
  pinnedBy: User;
  createdAt: string;
  updatedAt: string;
}

export const pinMessage = async (
  messageId: string,
  channelId: string | undefined,
  conversationId: string | undefined,
  organisation: string
): Promise<PinnedMessage> => {
  const response = await api.post('/pinned-messages', {
    messageId,
    channelId,
    conversationId,
    organisation,
  });
  return response.data.data;
};

export const unpinMessage = async (
  messageId: string,
  channelId: string | undefined,
  conversationId: string | undefined
): Promise<void> => {
  const params = new URLSearchParams();
  if (channelId) {
    params.append('channelId', channelId);
  } else if (conversationId) {
    params.append('conversationId', conversationId);
  }

  await api.delete(`/pinned-messages/${messageId}?${params.toString()}`);
};

export const getPinnedMessages = async (
  channelId: string | undefined,
  conversationId: string | undefined,
  organisation: string
): Promise<PinnedMessage[]> => {
  const params = new URLSearchParams({ organisation });
  if (channelId) {
    params.append('channelId', channelId);
  } else if (conversationId) {
    params.append('conversationId', conversationId);
  }

  const response = await api.get(`/pinned-messages?${params.toString()}`);
  return response.data.data;
};

export const checkIfPinned = async (
  messageId: string,
  channelId: string | undefined,
  conversationId: string | undefined
): Promise<{ isPinned: boolean; data: PinnedMessage | null }> => {
  const params = new URLSearchParams();
  if (channelId) {
    params.append('channelId', channelId);
  } else if (conversationId) {
    params.append('conversationId', conversationId);
  }

  const response = await api.get(
    `/pinned-messages/${messageId}/check?${params.toString()}`
  );
  return response.data;
};
