import { Route } from "react-router-dom"
import PullRequests from "./pages/PullRequests"
import pullRequestDetail from "./pages/pullRequestDetail"
import ProtectedRoute from "../../components/ProtectedRoute"
import createPullRequest from "./pages/createPullRequest"



const PullRequests=(
  <>
    <Route path="/repositories/:repoId/pull-requests" element={<PullRequests/>} />
    <Route path="/repositoires/:repoId/pull-requests/:id" element={<pullRequestDetail/>}   />
    <Route
      path="/repositories/:repoId/pull-requests/new"
      element={
        <ProtectedRoute>
          <createPullRequest/>
        </ProtectedRoute>
      }
    />
  
  </>
)

export default PullRequests