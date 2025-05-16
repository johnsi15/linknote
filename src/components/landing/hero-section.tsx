'use client'

import { Button } from '@/components/ui/button'
import { CodeIcon, BookmarkIcon, TagIcon } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'

export function HeroSection() {
  return (
    <div className='container mx-auto px-4 py-20 flex flex-col items-center text-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-3xl'
      >
        <h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-6'>
          Save & organize your coding resources
          <span className='text-primary'> efficiently</span>
        </h1>
        <p className='text-xl text-muted-foreground mb-10 max-w-2xl mx-auto'>
          DevLinks helps programmers organize and access their important coding resources with rich descriptions, code
          snippets, and intelligent tagging.
        </p>
        <div className='flex justify-center gap-4'>
          <Link href='/sign-up'>
            <Button size='lg' className='gap-2'>
              <BookmarkIcon size={18} />
              Get Started
            </Button>
          </Link>
          <Link href='/dashboard'>
            <Button size='lg' variant='outline' className='gap-2'>
              <CodeIcon size={18} />
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
