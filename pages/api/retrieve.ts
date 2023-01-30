import { NextApiRequest, NextApiResponse } from 'next'

import { DataType } from '../../src/constants'
import { database } from '../../src/database'
import {
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  voteWithAuthorSchema,
} from '../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    id: string
    type: DataType
  }
  switch (query.type) {
    case DataType.COMMUNITY: {
      const community = await database.community.findUnique({
        where: { id: query.id },
      })
      if (community) {
        res.json({
          data: communityWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(community.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    case DataType.PROPOSAL: {
      const proposal = await database.proposal.findUnique({
        where: { id: query.id },
      })
      if (proposal) {
        res.json({
          data: proposalWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(proposal.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    case DataType.VOTE: {
      const vote = await database.vote.findUnique({
        where: { id: query.id },
      })
      if (vote) {
        res.json({
          data: voteWithAuthorSchema.parse(
            JSON.parse(textDecoder.decode(vote.data)),
          ),
        })
      } else {
        res.status(404).send(null)
      }
      break
    }
    default: {
      res.status(404).send(null)
      break
    }
  }
}
