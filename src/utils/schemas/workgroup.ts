import { z } from 'zod'

import { booleanSetsSchema, decimalSetsSchema } from './sets'

export const workgroupSchema = z.object({
  id: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  duration: z.object({
    // TODO: rename to pending
    announcement: z.number().min(3600, 'Minium 1 hour'),
    voting: z.number().min(3600, 'Minium 1 hour'),
  }),
  permission: z.object({
    proposing: booleanSetsSchema,
    voting: decimalSetsSchema,
  }),
  extension: z.object({
    introduction: z.string().max(160, 'Maximum 160 characters').optional(),
    terms_and_conditions: z.string().min(1, 'Required'),
  }),
})

export type Workgroup = z.infer<typeof workgroupSchema>
