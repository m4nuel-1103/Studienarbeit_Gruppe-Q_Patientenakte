import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";

import NotFound from "../Pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} /> {/* 404-Fehlerseite */}
    </Routes>
  );
}

export default AppRoutes;
