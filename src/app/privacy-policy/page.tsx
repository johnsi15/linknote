import { Footer } from '@/components/ui/footer'
import { Header } from '@/components/ui/header'

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen flex flex-col justify-between'>
      <Header />
      <main className='max-w-2xl mx-auto py-12 px-4'>
        <h1 className='text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100'>Privacy Policy</h1>
        <p className='mb-4 text-gray-700 dark:text-gray-300'>
          Linknote respects your privacy. We only collect the minimum information required to provide our service, such
          as your email address for authentication and your saved links and tags. We do not share your personal data
          with third parties, except as required to operate the application (e.g., authentication providers like
          Google).
        </p>
        <p className='mb-4 text-gray-700 dark:text-gray-300'>
          Your data is securely stored and you can delete your account and all associated data at any time. We do not
          use your information for advertising or marketing purposes.
        </p>
        <p className='text-gray-700 dark:text-gray-300'>
          If you have any questions about our privacy practices, please contact us at me@johnserrano.co.
        </p>
      </main>
      <Footer />
    </div>
  )
}
