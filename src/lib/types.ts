// Shapes returned by the Laravel API (see the spec's "API contract" section).

export type Project = {
  slug: string
  title: string
  summary: string
  description: string | null
  role: string | null
  type: string | null
  problem: string | null
  solution: string | null
  key_features: string[]
  tech_stack: string[]
  repo_url: string | null
  live_url: string | null
  thumbnail_url: string | null
  is_featured: boolean
  view_count: number
  reactions_count: number
  links: { label: string; url: string }[]
  created_at: string
}

export type Impression = {
  id: number
  name: string | null
  is_employer: boolean
  message: string
  project_slug: string | null
  created_at: string
}

export type Stats = {
  totals: { projects: number; views: number; impressions: number; hidden_impressions: number; reactions: number }
  top_projects: { slug: string; title: string; view_count: number; reactions_count: number }[]
  daily: { stat_date: string; views: number; unique_visitors: number }[]
}

export type AdminProject = Project & { id: number; is_published: boolean; updated_at: string }

export type AdminImpression = Impression & { is_visible: boolean }

export type ProjectPayload = {
  title: string
  summary: string
  description: string | null
  role: string | null
  type: string | null
  problem: string | null
  solution: string | null
  key_features: string[]
  tech_stack: string[]
  repo_url: string | null
  live_url: string | null
  thumbnail_url: string | null
  is_published: boolean
  is_featured: boolean
  links: { label: string; url: string }[]
}

export type Page<T> = {
  items: T[]
  page: number
  lastPage: number
  total: number
}
