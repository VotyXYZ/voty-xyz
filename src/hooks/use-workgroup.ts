import { useMemo } from 'react'

import { Community } from '../utils/schemas/community'

export default function useWorkgroup(
  community?: Community | null,
  workgroup?: string,
) {
  return useMemo(
    () => community?.workgroups?.find(({ id }) => id === workgroup),
    [community?.workgroups, workgroup],
  )
}
