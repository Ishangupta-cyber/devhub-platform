export const TYPE_TO_KEY = {
  repository: 'repositories',
  issue: 'issues',
  user: 'users',
  wiki: 'wiki_pages',
}

export const CATEGORY_LABELS = {
  repositories: 'Repositories',
  issues: 'Issues',
  users: 'Users',
  wiki_pages: 'Wiki pages',
}

/** Where a result navigates to. Shapes come from search/serailizers.py. */
export const getResultLink = (categoryKey, item) => {
  switch (categoryKey) {
    case 'repositories':
      return `/repositories/${item.id}`
    case 'issues':
      return `/repositories/${item.repository_id}/issues/${item.id}`
    case 'users':
      return `/profile/${item.username}`
    case 'wiki_pages':
      return `/repositories/${item.repository_id}/wiki/${item.slug}`
    default:
      return '/'
  }
}

export const getResultTitle = (categoryKey, item) => {
  switch (categoryKey) {
    case 'repositories':
      return item.name
    case 'issues':
    case 'wiki_pages':
      return item.title
    case 'users':
      return item.full_name || item.username
    default:
      return ''
  }
}

export const getResultSubtitle = (categoryKey, item) => {
  switch (categoryKey) {
    case 'repositories':
      return item.description ? `@${item.owner} · ${item.description}` : `@${item.owner}`
    case 'issues':
      return `${item.repository_name} · ${item.status}`
    case 'users':
      return `@${item.username}`
    case 'wiki_pages':
      return item.repository_name
    default:
      return ''
  }
}
