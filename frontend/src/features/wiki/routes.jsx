import { Route } from 'react-router-dom'
import WikiPages from './pages/WikiPages.jsx'
import WikiPageDetail from './pages/WikiPageDetail.jsx'

// relative to /repositories/:repoId (see RepoLayout)
const wikiRoutes = (
  <>
    <Route path="wiki" element={<WikiPages />} />
    <Route path="wiki/:slug" element={<WikiPageDetail />} />
  </>
)

export default wikiRoutes
