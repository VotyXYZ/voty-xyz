export const isTestnet = !!process.env.NEXT_PUBLIC_TESTNET

export const documentTitle = `Voty ${isTestnet ? 'Testnet' : 'Alpha'}`

export const commonCoinTypes = {
  ETH: 60,
  CKB: 309,
  AR: 472,
  MATIC: 966,
  BSC: 9006,
}

export const commonChainIds = {
  ETH: 1,
  ETH_GOERLI: 5,
  BSC: 56,
  BSC_CHAPEL: 97,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
}

export const chainIdToRpc: { [chainId: number]: string | undefined } = {
  [commonChainIds.ETH]: 'https://rpc.ankr.com/eth',
  [commonChainIds.ETH_GOERLI]: 'https://rpc.ankr.com/eth_goerli',
  [commonChainIds.BSC]: 'https://rpc.ankr.com/bsc',
  [commonChainIds.BSC_CHAPEL]: 'https://rpc.ankr.com/bsc_testnet_chapel',
  [commonChainIds.POLYGON]: 'https://rpc.ankr.com/polygon',
  [commonChainIds.POLYGON_MUMBAI]: 'https://rpc.ankr.com/polygon_mumbai',
}

export const chainIdToCoinType: { [chainId: number]: number | undefined } = {
  [isTestnet ? commonChainIds.ETH_GOERLI : commonChainIds.ETH]:
    commonCoinTypes.ETH,
  [isTestnet ? commonChainIds.BSC_CHAPEL : commonChainIds.BSC]:
    commonCoinTypes.BSC,
  [isTestnet ? commonChainIds.POLYGON_MUMBAI : commonChainIds.POLYGON]:
    commonCoinTypes.MATIC,
}

export const coinTypeToChainId: { [coinType: number]: number | undefined } = {
  [commonCoinTypes.ETH]: isTestnet
    ? commonChainIds.ETH_GOERLI
    : commonChainIds.ETH,
  [commonCoinTypes.MATIC]: isTestnet
    ? commonChainIds.POLYGON_MUMBAI
    : commonChainIds.POLYGON,
  [commonCoinTypes.BSC]: isTestnet
    ? commonChainIds.BSC_CHAPEL
    : commonChainIds.BSC,
}

export const coinTypeNames: { [coinType: number]: string | undefined } = {
  [commonCoinTypes.ETH]: 'Ethereum',
  [commonCoinTypes.CKB]: 'Nervos CKB',
  [commonCoinTypes.MATIC]: 'Polygon',
  [commonCoinTypes.BSC]: 'BNB Chain',
}

export const coinTypeExplorers: { [coinType: number]: string | undefined } = {
  [commonCoinTypes.ETH]: 'https://etherscan.io/block/',
  [commonCoinTypes.CKB]: 'https://explorer.nervos.org/block/',
  [commonCoinTypes.MATIC]: 'https://polygonscan.com/block/',
  [commonCoinTypes.BSC]: 'https://bscscan.com/block/',
}

export const coinTypeLogos: { [coinType: number]: string | undefined } = {
  [commonCoinTypes.ETH]: `/chains/${commonCoinTypes.ETH}.svg`,
  [commonCoinTypes.MATIC]: `/chains/${commonCoinTypes.MATIC}.svg`,
  [commonCoinTypes.BSC]: `/chains/${commonCoinTypes.BSC}.svg`,
}

export enum DataType {
  COMMUNITY = 'community',
  PROPOSAL = 'proposal',
  VOTE = 'vote',
}

export const cacheControl = [
  'Cache-Control',
  `public, s-maxage=1, stale-while-revalidate=${24 * 60 * 60}`,
] satisfies [string, string]
