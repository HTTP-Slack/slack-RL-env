import type { IUser } from "./user.js";

export interface IChannel {
  _id: string;
  name: string;
  collaborators: IUser[];
  title: string;
  description: string;
  organisation: string;
  hasNotOpen: string[];
  isChannel: boolean;
  section: string;
  starred?: string[];
  createdAt: string;
  updatedAt: string;
}
