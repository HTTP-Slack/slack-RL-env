export interface Channel {
  _id: string;
  name: string;
  organisation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  owner: string;
  coWorkers: string[];
  joinLink?: string;
  url?: string;
  channels: Channel[];
  createdAt: string;
  updatedAt: string;
}
