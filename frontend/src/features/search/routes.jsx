import { lazy } from "react"
import { Route } from 'react-router-dom'
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"))
const searchRoutes = <Route path="/search" element={<SearchPage />} />

export default searchRoutes
