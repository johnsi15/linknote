'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookmarkIcon, SearchIcon, TagIcon, CodeIcon, KeyboardIcon, SparklesIcon } from 'lucide-react'
import { BorderBeam } from '@/components/magicui/border-beam'
import { DotPattern } from '../magicui/dot-pattern'

const features = [
  {
    icon: <BookmarkIcon className='h-6 w-6' />,
    title: 'Smart Bookmarking',
    description: 'Save links with rich descriptions, code snippets, and organized tags.',
    borderColor: 'from-transparent via-blue-500 to-transparent',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-cyan-500/20',
    meteorCount: 15,
  },
  {
    icon: <CodeIcon className='h-6 w-6' />,
    title: 'Code Snippets',
    description: 'Store code examples alongside your links for quick reference.',
    borderColor: 'from-transparent via-emerald-500 to-transparent',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-green-500/20',
    meteorCount: 12,
  },
  {
    icon: <TagIcon className='h-6 w-6' />,
    title: 'Custom Tags',
    description: 'Create and manage custom tags to organize your resources effectively.',
    borderColor: 'from-transparent via-orange-500 to-transparent',
    gradientFrom: 'from-orange-500/20',
    gradientTo: 'to-amber-500/20',
    meteorCount: 18,
  },
  {
    icon: <SearchIcon className='h-6 w-6' />,
    title: 'Powerful Search',
    description: 'Find exactly what you need with advanced filtering and search capabilities.',
    borderColor: 'from-transparent via-violet-500 to-transparent',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-purple-500/20',
    meteorCount: 20,
  },
  {
    icon: <KeyboardIcon className='h-6 w-6' />,
    title: 'Keyboard Shortcuts',
    description: 'Navigate efficiently with command palette and keyboard shortcuts.',
    borderColor: 'from-transparent via-pink-500 to-transparent',
    gradientFrom: 'from-pink-500/20',
    gradientTo: 'to-rose-500/20',
    meteorCount: 10,
  },
  {
    icon: <SparklesIcon className='h-6 w-6' />,
    title: 'AI Suggestions',
    description: 'Get AI-powered tag and description suggestions for your links.',
    borderColor: 'from-transparent via-cyan-500 to-transparent',
    gradientFrom: 'from-cyan-500/20',
    gradientTo: 'to-blue-500/20',
    meteorCount: 25,
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
          <Card
            key={index}
            className={`
              relative overflow-hidden hover:shadow-2xl transition-all duration-500 group
              border border-gray-200
              bg-gradient-to-br
              from-white/80 to-gray-100
              dark:border-0
              dark:from-white/10 dark:to-muted/40
            `}
          >
            <DotPattern
              className='absolute inset-0 opacity-10 dark:group-hover:opacity-30 group-hover:opacity-50  transition-opacity duration-300'
              width={20}
              height={20}
            />

            <CardHeader className='relative z-10'>
              <div className='h-12 w-12 flex items-center justify-center rounded-lg mb-4 bg-background/80 backdrop-blur-sm'>
                {feature.icon}
              </div>

              <CardTitle className='group-hover:text-foreground transition-colors'>{feature.title}</CardTitle>

              <CardDescription className='group-hover:text-muted-foreground/80 transition-colors'>
                {feature.description}
              </CardDescription>
            </CardHeader>

            {/* Border Beam */}
            <BorderBeam duration={10} delay={index * 0.5} size={120} className={feature.borderColor} />
          </Card>
        ))}
      </div>
    </div>
  )
}
