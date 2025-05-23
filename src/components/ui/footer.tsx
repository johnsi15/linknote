import { XIcon } from 'lucide-react'
import { GithubIcon } from '../icons/github'
import { IgIcon } from '../icons/ig'

export function Footer() {
  return (
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
  )
}
