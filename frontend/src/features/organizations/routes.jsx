import { lazy } from "react"
import { Route } from "react-router-dom";
const OrganizationList = lazy(() => import("./pages/OrganizationList"))
const OrganizationDetail = lazy(() => import("./pages/OrganizationDetail"))
const organizationRoutes=(

  <>

  <Route path="/organizations" element={<OrganizationList/>}    />
  <Route path="/organizations/:orgId"   element={<OrganizationDetail/>}    />


  </>

)
export default organizationRoutes