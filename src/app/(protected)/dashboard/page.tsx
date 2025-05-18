import { Link } from 'lucide-react'
import { LinkCard } from '@/components/dashboard/link-card'
import { TagCloud } from '@/components/dashboard/tag-cloud'
import { Button } from '@/components/ui/button'
import { NewLinkButton } from '@/components/dashboard/new-link/button'
import { getUserLinks } from '@/actions/links'

export default async function DashboardPage() {
  const { links, success, error } = await getUserLinks()

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <NewLinkButton />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Recent Links</h2>
              <Link href='/dashboard/links'>
                <Button variant='ghost' size='sm'>
                  View All
                </Button>
              </Link>
            </div>
            <div className='grid grid-cols-1 gap-4'>
              {success &&
                links &&
                links.map(({ id, title, url, description, tags, createdAt }) => (
                  <LinkCard
                    key={id}
                    title={title}
                    url={url}
                    description={description ?? ''}
                    tags={tags}
                    createdAt={new Date(createdAt ?? '').toISOString()}
                    id={id}
                  />
                ))}

              {!success && error && (
                <div className='flex items-center justify-center p-8 text-center border rounded-lg bg-muted/20'>
                  <p className='text-sm text-muted-foreground mb-4'>{error}</p>
                </div>
              )}

              {success && links?.length === 0 && (
                <div className='flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20'>
                  <Link className='h-12 w-12 text-muted-foreground mb-3' />
                  <h3 className='text-lg font-medium mb-1'>No links found</h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    You haven't created any links yet. Start by adding your first link.
                  </p>
                  <NewLinkButton />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Your Tags</h2>
              <Link href='/dashboard/tags'>
                <Button variant='ghost' size='sm'>
                  Manage
                </Button>
              </Link>
            </div>
            <div className='bg-card rounded-lg border p-4'>
              {links && links.length > 0 ? (
                <TagCloud
                  tags={(() => {
                    const allTags = links.flatMap(link => link.tags)

                    const tagCounts = new Map()
                    allTags.forEach(tag => {
                      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
                    })

                    return Array.from(tagCounts).map(([name, count]) => ({ name, count }))
                  })()}
                />
              ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>There are no available labels</p>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Quick Stats</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-card rounded-lg border p-4 text-center'>
                <p className='text-3xl font-bold'>{links?.length ?? 0}</p>
                <p className='text-muted-foreground text-sm'>Total Links</p>
              </div>
              <div className='bg-card rounded-lg border p-4 text-center'>
                <p className='text-3xl font-bold'>
                  {links ? Array.from(new Set(links.flatMap(link => link.tags))).length : 0}
                </p>
                <p className='text-muted-foreground text-sm'>Total Tags</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
