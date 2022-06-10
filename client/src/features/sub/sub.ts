import { Arrow } from '../arrow/arrow';
import { User } from '../user/user';

export type Sub = {
  id: string;
  userId: string;
  user: User;
  arrowId: string;
  arrow: Arrow;
  createDate: Date;
  deleteDate: Date;
}