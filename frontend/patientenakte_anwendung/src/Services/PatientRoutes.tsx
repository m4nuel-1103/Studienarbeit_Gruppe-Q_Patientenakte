import { Routes, Route } from "react-router-dom";
import NotFound from "../Pages/NotFound";
import Doctors from "../Pages/Patient/Doctors";
import DoctorsDetails from "../Pages/Patient/DoctorsDetails";
import Home from "../Pages/Home";

type PatientRoutesProps = {
    patientAddress: string;
};

const PatientRoutes = (props: PatientRoutesProps) => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:value" element={<DoctorsDetails patientAddress={props.patientAddress} />} />
            <Route path="*" element={<NotFound />} /> {/* 404-Fehlerseite */}
        </Routes>
    );
}

export default PatientRoutes;
