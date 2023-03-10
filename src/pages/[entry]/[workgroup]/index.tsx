import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import useRouterQuery from '../../../hooks/use-router-query'
import ProposalCard from '../../../components/proposal-card'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import EmptyState from '../../../components/empty-state'
import CreateProposalButton from '../../../components/create-proposal-button'
import Select from '../../../components/basic/select'
import { Period } from '../../../utils/period'

export default function GroupIndexPage() {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const [period, setPeriod] = useState<Period | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.proposal.list.useInfiniteQuery(
      {
        entry: query.entry,
        workgroup: query.workgroup,
        period: period === 'All' ? undefined : period,
      },
      {
        enabled: !!query.entry && !!query.workgroup,
        getNextPageParam: ({ next }) => next,
      },
    )
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const proposals = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])

  return (
    <CommunityLayout>
      <WorkgroupLayout>
        <LoadingBar loading={isLoading} />
        <div className="my-5 flex justify-between">
          <Select
            options={[
              'All',
              Period.CONFIRMING,
              Period.PENDING,
              Period.VOTING,
              Period.ENDED,
            ]}
            value={period}
            onChange={(p) => setPeriod(p as Period | 'All')}
          />
          <CreateProposalButton
            entry={query.entry}
            workgroup={query.workgroup}
            community={community?.entry.community}
          />
        </div>
        {proposals?.length === 0 ? (
          <EmptyState title="No proposals" className="mt-24" />
        ) : (
          <ul role="list" className="mt-5 space-y-5">
            {proposals?.map((proposal) => (
              <li key={proposal.permalink}>
                <ProposalCard proposal={proposal} />
              </li>
            ))}
          </ul>
        )}
        <div ref={ref} />
      </WorkgroupLayout>
    </CommunityLayout>
  )
}
