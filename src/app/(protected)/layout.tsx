import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import { UserButton } from '@clerk/nextjs'
import { ModeToggle } from '@/components/mode-toggle'
import { CommandPalette } from '@/components/command-palette'
import { getUser } from '@/lib/auth/server'
import { ReportBug } from '@/components/report-bug'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-14 items-center'>
          <div className='mr-4 hidden md:flex'>
            <DashboardNav className='mx-6' />
          </div>
          <div className='flex flex-1 items-center justify-end space-x-4'>
            <CommandPalette />
            <nav className='flex items-center space-x-2'>
              <ReportBug />
              <ModeToggle />
              <div className=''>
                <UserButton
                  appearance={{
                    elements: {
                      rootBox: 'flex! items-center! justify-center! rounded-full!',
                      userButtonTrigger: 'w-8! h-8! hover:bg-muted! focus:outline-none! p-0! px-0!',
                      userButton: 'w-8! h-8!',
                      userButtonAvatarBox: 'w-8! h-8!',
                      userButtonAvatarImage: 'w-8! h-8!',
                    },
                  }}
                />
              </div>
            </nav>
          </div>
        </div>
      </header>
      <section className='flex-1 container mx-auto py-6'>{children}</section>
    </div>
  )
}
