import { Fragment, ReactNode, useEffect, useState } from 'react'
import { Portal, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Notification(props: {
  show: boolean
  children: ReactNode
}) {
  const [show, setShow] = useState(props.show)
  useEffect(() => {
    setShow(!!props.show)
    const timer = setTimeout(() => {
      setShow(false)
    }, 30000)
    return () => {
      clearTimeout(timer)
    }
  }, [props.show])

  return (
    <Portal>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 top-16 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded bg-white shadow-lg ring-1 ring-black/5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">Error</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {props.children}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0">
                    <button
                      type="button"
                      className="inline-flex bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                      onClick={() => {
                        setShow(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Portal>
  )
}
