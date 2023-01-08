import Link from 'next/link'
import {
  Earth,
  Twitter,
  RobotOne,
  GithubOne,
  UserToUserTransmission,
  Info,
  SettingOne,
  NetworkTree,
} from '@icon-park/react'

import AvatarInput from '../../components/avatar-input'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import {
  organizationWithSignatureSchema,
  ProposalWithSignature,
} from '../../src/schemas'
import useRouterQuery from '../../hooks/use-router-query'
import { useList } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import ArweaveLink from '../../components/arweave-link'

export default function OrganizationIndexPage() {
  const [query] = useRouterQuery<['did']>()
  const { data: config } = useDidConfig(query.did)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )
  const { data: proposals } = useList<ProposalWithSignature>(
    DataType.PROPOSAL,
    [['did', query.did]],
  )

  return organization ? (
    <>
      <AvatarInput
        size={80}
        name={organization.profile.name}
        value={organization.profile.avatar}
        disabled
      />
      {config?.organization ? <ArweaveLink id={config.organization} /> : null}
      <h1>{organization.profile.name}</h1>
      <div className="menu bg-base-100 w-56 rounded-box">
        <ul>
          <li>
            <Link href={`/${query.did}`} className="active">
              <NetworkTree />
              Workgroups
            </Link>
          </li>
          {organization.workgroups?.map((workgroup) => (
            <li key={workgroup.id} className="ml-6">
              <Link href={`/${query.did}/workgroup/${workgroup.profile.name}`}>
                <AvatarInput
                  size={24}
                  name={workgroup.profile.name}
                  value={workgroup.profile.avatar}
                  disabled
                />
                {workgroup.profile.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href={`/delegate/${query.did}`}>
              <UserToUserTransmission />
              Delegate
            </Link>
          </li>
          <li>
            <Link href={`/${query.did}/about`}>
              <Info />
              About
            </Link>
          </li>
          <li>
            <Link href={`/${query.did}/settings`}>
              <SettingOne />
              Settings
            </Link>
          </li>
        </ul>
      </div>
      <div>
        {organization.profile.website ? (
          <button>
            <a href={organization.profile.website}>
              <Earth />
            </a>
          </button>
        ) : null}
        {organization.communities?.map((community, index) => (
          <button key={index}>
            <a
              href={`${
                {
                  twitter: 'https://twitter.com',
                  discord: 'https://discord.gg',
                  github: 'https://github.com',
                }[community.type]
              }/${community.value}`}
            >
              {
                {
                  twitter: <Twitter />,
                  discord: <RobotOne />,
                  github: <GithubOne />,
                }[community.type]
              }
            </a>
          </button>
        ))}
      </div>
      <ul>
        {proposals?.map((proposal) => (
          <li key={proposal.id}>
            <Link href={`/${query.did}/proposal/${proposal.id}`}>
              {proposal.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  ) : null
}
