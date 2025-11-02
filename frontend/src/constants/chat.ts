export interface User {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  status?: 'active' | 'away' | 'dnd';
}

export interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  edited?: boolean;
  threadId?: string;
}

export interface Thread {
  id: string;
  messageId: string;
  messages: Message[];
}

export interface Conversation {
  id: string;
  userId: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export const MOCK_CURRENT_USER: User = {
  id: 'current-user',
  name: 'aban',
  displayName: 'aban hasan',
  avatar: 'https://via.placeholder.com/32',
  status: 'active',
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'amogha',
    displayName: 'Amogha Rao',
    avatar: 'https://via.placeholder.com/32',
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'naverdo',
    displayName: 'Naverdo',
    avatar: 'https://via.placeholder.com/32',
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'sandeep',
    displayName: 'Sandeep',
    avatar: 'https://via.placeholder.com/32',
    status: 'away',
  },
  {
    id: 'user-4',
    name: 'shaurya',
    displayName: 'Shaurya Verma',
    avatar: 'https://via.placeholder.com/32',
    status: 'active',
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'user-1': [
    {
      id: 'msg-1',
      userId: 'user-1',
      text: 'This conversation is just between @Amogha Rao and you. Check out their profile to learn more about them.',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: 'msg-2',
      userId: 'current-user',
      text: 'Hello! How are you?',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 'msg-3',
      userId: 'user-1',
      text: 'Hey! I am doing great, thanks for asking.',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: 'msg-4',
      userId: 'current-user',
      text: '{ "mcpServers": { "web-to-mcp": { "url": "https://web-to-mcp.com/mcp/ce14fb09-389b-4dae-83c8-1894cc735aa5/" } } }',
      timestamp: new Date(Date.now() - 900000),
    },
  ],
  'user-2': [
    {
      id: 'msg-5',
      userId: 'user-2',
      text: 'Hi there!',
      timestamp: new Date(Date.now() - 7200000),
    },
  ],
  'user-3': [
    {
      id: 'msg-6',
      userId: 'current-user',
      text: 'Hello Sandeep!',
      timestamp: new Date(Date.now() - 10800000),
    },
  ],
  'user-4': [
    {
      id: 'msg-7',
      userId: 'user-4',
      text: 'Hey!',
      timestamp: new Date(Date.now() - 14400000),
    },
  ],
};

export const MOCK_THREADS: Record<string, Thread[]> = {
  'msg-3': [
    {
      id: 'thread-1',
      messageId: 'msg-3',
      messages: [
        {
          id: 'thread-msg-1',
          userId: 'current-user',
          text: 'That is great to hear!',
          timestamp: new Date(Date.now() - 1700000),
          threadId: 'thread-1',
        },
        {
          id: 'thread-msg-2',
          userId: 'user-1',
          text: 'Thanks!',
          timestamp: new Date(Date.now() - 1600000),
          threadId: 'thread-1',
        },
      ],
    },
  ],
};

