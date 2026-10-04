export type Role = 'member' | 'staff' | 'admin'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: Role
  created_at: string
}

export interface Plan {
  id: string
  name: string
  duration_days: number
  price: number
  is_active: boolean
}

export interface Membership {
  id: string
  user_id: string
  plan_id: string
  start_date: string | null
  end_date: string | null
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  membership_plans?: { name: string } | null
}

export interface GymClass {
  id: string
  name: string
  instructor: string | null
  starts_at: string
  ends_at: string
  capacity: number
}
