export interface IUser {
  _id: string;
  name: string;
  username?: string; // Optional for backwards compatibility
  email: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
