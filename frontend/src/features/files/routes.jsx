import { lazy } from "react"
import { Route } from 'react-router-dom'
const CodePage = lazy(() => import("./pages/CodePage.jsx"))
const fileRoutes = (
  <>
    <Route path="code" element={<CodePage />} />
  </>
)

export default fileRoutes