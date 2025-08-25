import { Coffee } from 'lucide-react'

export function BetaBanner() {
  return (
    <div className='flex h-10 items-center justify-center bg-muted px-4 text-foreground'>
      <div className='flex items-center gap-2 text-center text-xs sm:text-sm'>
        <span>
          🚀 This project is <b>live</b> — help us make it even better!
        </span>
        <a
          href='https://github.com/johnsi15/linknote'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 hover:text-accent-foreground transition'
        >
          ⭐ Star the repo
        </a>
        <span>·</span>
        <a
          href='https://buymeacoffee.com/jandrey15'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 hover:text-accent-foreground transition'
        >
          <Coffee className='w-4 h-4' />
          Buy me a coffee
        </a>
      </div>
    </div>
  )
}
