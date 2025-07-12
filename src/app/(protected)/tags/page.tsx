import { TagsManager } from '@/components/tags/tags-manager'

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-6'>Manage Tags</h1>
      </div>
      <TagsManager />
    </div>
  )
}
