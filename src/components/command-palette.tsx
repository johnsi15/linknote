'use client'

import { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import { LayoutDashboard, Link2, LogOut, Search, Tag, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useClerk } from '@clerk/nextjs'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { openUserProfile, signOut } = useClerk()

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
  }, [open])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label='Global Command Menu'
      className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
      aria-labelledby='command-palette-title'
    >
      <div className='w-full max-w-[450px] rounded-md border bg-popover shadow-md'>
        <h2 id='command-palette-title' className='sr-only'>
          Command Palette
        </h2>

        <div className='flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3'>
          <Search className='h-5 w-5 text-neutral-400' />
          <Command.Input
            placeholder='Search commands...'
            className='w-full bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400'
          />
        </div>
        <Command.List className='max-h-72 overflow-y-auto py-4 px-2'>
          {loading && <Command.Loading>One moment…</Command.Loading>}
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group
            heading={
              <span className='text-sm font-semibold text-neutral-700 dark:text-neutral-200 px-2 py-1'>Links</span>
            }
            className='mb-2'
          >
            {/* <Command.Item
              className='cursor-pointer px-4 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {

              }}
            >
              Add new link
            </Command.Item> */}
            <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {
                router.push('/links')
                setOpen(false)
              }}
            >
              <Link2 className='w-4 h-4 text-neutral-500' />
              See all links
            </Command.Item>
            <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {
                router.push('/tags')
                setOpen(false)
              }}
            >
              <Tag className='w-4 h-4 text-neutral-500' />
              Search by tag
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading={
              <span className='text-sm font-semibold text-neutral-700 dark:text-neutral-200 px-2 py-1'>Navegation</span>
            }
            className='mb-2'
          >
            <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {
                router.push('/dashboard')
                setOpen(false)
              }}
            >
              <LayoutDashboard className='w-4 h-4 text-neutral-500' />
              Go to the dashboard
            </Command.Item>
            {/* <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {

              }}
            >
              Ir a configuración
            </Command.Item> */}
            <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {
                openUserProfile()
                setOpen(false)
              }}
            >
              <User className='w-4 h-4 text-neutral-500' />
              Go to profile
            </Command.Item>
          </Command.Group>

          <Command.Separator />

          <Command.Group
            heading={
              <span className='text-sm font-semibold text-neutral-700 dark:text-neutral-200 px-2 py-1'>
                Quick Access
              </span>
            }
            className='mb-2'
          >
            {/* <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {}}
            >
              Ayuda
            </Command.Item> */}
            <Command.Item
              className='cursor-pointer font-light px-4 py-2 flex items-center gap-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition'
              onSelect={() => {
                signOut()
                setOpen(false)
              }}
            >
              <LogOut className='w-4 h-4 text-neutral-500' />
              Log out
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  )
}
