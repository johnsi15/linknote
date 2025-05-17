import { useQueryState } from 'nuqs'

export function useTagFilter() {
  return useQueryState('tag', {
    defaultValue: '',
    parse: value => value,
    serialize: value => value,
  })
}
