import { Route } from "react-router-dom";
import OrganizationList from "./pages/OrganizationList";
import OrganizationDetail from "./pages/OrganizationDetail";




const organizationRoutes=(

  <>

  <Route path="/organizations" element={<OrganizationList/>}    />
  <Route path="/organizations/:orgId"   element={<OrganizationDetail/>}    />


  </>

)
export default organizationRoutes