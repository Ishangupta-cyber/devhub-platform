import { Route } from "react-router-dom";
import WikiPages from "./pages/WikiPages";
import WikiPageDetail from "./pages/WikiPageDetail";


const wikiRoutes=(
  <>
  <Route element={<WikiPages/>} path="/repositories/:repoId/wiki"  />
  <Route element={<WikiPageDetail/>} path="/repositories/:repoId/wiki/:slug"  />
  </>
)

export default wikiRoutes