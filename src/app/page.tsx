import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureSection } from '@/components/landing/feature-section'
import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className='min-h-screen'>
      <header className='border-b'>
        <nav className='container mx-auto py-4 px-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Link href='/' className='text-xl font-bold'>
              DevLinks
            </Link>
          </div>
          <div className='flex items-center gap-4'>
            <SignedOut>
              <SignInButton>Login</SignInButton>
            </SignedOut>
            <SignedOut>
              <SignUpButton>Sign Up</SignUpButton>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main>
        <HeroSection />
        <FeatureSection />
      </main>

      <footer className='border-t py-8 mt-12'>
        <div className='container mx-auto px-4 text-center text-muted-foreground'>
          <p>© 2025 DevLinks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
