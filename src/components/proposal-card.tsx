import clsx from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import useWorkgroup from '../hooks/use-workgroup'
import { Period } from '../utils/period'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Proposal } from '../utils/schemas/proposal'
import { formatDurationMs } from '../utils/time'
import { trpc } from '../utils/trpc'

export default function ProposalCard(props: {
  proposal: Authorized<Proposal> & {
    permalink: string
    votes: number
    ts: Date
    ts_pending: Date | null
    ts_voting: Date | null
  }
}) {
  const { data: community } = trpc.community.getByPermalink.useQuery(
    { permalink: props.proposal.community },
    { refetchOnWindowFocus: false },
  )
  const workgroup = useWorkgroup(community, props.proposal.workgroup)
  const now = useMemo(() => Date.now(), [])
  const period = useMemo(
    () =>
      props.proposal.ts_pending && props.proposal.ts_voting
        ? now < props.proposal.ts_pending.getTime()
          ? Period.PENDING
          : now < props.proposal.ts_voting.getTime()
          ? Period.VOTING
          : Period.ENDED
        : Period.CONFIRMING,
    [props.proposal.ts_pending, props.proposal.ts_voting, now],
  )

  return (
    <Link
      shallow
      href={`/proposal/${permalink2Id(props.proposal.permalink)}`}
      className="block divide-y rounded border transition-colors focus-within:ring-2 focus-within:ring-primary-500 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <p className="truncate text-lg font-medium text-gray-800">
          {props.proposal.title}
        </p>
        {props.proposal.extension?.content ? (
          <p className="text-gray-600 line-clamp-3">
            {props.proposal.extension.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p>Proposer</p>
          <p className="truncate text-gray-400">
            {props.proposal.authorship.author}
          </p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          {workgroup ? (
            period === Period.CONFIRMING ? (
              <>
                <p className="truncate">Transaction confirming</p>
                <p className="truncate text-gray-400">
                  <PeriodDot value={period} className="mb-0.5 mr-1.5" />
                  in about 5 minutes
                </p>
              </>
            ) : period === Period.PENDING && props.proposal.ts_pending ? (
              <>
                <p>Voting starts</p>
                <p className="text-gray-400">
                  <PeriodDot value={period} className="mb-0.5 mr-1.5" />
                  in&nbsp;
                  {formatDurationMs(props.proposal.ts_pending.getTime() - now)}
                </p>
              </>
            ) : period === Period.VOTING && props.proposal.ts_voting ? (
              <>
                <p>Voting ends</p>
                <p className="text-gray-400">
                  <PeriodDot value={period} className="mb-0.5 mr-1.5" />
                  in&nbsp;
                  {formatDurationMs(props.proposal.ts_voting.getTime() - now)}
                </p>
              </>
            ) : period === Period.ENDED && props.proposal.ts_voting ? (
              <>
                <p>Voting ended</p>
                <p className="text-gray-400">
                  <PeriodDot value={period} className="mb-0.5 mr-1.5" />
                  {formatDurationMs(props.proposal.ts_voting.getTime() - now)}
                  &nbsp;ago
                </p>
              </>
            ) : null
          ) : null}
        </div>
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p>Votes</p>
          <p className="text-gray-400">{props.proposal.votes}</p>
        </div>
      </div>
    </Link>
  )
}

function PeriodDot(props: { value?: Period; className?: string }) {
  return (
    <svg
      className={clsx(
        'mb-0.5 mr-1.5 inline h-2 w-2',
        props.value
          ? {
              [Period.CONFIRMING]: 'text-blue-400',
              [Period.PENDING]: 'text-yellow-400',
              [Period.VOTING]: 'text-green-400',
              [Period.ENDED]: 'text-gray-400',
            }[props.value]
          : undefined,
        props.className,
      )}
      fill="currentColor"
      viewBox="0 0 8 8"
    >
      {props.value ? <circle cx={4} cy={4} r={3} /> : null}
    </svg>
  )
}
