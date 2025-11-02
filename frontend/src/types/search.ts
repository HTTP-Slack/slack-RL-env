import type { IUser } from './user';
import type { IChannel } from './channel';

export type SearchResultType = 'user' | 'channel' | 'message' | 'file' | 'canvas' | 'conversation';

export interface UserSearchResult extends IUser {
  type: 'user';
}

export interface ChannelSearchResult extends IChannel {
  type: 'channel';
}

export interface MessageSearchResult {
  _id: string;
  content: string;
  sender: IUser;
  channel?: {
    _id: string;
    name: string;
  };
  conversation?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  type: 'message';
}

export interface FileSearchResult {
  _id: string;
  attachments: string[];
  sender: IUser;
  channel?: {
    _id: string;
    name: string;
  };
  conversation?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  type: 'file';
}

export interface CanvasSearchResult {
  _id: string;
  title: string;
  createdBy: IUser;
  collaborators: IUser[];
  organisation: string;
  createdAt: string;
  updatedAt: string;
  type: 'canvas';
}

export interface ConversationSearchResult {
  _id: string;
  name: string;
  collaborators: IUser[];
  organisation: string;
  createdAt: string;
  type: 'conversation';
}

export type SearchResult =
  | UserSearchResult
  | ChannelSearchResult
  | MessageSearchResult
  | FileSearchResult
  | CanvasSearchResult
  | ConversationSearchResult;

export interface SearchResults {
  users: UserSearchResult[];
  channels: ChannelSearchResult[];
  messages: MessageSearchResult[];
  files: FileSearchResult[];
  canvases: CanvasSearchResult[];
  conversations: ConversationSearchResult[];
}

export interface SearchParams {
  query: string;
  organisationId: string;
  channelId?: string;
  limit?: number;
}
