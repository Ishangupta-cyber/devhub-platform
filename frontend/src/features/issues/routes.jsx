import { Route } from 'react-router-dom'
import Issues from './pages/Issues.jsx'
import CreateIssue from './pages/CreateIssue.jsx'
import IssueDetail from './pages/IssueDetail.jsx'

// relative to /repositories/:repoId (see RepoLayout)
const issueRoutes = (
  <>
    <Route path="issues" element={<Issues />} />
    <Route path="issues/new" element={<CreateIssue />} />
    <Route path="issues/:issueId" element={<IssueDetail />} />
  </>
)

export default issueRoutes
