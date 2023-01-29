import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { resolveDid } from '../../../src/did'
import { checkProposerLiberty } from '../../../src/functions/proposer-liberty'
import {
  communityWithSignatureSchema,
  proposalWithSignatureSchema,
} from '../../../src/schemas'
import { verifySignature, wrapJsonMessage } from '../../../src/signature'
import { mapSnapshots, getCurrentSnapshot } from '../../../src/snapshot'
import { DID } from '../../../src/types'
import { getArweaveTags } from '../../../src/utils/arweave-tags'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

const textEncoder = new TextEncoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // verify schema
  const proposalWithSignature = proposalWithSignatureSchema.safeParse(req.body)
  if (!proposalWithSignature.success) {
    res.status(400).send(`schema error: ${proposalWithSignature.error.message}`)
    return
  }

  // verify author
  const { author, ...proposal } = proposalWithSignature.data
  const snapshot = BigInt(author.snapshot)
  const { coinType, address } = await resolveDid(author.did, {
    [author.coin_type]: snapshot,
  })
  if (
    coinType !== author.coin_type ||
    address !== author.address ||
    !verifySignature(await wrapJsonMessage(proposal), author)
  ) {
    res.status(400).send('invalid author')
    return
  }

  // check snapshot timeliness
  const currentSnapshot = await getCurrentSnapshot(coinType)
  if (
    currentSnapshot > snapshot + BigInt(5) ||
    currentSnapshot < snapshot - BigInt(5)
  ) {
    res.status(400).send('outdated snapshot')
    return
  }

  const communityWithSignature = communityWithSignatureSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(proposal.community, {
        decode: true,
        string: true,
      })) as string,
    ),
  )
  if (!communityWithSignature.success) {
    res
      .status(400)
      .send(`community schema error: ${communityWithSignature.error.message}`)
    return
  }

  const group = communityWithSignature.data.groups?.find(
    ({ id }) => id === proposal.group,
  )
  if (!group) {
    res.status(400).send('group not found')
    return
  }

  if (
    !(await checkProposerLiberty(
      group.proposer_liberty,
      proposalWithSignature.data.author.did as DID,
      mapSnapshots(proposalWithSignature.data.snapshots),
    ))
  ) {
    res.status(400).send('does not have proposer liberty')
    return
  }

  // TODO: extra verifies

  const data = Buffer.from(
    textEncoder.encode(JSON.stringify(proposalWithSignature.data)),
  )
  const transaction = await arweave.createTransaction({ data })
  const tags = getArweaveTags(proposalWithSignature.data)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)

  await database.proposal.upsert({
    where: { id: transaction.id },
    create: {
      id: transaction.id,
      did: proposal.did,
      community: proposal.community,
      group: proposal.group,
      data,
    },
    update: {
      did: proposal.did,
      community: proposal.community,
      group: proposal.group,
      data,
    },
  })

  res.status(200).json(uploader)
}
