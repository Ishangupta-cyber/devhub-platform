import { Route } from "react-router-dom"
import PullRequests from "./pages/PullRequests"
import PullRequestDetail from "./pages/pullRequestDetail"
import ProtectedRoute from "../../components/ProtectedRoute"
import CreatePullRequest from "./pages/createPullRequest"

const pullRequestRoutes = (
  <>
    <Route path="/repositories/:repoId/pull-requests" element={<PullRequests/>} />
    <Route path="/repositories/:repoId/pull-requests/:id" element={<PullRequestDetail/>}   />
    <Route
      path="/repositories/:repoId/pull-requests/new"
      element={
        <ProtectedRoute>
          <CreatePullRequest/>
        </ProtectedRoute>
      }
    />

  </>
)

export default pullRequestRoutes
