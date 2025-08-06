import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, PlusIcon } from 'lucide-react'

export const TagInput = memo(function TagInput({
  value,
  onChange,
  onAdd,
  isLoading,
  error,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdd: () => void
  isLoading: boolean
  error: string | null
}) {
  return (
    <div className='flex space-x-2'>
      <Input
        placeholder='Enter tag name'
        value={value}
        onChange={onChange}
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        disabled={isLoading}
      />
      <Button onClick={onAdd} className='gap-2' disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className='animate-spin mr-2 h-4 w-4' /> Creating...
          </>
        ) : (
          <>
            <PlusIcon className='h-4 w-4' />
            Add Tag
          </>
        )}
      </Button>
      {error && <p className='text-xs text-red-500 mt-2'>{error}</p>}
    </div>
  )
})
