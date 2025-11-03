import type { IUser } from './user';

export type ColumnType = 'text' | 'enum' | 'date' | 'bool' | 'int';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[]; // For enum type
  required?: boolean;
}

export interface ListData {
  _id: string;
  title: string;
  description?: string;
  organisation: string;
  createdBy: IUser;
  collaborators: IUser[];
  columns: Column[];
  template?: string;
  lastViewedBy?: { userId: string; timestamp: Date }[];
  createdAt: Date;
  updatedAt: Date;
  items?: ListItemData[];
}

export interface ListItemData {
  _id: string;
  listId: string;
  data: { [columnId: string]: any };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: Column[];
}

