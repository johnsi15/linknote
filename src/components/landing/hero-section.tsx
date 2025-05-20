'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { CodeIcon, BookmarkIcon, TagIcon, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { SignedOut, SignUpButton } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { Highlight, themes } from 'prism-react-renderer'

const codeExample = `// Example: Creating a React Context
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div>Current theme: {theme}</div>;
}
`

export function HeroSection() {
  const { isLoaded, isSignedIn } = useAuth()

  const classButton = buttonVariants({
    variant: 'default',
    size: 'lg',
  })

  return (
    <div className='container mx-auto px-4 py-20 flex flex-col items-center text-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-3xl'
      >
        <h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-6 font-mono'>
          Save & organize your coding resources
          <span className='text-primary'> efficiently</span>
        </h1>
        <p className='text-xl text-muted-foreground mb-10 max-w-2xl mx-auto'>
          Linknote helps programmers organize and access their important coding resources with rich descriptions, code
          snippets, and intelligent tagging.
        </p>
        <div className='flex justify-center gap-4'>
          {isLoaded && !isSignedIn && (
            <div className={`${classButton} gap-2 cursor-pointer`}>
              <BookmarkIcon size={18} />

              <SignUpButton mode='modal'>
                <button className='cursor-pointer'>Get Started</button>
              </SignUpButton>
              <SignedOut></SignedOut>
            </div>
          )}

          <Link href='/dashboard'>
            <Button size='lg' variant='outline' className='gap-2'>
              <CodeIcon size={18} />
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className='mt-20 w-full max-w-5xl bg-card border rounded-xl shadow-lg overflow-hidden'
      >
        <div className='p-8'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-4 h-4 rounded-full bg-red-500'></div>
            <div className='w-4 h-4 rounded-full bg-yellow-500'></div>
            <div className='w-4 h-4 rounded-full bg-green-500'></div>
            <div className='ml-4 text-muted-foreground text-sm font-semibold'>Linknote Preview</div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='col-span-1 flex flex-col space-y-4'>
              <div className='bg-secondary/50 p-4 rounded-lg'>
                <h3 className='font-medium mb-2 flex items-center gap-2'>
                  <TagIcon size={16} /> Tags
                </h3>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-2 py-1 rounded-md bg-[#f1dd35]/10 text-[#f1dd35] text-xs'>javascript</span>
                  <span className='px-2 py-1 rounded-md bg-green-600/10 text-green-600 text-xs'>linux</span>
                  <span className='px-2 py-1 rounded-md bg-purple-600/10 text-purple-600 text-xs'>productivity</span>
                  <span className='px-2 py-1 rounded-md bg-[#3178c6]/10 text-[#3178c6] text-xs'>typescript</span>
                  <span className='px-2 py-1 rounded-md bg-red-600/10 text-red-600 text-xs'>algorithms</span>
                </div>
              </div>

              <div className='bg-secondary/50 p-4 rounded-lg'>
                <h3 className='font-medium mb-2'>Recently Added</h3>
                <ul className='space-y-3 text-sm'>
                  <li className='flex items-start gap-3 bg-card rounded-md px-2 py-3.5 border hover:shadow transition'>
                    <LinkIcon size={16} />
                    <div>
                      <div className='font-semibold text-left'>How to use React Context</div>
                      <div className='text-blue-500 text-xs truncate max-w-[160px]'>
                        react.dev/reference/react/Context
                      </div>
                    </div>
                  </li>
                  <li className='flex items-start gap-3 bg-card rounded-md px-2 py-3.5 border hover:shadow transition'>
                    <LinkIcon size={16} />
                    <div>
                      <div className='font-semibold text-left'>Linux CLI Cheat Sheet</div>
                      <div className='text-blue-500 text-xs truncate max-w-[160px]'>cheatography.com/linux-cli</div>
                    </div>
                  </li>
                  <li className='flex items-start gap-3 bg-card rounded-md px-2 py-3.5 border hover:shadow transition'>
                    <LinkIcon size={16} />
                    <div>
                      <div className='font-semibold text-left'>TypeScript Utility Types</div>
                      <div className='text-blue-500 text-xs truncate max-w-[160px]'>
                        typescriptlang.org/docs/utility-types
                      </div>
                    </div>
                  </li>
                  <li className='flex items-start gap-3 bg-card rounded-md px-2 py-3.5 border hover:shadow transition'>
                    <LinkIcon size={16} />
                    <div>
                      <div className='font-semibold text-left'>CSS Flexbox Guide</div>
                      <div className='text-blue-500 text-xs truncate max-w-[160px]'>
                        css-tricks.com/snippets/css/a-guide-to-flexbox
                      </div>
                    </div>
                  </li>
                  <li className='flex items-start gap-3 bg-card rounded-md px-2 py-3.5 border hover:shadow transition'>
                    <LinkIcon size={16} />
                    <div>
                      <div className='font-semibold text-left'>Understanding Async/Await in JS</div>
                      <div className='text-blue-500 text-xs truncate max-w-[160px]'>
                        dev.to/johndoe/understanding-async-await-1234
                      </div>
                    </div>
                  </li>
                  <li className='flex items-start gap-3 bg-card rounded-md px-2 py-3.5 border hover:shadow transition'>
                    <LinkIcon size={16} />
                    <div>
                      <div className='font-semibold text-left'>MDN Web Docs: Array.prototype.map()</div>
                      <div className='text-blue-500 text-xs truncate max-w-[160px]'>
                        developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className='col-span-2'>
              <div className='bg-secondary/30 p-6 rounded-lg'>
                <div className='flex justify-between items-start mb-4'>
                  <h2 className='text-xl font-medium'>Guide: Using React Context</h2>
                  <div className='flex space-x-2'>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <BookmarkIcon size={16} />
                    </Button>
                  </div>
                </div>

                <a
                  href='https://react.dev/reference/react/Context'
                  className='text-blue-500 text-sm hover:underline break-all mb-4 block'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  https://react.dev/reference/react/Context
                </a>

                <div className='mt-4 mb-6 text-left'>
                  <p className='text-muted-foreground mb-4'>
                    Learn how to manage state globally in your React apps using Context API. This guide covers practical
                    examples and best practices.
                  </p>

                  <div className='bg-secondary/80 rounded-lg p-4 text-sm font-mono overflow-auto'>
                    <Highlight theme={themes.oneDark} code={codeExample} language='tsx'>
                      {({ className, style, tokens, getLineProps, getTokenProps }) => (
                        <pre className={`${className} p-4`} style={style}>
                          {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                              <span className='select-none text-muted-foreground mr-3'>{i + 1}</span>
                              {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token })} />
                              ))}
                            </div>
                          ))}
                        </pre>
                      )}
                    </Highlight>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2 mt-4'>
                  <span className='px-2 py-1 rounded-md bg-blue-600/10 text-blue-600 text-xs'>react</span>
                  <span className='px-2 py-1 rounded-md bg-purple-600/10 text-purple-600 text-xs'>context</span>
                  <span className='px-2 py-1 rounded-md bg-green-600/10 text-green-600 text-xs'>state-management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
