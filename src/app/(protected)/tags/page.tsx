import { TagsManager } from '@/components/tags/tags-manager'
import { getUserTags } from '@/actions/tags'

export default async function TagsPage() {
  const initialTags = await getUserTags()

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-6'>Manage Tags</h1>
      </div>
      <TagsManager initialTags={initialTags} />
    </div>
  )
}
