export interface User {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
  role?: string;
  created_at?: string;
}

export interface Email {
  id: number;
  from_address: string;
  from_name: string;
  to_address: string;
  subject: string;
  text: string;
  html?: string;
  received_at: string;
  is_read: boolean;
  folder?: string;
}
