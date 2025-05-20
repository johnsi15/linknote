import { HeroSection } from '@/components/landing/hero-section'
import { FeatureSection } from '@/components/landing/feature-section'
import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { GithubIcon } from '@/components/icons/github'
import { XIcon } from 'lucide-react'
import { IgIcon } from '@/components/icons/ig'

export default function Home() {
  return (
    <div className='min-h-screen'>
      <header className='border-b'>
        <nav className='container mx-auto py-4 px-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Link href='/' className='text-xl font-bold'>
              Linknote
            </Link>
          </div>
          <div className='flex items-center gap-4'>
            <SignedOut>
              <SignInButton mode='modal'>Login</SignInButton>
            </SignedOut>
            <SignedOut>
              <SignUpButton mode='modal'>Sign Up</SignUpButton>
            </SignedOut>
            <SignedIn>
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
            </SignedIn>
          </div>
        </nav>
      </header>

      <main>
        <HeroSection />
        <FeatureSection />
      </main>

      <footer className='relative z-10 border-border/40 border-t bg-background/80 backdrop-blur-sm'>
        <div className='container mx-auto flex h-8 max-w-2xl items-center justify-between px-4'>
          <div className='flex items-center gap-4 text-muted-foreground text-xs'>
            <a href='https://github.com/' target='_blank' rel='noopener noreferrer' className='hover:text-foreground'>
              <GithubIcon className='h-3.5 w-3.5' />
            </a>
            <a
              href='https://x.com/johnserranodev'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-foreground'
            >
              <XIcon className='h-3.5 w-3.5' />
            </a>
            <div className='rounded-full  p-1'>
              <a
                href='https://www.instagram.com/johnserranodev'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-foreground'
              >
                <IgIcon className='h-3.5 w-3.5' />
              </a>
            </div>
          </div>
          <div className='text-muted-foreground text-xs'>
            Built by{' '}
            <a
              href='https://github.com/johnsi15'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-foreground'
            >
              John Serrano
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
