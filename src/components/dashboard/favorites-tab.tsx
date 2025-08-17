'use client'

import { Card } from '@/components/ui/card'
import { LinkList } from '@/components/dashboard/link-list'
import { useLinks } from '@/hooks/queries/use-links'

export function FavoritesTab() {
  const { data: favoritesData, isLoading: loadingFavorites } = useLinks({ onlyFavorites: true })
  const favoriteLinks = favoritesData?.links || []

  return (
    <Card className='p-4'>
      {loadingFavorites ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Loading favorites...</p>
        </div>
      ) : favoriteLinks.length > 0 ? (
        <LinkList links={favoriteLinks} />
      ) : (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>You don´t have any favorite links yet.</p>
        </div>
      )}
    </Card>
  )
}
