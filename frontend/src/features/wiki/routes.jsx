import { lazy } from "react"
import { Route } from 'react-router-dom'
const WikiPages = lazy(() => import("./pages/WikiPages.jsx"))
const WikiPageDetail = lazy(() => import("./pages/WikiPageDetail.jsx"))
// relative to /repositories/:repoId (see RepoLayout)
const wikiRoutes = (
  <>
    <Route path="wiki" element={<WikiPages />} />
    <Route path="wiki/:slug" element={<WikiPageDetail />} />
  </>
)

export default wikiRoutes
