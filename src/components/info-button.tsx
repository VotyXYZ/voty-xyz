import { Menu } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { BugAntIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Link from 'next/link'

import Dropdown from './basic/dropdown'
import { DotbitIcon, GitHubIcon, TwitterIcon } from './icons'

export default function InfoButton() {
  return (
    <Dropdown
      trigger={
        <div
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-200',
          )}
        >
          <EllipsisVerticalIcon className="h-6 w-6 text-gray-600 hover:text-gray-700" />
        </div>
      }
    >
      <div className="py-1">
        <Menu.Item>
          {({ active }) => (
            <Link
              href="/about"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <InformationCircleIcon
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              About Voty
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://discord.gg/8P6vSwwMzk"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <BugAntIcon
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              Feedback
            </a>
          )}
        </Menu.Item>
      </div>
      <div className="py-1">
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://www.did.id/"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <DotbitIcon
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              .bit
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://github.com/VotyXYZ/voty-xyz"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <GitHubIcon
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              GitHub
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://twitter.com/voty_xyz"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <TwitterIcon
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              Twitter
            </a>
          )}
        </Menu.Item>
      </div>
    </Dropdown>
  )
}
