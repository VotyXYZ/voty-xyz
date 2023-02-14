import { TRPCError } from '@trpc/server'
import { compact, last } from 'lodash-es'
import { z } from 'zod'

import { database } from '../../utils/database'
import { proposalWithAuthorSchema } from '../../utils/schemas'
import { procedure, router } from '../trpc'

const textDecoder = new TextDecoder()

export const proposalRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().nullish() }))
    .output(proposalWithAuthorSchema)
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const proposal = await database.proposal.findUnique({
        where: { permalink: input.permalink },
      })
      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return proposalWithAuthorSchema.parse(
        JSON.parse(textDecoder.decode(proposal.data)),
      )
    }),
  list: procedure
    .input(
      z.object({
        entry: z.string().nullish(),
        group: z.string().nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .output(
      z.object({
        data: z.array(
          proposalWithAuthorSchema.merge(z.object({ permalink: z.string() })),
        ),
        next: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.entry) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const proposals = await database.proposal.findMany({
        cursor: input.cursor ? { permalink: input.cursor } : undefined,
        where: input.group
          ? { entry: input.entry, group: input.group }
          : { entry: input.entry },
        take: 50,
        orderBy: { ts: 'desc' },
      })
      return {
        data: compact(
          proposals.map(({ permalink, data }) => {
            try {
              return {
                permalink,
                ...proposalWithAuthorSchema.parse(
                  JSON.parse(textDecoder.decode(data)),
                ),
              }
            } catch {
              return
            }
          }),
        ),
        next: last(proposals)?.permalink,
      }
    }),
})

export type proposalRouter = typeof proposalRouter