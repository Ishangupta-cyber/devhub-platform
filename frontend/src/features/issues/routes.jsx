import { lazy } from "react"
import { Route } from 'react-router-dom'
const Issues = lazy(() => import("./pages/Issues.jsx"))
const CreateIssue = lazy(() => import("./pages/CreateIssue.jsx"))
const IssueDetail = lazy(() => import("./pages/IssueDetail.jsx"))
// relative to /repositories/:repoId (see RepoLayout)
const issueRoutes = (
  <>
    <Route path="issues" element={<Issues />} />
    <Route path="issues/new" element={<CreateIssue />} />
    <Route path="issues/:issueId" element={<IssueDetail />} />
  </>
)

export default issueRoutes
