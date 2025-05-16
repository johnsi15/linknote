'use client'

import { useState, useEffect } from 'react'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Search } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }

      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div className='relative'>
      {open && (
        <div className='fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'>
          <div className='fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-[450px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border bg-popover p-0 shadow-md'>
            <Command>
              <div className='flex items-center border-b px-3'>
                <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                <CommandInput placeholder='Buscar comandos...' />
              </div>
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup heading='Enlaces'>
                  <CommandItem>Añadir nuevo enlace</CommandItem>
                  <CommandItem>Ver todos los enlaces</CommandItem>
                  <CommandItem>Buscar por etiqueta</CommandItem>
                </CommandGroup>
                <CommandGroup heading='Navegación'>
                  <CommandItem>Ir al dashboard</CommandItem>
                  <CommandItem>Ir a configuración</CommandItem>
                  <CommandItem>Ir a perfil</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </div>
  )
}
