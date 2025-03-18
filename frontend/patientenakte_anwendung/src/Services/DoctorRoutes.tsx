import { Routes, Route } from "react-router-dom";
import NotFound from "../Pages/NotFound";
import Home from "../Pages/Home";
import Patients from "../Pages/Doctor/Patients";
import PatientsDetails from "../Pages/Doctor/PatientsDetails";


type AddressProps = {
    address: string;
};

const DoctorRoutes = (props: AddressProps) => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patients" element={<Patients address={props.address} />} />
            <Route path="/patients/:value" element={<PatientsDetails address={props.address} />} />
            <Route path="*" element={<NotFound />} /> {/* 404-Fehlerseite */}
        </Routes>
    );
}

export default DoctorRoutes;
