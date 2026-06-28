export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github';
  status: 'pending' | 'approved' | 'rejected';
  isAdmin: boolean;
  telegramChatId?: string;
  city?: string;
  requestMessage?: string;
  createdAt: string;
}
