import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { CodeIcon, LockIcon, UserPlusIcon } from 'lucide-react'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureSection } from '@/components/landing/feature-section'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Footer } from '@/components/ui/footer'

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

      <Footer />
    </div>
  )
}
