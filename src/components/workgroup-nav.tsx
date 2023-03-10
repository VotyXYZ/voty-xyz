import { BriefcaseIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { compact } from 'lodash-es'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Head from 'next/head'

import useWorkgroup from '../hooks/use-workgroup'
import useRouterQuery from '../hooks/use-router-query'
import { extractStartEmoji } from '../utils/emoji'
import { trpc } from '../utils/trpc'
import { documentTitle } from '../utils/constants'

export default function WorkgroupNav(props: { className?: string }) {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const workgroup = useWorkgroup(community, query.workgroup)
  const router = useRouter()
  const tabs = useMemo(
    () => [
      {
        name: 'Proposals',
        href: `/${query.entry}/${query.workgroup}`,
        current: router.pathname === '/[entry]/[workgroup]',
      },
      {
        name: 'Rules',
        href: `/${query.entry}/${query.workgroup}/rules`,
        current: router.pathname === '/[entry]/[workgroup]/rules',
      },
    ],
    [query.entry, query.workgroup, router.pathname],
  )
  const emoji = useMemo(
    () => extractStartEmoji(workgroup?.name),
    [workgroup?.name],
  )
  const name = useMemo(
    () => workgroup?.name.replace(emoji || '', ''),
    [emoji, workgroup?.name],
  )
  const title = useMemo(
    () => compact([name, community?.name, documentTitle]).join(' - '),
    [community?.name, name],
  )

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={clsx('bg-white/80 backdrop-blur', props.className)}>
        <div className="flex h-10 items-center">
          {emoji ? (
            <span
              className="mr-3 w-8 shrink-0 text-center text-3xl text-gray-400"
              aria-hidden="true"
            >
              {emoji}
            </span>
          ) : (
            <BriefcaseIcon
              className="mr-3 h-8 w-8 shrink-0 text-gray-400"
              aria-hidden="true"
            />
          )}
          <h3 className="mr-4 w-0 flex-1 truncate text-2xl font-medium text-gray-900">
            {name || '...'}
          </h3>
        </div>
        {workgroup?.extension.introduction ? (
          <p className="mt-2 text-sm text-gray-500 line-clamp-1">
            {workgroup.extension.introduction}
          </p>
        ) : null}
        <div className="mt-2 border-b">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                scroll={false}
                className={clsx(
                  tab.current
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'h-14 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                )}
                aria-current={tab.current ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
