'use client'

import Link from 'next/link'
import { BugIcon } from 'lucide-react'

export function ReportBug() {
  return (
    <Link
      href='https://github.com/johnsi15/linknote/issues'
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors'
      title='Report a bug'
    >
      <BugIcon className='mr-1 h-4 w-4' />
      Report bug
    </Link>
  )
}
