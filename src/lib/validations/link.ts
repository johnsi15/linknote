import { z } from 'zod'

export const linkSchema = z.object({
  title: z
    .string()
    .min(1, 'The title is required')
    .transform(val => val.trim()),
  url: z
    .string()
    .url('URL invalid')
    .transform(val => val.trim()),
  description: z
    .string()
    .optional()
    .transform(val => val?.trim() || ''),
  tags: z.array(z.string().transform(val => val.trim())).default([]),
})
