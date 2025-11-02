import type { IChannel } from "./channel.js";

export interface ISection {
  _id: string;
  name: string;
  channels: IChannel[];
  order: number;
  organisation: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
