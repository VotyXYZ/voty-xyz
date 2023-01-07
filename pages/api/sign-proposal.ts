import Arweave from 'arweave'
import type { NextApiRequest, NextApiResponse } from 'next'

import { resolveDid } from '../../src/did'
import {
  organizationWithSignatureSchema,
  proposalWithSignatureSchema,
} from '../../src/schemas'
import { verifySignature, wrapJsonMessage } from '../../src/signature'
import { getCurrentSnapshot } from '../../src/snapshot'
import { getArweaveTags } from '../../src/utils/arweave-tags'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

const jwk = JSON.parse(process.env.ARWEAVE_KEY_FILE!)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // verify schema
  const proposal = proposalWithSignatureSchema.safeParse(req.body)
  if (!proposal.success) {
    res.status(400).send(`schema error: ${proposal.error.message}`)
    return
  }

  // verify signature
  const { signature, ...data } = proposal.data
  const snapshot = BigInt(signature.snapshot)
  const { coinType, address } = await resolveDid(signature.did, {
    [signature.coin_type]: snapshot,
  })
  if (
    coinType !== signature.coin_type ||
    address !== signature.address ||
    !verifySignature(await wrapJsonMessage(data), signature)
  ) {
    res.status(400).send('invalid signature')
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

  const organization = organizationWithSignatureSchema.safeParse(
    JSON.parse(
      (await arweave.transactions.getData(data.organization, {
        decode: true,
        string: true,
      })) as string,
    ),
  )
  if (!organization.success) {
    res
      .status(400)
      .send(`organization schema error: ${organization.error.message}`)
    return
  }

  // TODO: extra verifies

  const transaction = await arweave.createTransaction({
    data: JSON.stringify(proposal.data),
  })
  const tags = getArweaveTags(proposal.data, organization.data.signature.did)
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value)
  })
  await arweave.transactions.sign(transaction, jwk)
  const uploader = await arweave.transactions.getUploader(transaction)
  res.status(200).json(uploader)
}
