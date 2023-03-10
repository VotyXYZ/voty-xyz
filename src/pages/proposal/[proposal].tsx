import { useCallback, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { compact } from 'lodash-es'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'

import useWorkgroup from '../../hooks/use-workgroup'
import { stringifyChoice } from '../../utils/voting'
import { DetailItem, DetailList } from '../../components/basic/detail'
import { permalink2Explorer } from '../../utils/permalink'
import { trpc } from '../../utils/trpc'
import Article from '../../components/basic/article'
import TextButton from '../../components/basic/text-button'
import LoadingBar from '../../components/basic/loading-bar'
import {
  coinTypeExplorers,
  coinTypeNames,
  documentTitle,
} from '../../utils/constants'
import VoteForm from '../../components/vote-form'
import useRouterQuery from '../../hooks/use-router-query'

const StatusIcon = dynamic(() => import('../../components/status-icon'), {
  ssr: false,
})

const ProposalSchedule = dynamic(
  () => import('../../components/proposal-schedule'),
  {
    ssr: false,
    loading: () => (
      <DetailList title="Schedule">
        <DetailItem title="Period">{null}</DetailItem>
        <DetailItem title="Start">...</DetailItem>
        <DetailItem title="End">...</DetailItem>
      </DetailList>
    ),
  },
)

export default function ProposalPage() {
  const query = useRouterQuery<['proposal']>()
  const { data: proposal, isLoading } = trpc.proposal.getByPermalink.useQuery(
    { permalink: query.proposal },
    { enabled: !!query.proposal, refetchOnWindowFocus: false },
  )
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: proposal?.community },
      { enabled: !!proposal?.community, refetchOnWindowFocus: false },
    )
  const workgroup = useWorkgroup(community, proposal?.workgroup)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch: refetchList,
  } = trpc.vote.list.useInfiniteQuery(
    { proposal: query.proposal },
    { enabled: !!query.proposal, getNextPageParam: ({ next }) => next },
  )
  const votes = useMemo(() => data?.pages.flatMap(({ data }) => data), [data])
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const renderCard = useCallback(
    (className?: string) => (
      <div
        className={clsx(
          'relative mt-[-1px] w-full shrink-0 sm:sticky sm:top-18 sm:w-80 sm:pt-8',
          className,
        )}
      >
        <StatusIcon
          permalink={query.proposal}
          className="absolute right-4 top-4 sm:top-12"
        />
        <div className="space-y-6 rounded border border-gray-200 p-6">
          <DetailList title="Information">
            <DetailItem
              title="Community"
              className="truncate whitespace-nowrap"
            >
              {community?.name || '...'}
            </DetailItem>
            <DetailItem
              title="Workgroup"
              className="truncate whitespace-nowrap"
            >
              {workgroup?.name || '...'}
            </DetailItem>
            <DetailItem title="Proposer" className="truncate whitespace-nowrap">
              {proposal?.authorship.author || '...'}
            </DetailItem>
            <DetailItem title="Voting type">
              {proposal
                ? proposal.voting_type === 'single'
                  ? 'Single choice'
                  : 'Approval'
                : '...'}
            </DetailItem>
          </DetailList>
          <ProposalSchedule
            proposal={query.proposal}
            duration={workgroup?.duration}
          />
          {proposal?.snapshots ? (
            <DetailList title="Snapshots">
              {Object.entries(proposal.snapshots).map(
                ([coinType, snapshot]) => (
                  <DetailItem
                    key={coinType}
                    title={coinTypeNames[parseInt(coinType)] || coinType}
                  >
                    <TextButton
                      href={`${
                        coinTypeExplorers[parseInt(coinType)]
                      }${snapshot}`}
                    >
                      {snapshot}
                    </TextButton>
                  </DetailItem>
                ),
              )}
            </DetailList>
          ) : null}
          <DetailList title="Terms and conditions">
            <Article small className="pt-2">
              {workgroup?.extension.terms_and_conditions}
            </Article>
          </DetailList>
        </div>
      </div>
    ),
    [community?.name, proposal, query.proposal, workgroup],
  )
  const title = useMemo(
    () =>
      compact([
        proposal?.title,
        workgroup?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, proposal?.title, workgroup?.name],
  )

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="w-full">
        <LoadingBar loading={isLoading || isCommunityLoading} />
        <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
          <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
            <TextButton
              disabled={!community || !workgroup}
              href={`/${community?.authorship.author}/${workgroup?.id}`}
            >
              <h2 className="text-[1rem] font-semibold leading-6">??? Back</h2>
            </TextButton>
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h3 className="mt-4 break-words text-3xl font-bold leading-8 tracking-tight text-gray-900 line-clamp-2 sm:text-4xl">
                {proposal?.title || '...'}
              </h3>
              <Article className="mt-6 sm:mt-8">
                {proposal?.extension?.content}
              </Article>
            </div>
            {renderCard('block sm:hidden mb-6')}
            <VoteForm
              entry={community?.authorship.author}
              proposal={proposal || undefined}
              workgroup={workgroup}
              onSuccess={refetchList}
            />
            {proposal?.votes ? (
              <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
                {proposal.votes === 1 ? '1 Vote' : `${proposal.votes} Votes`}
              </h2>
            ) : null}
            {votes?.length ? (
              <table className="my-6 w-full border-separate border-spacing-0 rounded border border-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-18 rounded-t border-b border-gray-200 bg-white/80 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      DID
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 border-x border-b border-gray-200 bg-white/80 px-3 py-2 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      Choice
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 rounded-t border-b border-gray-200 bg-white/80 py-2 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      Power
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {votes.map((vote, index) => (
                    <tr key={vote.permalink}>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-4 pr-3 text-sm font-medium text-gray-900',
                        )}
                      >
                        {vote.authorship.author}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-x border-gray-200 px-3 py-2 text-sm text-gray-500',
                        )}
                      >
                        {proposal
                          ? stringifyChoice(proposal.voting_type, vote.choice)
                          : vote.choice}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-medium',
                        )}
                      >
                        <TextButton
                          primary
                          href={permalink2Explorer(vote.permalink)}
                        >
                          {vote.power}
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          {renderCard('hidden sm:block')}
        </div>
        <div ref={ref} />
      </div>
    </>
  )
}
