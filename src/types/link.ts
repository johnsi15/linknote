export interface Link {
  tags: string[]
  id: string
  userId: string
  title: string
  url: string
  description: string | null
  isFavorite: boolean | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface LinkFormData {
  title: string
  url: string
  description?: string
  isFavorite?: boolean
  tags: string[]
}
