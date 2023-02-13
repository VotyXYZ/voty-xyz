import { useCallback } from 'react'
import { useRouter } from 'next/router'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import { useEntry } from '../../hooks/use-api'
import CommunityLayout from '../../components/layouts/community'
import useDidIsMatch from '../../hooks/use-did-is-match'
import useWallet from '../../hooks/use-wallet'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const [query] = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: community, mutate } = useEntry(query.entry)
  const { data: isAdmin } = useDidIsMatch(query.entry, account)
  const handleSuccess = useCallback(() => {
    mutate()
    router.push(`/${query.entry}`)
  }, [mutate, query.entry, router])

  return (
    <CommunityLayout>
      {query.entry ? (
        <div className="flex w-full flex-col">
          <CommunityForm
            entry={query.entry}
            community={community}
            onSuccess={handleSuccess}
            disabled={!isAdmin}
            className="pl-6"
          />
        </div>
      ) : null}
    </CommunityLayout>
  )
}
