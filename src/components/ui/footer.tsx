import { GithubIcon } from '../icons/github'
import { IgIcon } from '../icons/ig'
import { XIcon } from '../icons/x'

export function Footer() {
  return (
    <footer className='relative z-10 border-t border-gray-200 dark:border-border/40 bg-white dark:bg-background/80 backdrop-blur-sm'>
      <div className='container mx-auto flex h-12 md:h-12 max-w-2xl items-center justify-between px-4'>
        <div className='flex items-center gap-3.5 text-gray-700 dark:text-muted-foreground text-xs'>
          <a
            href='https://github.com/johnsi15/linknote'
            target='_blank'
            rel='noopener noreferrer'
            className='p-1.5 -m-1.5 hover:text-foreground transition-colors rounded-md'
            aria-label='GitHub'
          >
            <GithubIcon className='h-4 w-4' />
          </a>
          <a
            href='https://x.com/johnserranodev'
            target='_blank'
            rel='noopener noreferrer'
            className='p-1.5 -m-1.5 hover:text-foreground transition-colors rounded-md'
            aria-label='X'
          >
            <XIcon className='h-4.5 w-4.5' />
          </a>
          <div className='rounded-full  p-1'>
            <a
              href='https://www.instagram.com/johnserranodev'
              target='_blank'
              rel='noopener noreferrer'
              className='p-1.5 -m-1.5 hover:text-foreground transition-colors rounded-md'
              aria-label='Instagram'
            >
              <IgIcon className='h-4 w-4' />
            </a>
          </div>
        </div>
        <div className='text-gray-700 dark:text-muted-foreground text-xs'>
          Built by{' '}
          <a
            href='https://github.com/johnsi15'
            target='_blank'
            rel='noopener noreferrer'
            className='p-1.5 -m-1.5 hover:text-foreground transition-colors rounded-md'
            aria-label='John Serrano'
          >
            John Serrano
          </a>
        </div>
      </div>
    </footer>
  )
}
