export interface ILaterItem {
  _id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'archived' | 'completed';
  userId: string | {
    _id: string;
    username: string;
    email: string;
  };
  organisation: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLaterItemData {
  title: string;
  description?: string;
  dueDate?: string | null;
  organisationId: string;
}

export interface UpdateLaterItemData {
  title?: string;
  description?: string;
  dueDate?: string | null;
}

export type LaterItemStatus = 'in-progress' | 'archived' | 'completed';
