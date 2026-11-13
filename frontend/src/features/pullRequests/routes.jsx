import { lazy } from "react"
import { Route } from 'react-router-dom'
const PullRequests = lazy(() => import("./pages/PullRequests.jsx"))
const PullRequestDetail = lazy(() => import("./pages/pullRequestDetail.jsx"))
const CreatePullRequest = lazy(() => import("./pages/createPullRequest.jsx"))
// relative to /repositories/:repoId (see RepoLayout)
const pullRequestRoutes = (
  <>
    <Route path="pull-requests" element={<PullRequests />} />
    <Route path="pull-requests/new" element={<CreatePullRequest />} />
    <Route path="pull-requests/:id" element={<PullRequestDetail />} />
  </>
)

export default pullRequestRoutes
