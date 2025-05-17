'use client'

import { useParams } from 'next/navigation'
import { LinkCard } from '@/components/dashboard/link-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LinkDetailPage() {
  const params = useParams()
  const id = params.id as string

  // Aquí normalmente harías una llamada a la API para obtener los detalles del enlace
  // Por ahora, usaremos datos de ejemplo
  const linkData = {
    id,
    title: 'Ejemplo de enlace',
    url: 'https://ejemplo.com',
    description: 'Esta es una descripción de ejemplo para el enlace',
    tags: ['ejemplo', 'demo', 'nuqs'],
    createdAt: new Date().toISOString(),
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Link href='/dashboard'>
          <Button variant='ghost' size='sm' className='gap-1'>
            <ArrowLeft className='h-4 w-4' />
            Volver
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Detalles del enlace</h1>
      </div>

      <LinkCard
        id={id}
        title={linkData.title}
        url={linkData.url}
        description={linkData.description}
        tags={linkData.tags}
        createdAt={linkData.createdAt}
      />
    </div>
  )
}
