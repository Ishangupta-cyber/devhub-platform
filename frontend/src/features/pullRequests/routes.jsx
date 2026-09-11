import { Route } from 'react-router-dom'
import PullRequests from './pages/PullRequests.jsx'
import PullRequestDetail from './pages/pullRequestDetail.jsx'
import CreatePullRequest from './pages/createPullRequest.jsx'

// relative to /repositories/:repoId (see RepoLayout)
const pullRequestRoutes = (
  <>
    <Route path="pull-requests" element={<PullRequests />} />
    <Route path="pull-requests/new" element={<CreatePullRequest />} />
    <Route path="pull-requests/:id" element={<PullRequestDetail />} />
  </>
)

export default pullRequestRoutes
