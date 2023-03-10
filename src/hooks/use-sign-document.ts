import { useCallback } from 'react'

import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { Authorized, Authorship } from '../utils/schemas/authorship'
import { Proved } from '../utils/schemas/proof'
import { signDocument } from '../utils/signature'
import { getCurrentSnapshot } from '../utils/snapshot'
import { isTestnet } from '../utils/constants'
import useWallet from './use-wallet'

export default function useSignDocument(
  did?: string,
  template?: string,
): <T extends object>(
  document: T,
) => Promise<Proved<Authorized<T>> | undefined> {
  const { account, connect, signMessage } = useWallet()

  return useCallback(
    async (document) => {
      if (!did) {
        return
      }
      if (!account?.address) {
        connect()
        return
      }
      const coinType = requiredCoinTypeOfDidChecker(did)
      const snapshot = await getCurrentSnapshot(coinType)
      const authorship = {
        author: did,
        coin_type: coinType,
        snapshot,
        testnet: isTestnet || undefined,
      } satisfies Authorship
      const proof = await signDocument(
        { ...document, authorship },
        account.address,
        signMessage,
        template,
      )
      return { ...document, authorship, proof }
    },
    [did, connect, account?.address, signMessage, template],
  )
}
