// ./Services/Router.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Doctors from '../Pages/Doctors';
import NotFound from '../Pages/NotFound';
import Home from '../Pages/Home';
import DoctorsDetails from '../Pages/DoctorsDetails';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    
    <Route path="/home" element={<Home />} />
    <Route path="/doctors" element={<Doctors />} />
    <Route path="/doctors/:value" element={<DoctorsDetails />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;

