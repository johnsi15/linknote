'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookmarkIcon, SearchIcon, TagIcon, CodeIcon, KeyboardIcon, SparklesIcon } from 'lucide-react'
import { BorderBeam } from '@/components/magicui/border-beam'

const features = [
  {
    icon: <BookmarkIcon className='h-6 w-6' />,
    title: 'Smart Bookmarking',
    description: 'Save links with rich descriptions, code snippets, and organized tags.',
    borderColor: 'from-transparent via-blue-500 to-transparent',
  },
  {
    icon: <CodeIcon className='h-6 w-6' />,
    title: 'Code Snippets',
    description: 'Store code examples alongside your links for quick reference.',
    borderColor: 'from-transparent via-slate-500 to-transparent',
  },
  {
    icon: <TagIcon className='h-6 w-6' />,
    title: 'Custom Tags',
    description: 'Create and manage custom tags to organize your resources effectively.',
    borderColor: 'from-transparent via-green-500 to-transparent',
  },
  {
    icon: <SearchIcon className='h-6 w-6' />,
    title: 'Powerful Search',
    description: 'Find exactly what you need with advanced filtering and search capabilities.',
    borderColor: 'from-transparent via-amber-500 to-transparent',
  },
  {
    icon: <KeyboardIcon className='h-6 w-6' />,
    title: 'Keyboard Shortcuts',
    description: 'Navigate efficiently with command palette and keyboard shortcuts.',
    borderColor: 'from-transparent via-purple-500 to-transparent',
  },
  {
    icon: <SparklesIcon className='h-6 w-6' />,
    title: 'AI Suggestions',
    description: 'Get AI-powered tag and description suggestions for your links.',
    borderColor: 'from-transparent via-sky-500 to-transparent',
  },
]

export function FeatureSection() {
  return (
    <div className='container mx-auto px-4 py-20'>
      <div className='text-center mb-16'>
        <h2 className='text-3xl font-bold mb-4 font-mono'>Features for Developers</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          Built with the unique needs of programmers in mind, Linknote helps you save and organize your coding resources
          more effectively.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
        {features.map((feature, index) => (
          <Card key={index} className='relative overflow-hidden '>
            <CardHeader>
              <div className='h-12 w-12 flex items-center justify-center rounded-lg mb-4'>{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <BorderBeam duration={8} size={200} className={feature.borderColor} />
          </Card>
        ))}
      </div>
    </div>
  )
}
