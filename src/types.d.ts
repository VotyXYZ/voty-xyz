export type DID = `${string}.bit` | `${string}.eth`

export type ProposerLibertyFunction<T> = (
  ...args: T
) => (did: DID, snapshot: bigint) => boolean

export type VotingPowerFunction<T> = (
  ...args: T
) => (did: DID, snapshot: bigint) => number
