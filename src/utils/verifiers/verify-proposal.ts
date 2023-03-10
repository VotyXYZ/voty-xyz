import { TRPCError } from '@trpc/server'

import { checkBoolean } from '../functions/boolean'
import { Authorized } from '../schemas/authorship'
import { Community } from '../schemas/community'
import { Workgroup } from '../schemas/workgroup'
import { Proved } from '../schemas/proof'
import { Proposal } from '../schemas/proposal'
import { getByPermalink } from '../database'
import { commonCoinTypes, DataType } from '../constants'
import { getPermalinkSnapshot, getSnapshotTimestamp } from '../snapshot'

export default async function verifyProposal(
  proposal: Proved<Authorized<Proposal>>,
): Promise<{
  community: Proved<Authorized<Community>>
  workgroup: Workgroup
}> {
  const [timestamp, data] = await Promise.all([
    getPermalinkSnapshot(proposal.community).then((snapshot) =>
      getSnapshotTimestamp(commonCoinTypes.AR, snapshot),
    ),
    getByPermalink(DataType.COMMUNITY, proposal.community),
  ])
  if (!timestamp || !data) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community not found' })
  }
  const community = data.data

  const workgroup = community.workgroups?.find(
    ({ id }) => id === proposal.workgroup,
  )
  if (!workgroup) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Workgroup not found' })
  }

  if (
    !(await checkBoolean(
      workgroup.permission.proposing,
      proposal.authorship.author,
      proposal.snapshots,
    ))
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Proposing permission denied',
    })
  }

  return { community, workgroup }
}
