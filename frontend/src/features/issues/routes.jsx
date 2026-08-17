import { Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'
import Issues from './pages/Issues.jsx'
import CreateIssue from './pages/CreateIssue.jsx'
import IssueDetail from './pages/IssueDetail.jsx'

const issueRoutes = (
  <>
    <Route path="/repositories/:repoId/issues" element={<Issues />} />
    <Route path="/repositories/:repoId/issues/:issueId" element={<IssueDetail />} />
    <Route
      path="/repositories/:repoId/issues/new"
      element={
        <ProtectedRoute>
          <CreateIssue />
        </ProtectedRoute>
      }
    />
  </>
)

export default issueRoutes
