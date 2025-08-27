import { Footer } from '@/components/ui/footer'
import { Header } from '@/components/ui/header'

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen flex flex-col justify-between'>
      <Header />
      <main className='max-w-2xl mx-auto py-12 px-4'>
        <h1 className='text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300'>Terms of Service</h1>
        <p className='mb-4 text-gray-700 dark:text-gray-300'>
          By using Linknote, you agree to use the service responsibly and not for any unlawful activities. We provide
          Linknote as-is, without warranties, and reserve the right to modify or discontinue the service at any time.
        </p>
        <p className='mb-4 text-gray-700 dark:text-gray-300'>
          You are responsible for the content you save and share. We are not liable for any loss or damage resulting
          from your use of Linknote.
        </p>
        <p className='text-gray-700 dark:text-gray-300'>
          For questions about these terms, please contact us at me@johnserrano.co.
        </p>
      </main>
      <Footer />
    </div>
  )
}
