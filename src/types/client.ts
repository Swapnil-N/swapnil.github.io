export interface Client {
  id: string;
  slug: string;
  business_name: string;
  owner_user_id: string | null;
  status: 'demo' | 'paid' | 'archived';
  payment_link_url: string | null;
  notes: string | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface ClientAction {
  id: string;
  client_id: string;
  user_id: string | null;
  action: 'approve' | 'request_changes' | 'pay_clicked';
  message: string | null;
  created_at: string;
}
