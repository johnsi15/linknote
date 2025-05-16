import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import { UserButton } from '@clerk/nextjs'
import { ModeToggle } from '@/components/mode-toggle'
import { CommandPalette } from '@/components/command-palette'
import { getSecureUser } from '@/lib/auth/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSecureUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-14 items-center'>
          <div className='mr-4 hidden md:flex'>
            <DashboardNav className='mx-6' />
          </div>
          <div className='flex flex-1 items-center justify-end space-x-4'>
            <CommandPalette />
            <nav className='flex items-center space-x-2'>
              <ModeToggle />
              <UserButton afterSignOutUrl='/' />
            </nav>
          </div>
        </div>
      </header>
      <div className='flex-1 container py-6'>{children}</div>
    </div>
  )
}
