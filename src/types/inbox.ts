export interface Message {
  id: string;
  subject: string;
  content: string;
  created_at: string;
  read_at?: string;
  thread_id?: string;
  status: 'sent' | 'delivered' | 'read' | 'deleted';
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  email?: string;
}