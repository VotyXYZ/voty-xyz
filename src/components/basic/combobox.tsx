import { useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox as HeadlessCombobox } from '@headlessui/react'
import clsx from 'clsx'

type Option = {
  did: string
  disabled?: boolean
}

export default function Combobox(props: {
  options: Option[]
  label?: string
  value: string
  onChange(value: string): void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const filteredOptions =
    query === ''
      ? props.options
      : props.options.filter((option) => {
          return option.did.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <HeadlessCombobox
      as="div"
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled}
    >
      <HeadlessCombobox.Label className="block text-sm font-medium text-gray-700">
        {props.label}
      </HeadlessCombobox.Label>
      <div className="relative mt-1">
        <HeadlessCombobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
        />
        <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </HeadlessCombobox.Button>
        {filteredOptions.length > 0 && (
          <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <HeadlessCombobox.Option
                key={option.did}
                value={option.did}
                disabled={option.disabled}
                className={({ active }) =>
                  clsx(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-primary-600 text-white' : 'text-gray-900',
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <span
                        className={clsx(
                          'inline-block h-2 w-2 shrink-0 rounded-full',
                          option.disabled ? 'bg-gray-200' : 'bg-green-400',
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={clsx(
                          'ml-3 truncate',
                          selected && 'font-semibold',
                        )}
                      >
                        {option.did}
                        <span className="sr-only">
                          {' '}
                          is {option.disabled ? 'offline' : 'online'}
                        </span>
                      </span>
                    </div>
                    {selected && (
                      <span
                        className={clsx(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-primary-600',
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))}
          </HeadlessCombobox.Options>
        )}
      </div>
    </HeadlessCombobox>
  )
}
