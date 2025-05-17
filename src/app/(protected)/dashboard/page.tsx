import { Link } from 'lucide-react'
import { LinkCard } from '@/components/dashboard/link-card'
import { TagCloud } from '@/components/dashboard/tag-cloud'
import { Button } from '@/components/ui/button'
import { NewLinkButton } from '@/components/dashboard/new-link/button'

export default function DashboardPage() {
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
              {/* Mock data for demonstration */}
              <LinkCard
                title='React Server Components Documentation'
                url='https://nextjs.org/docs/app/building-your-application/rendering/server-components'
                description='Official documentation for React Server Components in Next.js'
                tags={['react', 'nextjs', 'documentation']}
                createdAt={new Date().toISOString()}
                id='example-1'
              />
              <LinkCard
                title='TypeScript Advanced Types Guide'
                url='https://www.typescriptlang.org/docs/handbook/advanced-types.html'
                description="Learn about TypeScript's advanced type features"
                tags={['typescript', 'guide']}
                createdAt={new Date(Date.now() - 86400000).toISOString()}
                id='example-2'
              />
              <LinkCard
                title='CSS Grid Layout Tutorial'
                url='https://css-tricks.com/snippets/css/complete-guide-grid/'
                description='A comprehensive guide to CSS Grid layout'
                tags={['css', 'layout', 'tutorial']}
                createdAt={new Date(Date.now() - 172800000).toISOString()}
                id='example-3'
              />
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
              <TagCloud
                tags={[
                  { name: 'react', count: 12 },
                  { name: 'typescript', count: 8 },
                  { name: 'nextjs', count: 7 },
                  { name: 'css', count: 5 },
                  { name: 'javascript', count: 15 },
                  { name: 'tutorial', count: 6 },
                  { name: 'guide', count: 4 },
                  { name: 'documentation', count: 9 },
                  { name: 'api', count: 3 },
                  { name: 'design', count: 2 },
                  { name: 'patterns', count: 3 },
                  { name: 'performance', count: 5 },
                ]}
              />
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Quick Stats</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-card rounded-lg border p-4 text-center'>
                <p className='text-3xl font-bold'>28</p>
                <p className='text-muted-foreground text-sm'>Total Links</p>
              </div>
              <div className='bg-card rounded-lg border p-4 text-center'>
                <p className='text-3xl font-bold'>12</p>
                <p className='text-muted-foreground text-sm'>Total Tags</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
