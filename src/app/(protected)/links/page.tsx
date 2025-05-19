import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LinkList } from '@/components/dashboard/link-list'
import { LinksFilterClient } from '@/components/dashboard/filter/links'
import { getUserLinks } from '@/actions/links'
import { NewLinkButton } from '@/components/dashboard/new-link/button'
import { Link } from '@/types/link'

export default async function LinksPage() {
  const { success, links, error } = await getUserLinks()
  const availableTags = Array.from(new Set(links?.flatMap((link: Link) => link.tags)))

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>My Links</h1>
        <NewLinkButton />
      </div>

      <Tabs defaultValue='all'>
        <div className='flex items-center justify-between mb-4'>
          <TabsList>
            <TabsTrigger value='all' className='cursor-pointer'>
              All Links
            </TabsTrigger>
            <TabsTrigger value='recent' className='cursor-pointer'>
              Recent
            </TabsTrigger>
            <TabsTrigger value='favorites' className='cursor-pointer'>
              Favorites
            </TabsTrigger>
          </TabsList>
          <div className='flex items-center text-sm text-muted-foreground'>
            <span>{links && links.length} links</span>
          </div>
        </div>

        <TabsContent value='all' className='space-y-4'>
          <Card className='p-4'>
            {success && links && <LinksFilterClient allLinks={links} availableTags={availableTags} />}
            {error && (
              <div className='text-center py-12'>
                <p className='text-muted-foreground'>{error}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value='recent' className='space-y-4'>
          <Card className='p-4'>{success && links && <LinkList links={links.slice(0, 3)} />}</Card>
        </TabsContent>

        <TabsContent value='favorites' className='space-y-4'>
          <Card className='p-4'>
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>You don´t have any favorite links yet.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
