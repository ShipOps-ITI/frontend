import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Companies from "./pages/Companies/Companies";
import Fleets from "./pages/Fleets/Fleets";
import Ships from "./pages/Ships/Ships";
import Register from "./pages/Auth/Register"; 
import Login from "./pages/Auth/Login";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/fleets" element={<Fleets />} />
        <Route path="/ships" element={<Ships />} />
        <Route path="*" element={<Navigate to="/companies" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
