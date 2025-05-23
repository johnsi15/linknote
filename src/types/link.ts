export interface Link {
  tags: string[]
  id: string
  userId: string
  title: string
  url: string
  description: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface LinkFormData extends Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'description'> {
  description?: string
}
