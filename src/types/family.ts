export interface Person {
  id: string;
  first_name: string;
  last_name: string | null;
  birth_date: string | null;
  death_date: string | null;
  photo_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling';
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'family_member';
  invited_by: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted';
  created_at: string;
}
