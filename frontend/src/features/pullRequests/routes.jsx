import { Route } from 'react-router-dom'
import PullRequests from './pages/PullRequests.jsx'
import PullRequestDetail from './pages/pullRequestDetail.jsx'
import CreatePullRequest from './pages/createPullRequest.jsx'

const pullRequestRoutes = (
  <>
    <Route path="/repositories/:repoId/pull-requests" element={<PullRequests />} />
    <Route path="/repositories/:repoId/pull-requests/new" element={<CreatePullRequest />} />
    <Route path="/repositories/:repoId/pull-requests/:id" element={<PullRequestDetail />} />
  </>
)

export default pullRequestRoutes
