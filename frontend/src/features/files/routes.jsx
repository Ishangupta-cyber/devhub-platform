import { Route } from 'react-router-dom'
import CodePage from './pages/CodePage.jsx'

const fileRoutes = (
  <>
    <Route path="code" element={<CodePage />} />
  </>
)

export default fileRoutes