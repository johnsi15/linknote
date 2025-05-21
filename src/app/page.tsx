import { HeroSection } from '@/components/landing/hero-section'
import { FeatureSection } from '@/components/landing/feature-section'
import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { GithubIcon } from '@/components/icons/github'
import { CodeIcon, LockIcon, UserPlusIcon, XIcon } from 'lucide-react'
import { IgIcon } from '@/components/icons/ig'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { RainbowButton } from '@/components/magicui/rainbow-button'

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
              <SignInButton mode='modal'>
                <Button variant='outline' className='gap-2'>
                  <LockIcon size={16} />
                  Login
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedOut>
              <SignUpButton mode='modal'>
                <Button variant='default' className='gap-2'>
                  <UserPlusIcon size={16} />
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>

            <ModeToggle />
            <SignedIn>
              <Link href='/dashboard'>
                <RainbowButton variant='outline' className='gap-2'>
                  <CodeIcon size={16} /> Dashboard
                </RainbowButton>
              </Link>
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

      <footer className='relative z-10 border-t border-gray-200 dark:border-border/40 bg-white dark:bg-background/80 backdrop-blur-sm'>
        <div className='container mx-auto flex h-12 md:h-10 max-w-2xl items-center justify-between px-4'>
          <div className='flex items-center gap-4 text-gray-700 dark:text-muted-foreground text-xs'>
            <a
              href='https://github.com/johnsi15/linknote'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-foreground'
            >
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
          <div className='text-gray-700 dark:text-muted-foreground text-xs'>
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
