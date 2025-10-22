import {Routes, Route, Outlet} from "react-router-dom";
import Navbar from "./components/layout/Navbar.tsx";
import HomePage from "./views/home/HomePage.tsx";
import Footer from "./components/layout/Footer.tsx";
import PatientGuidePage from "./views/guide/PatientGuidePage.tsx";
import ContactPage from "./views/contact/ContactPage.tsx";

function AppLayout() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
function App() {
  return (
     <Routes>
         <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="przewodnik-pacjenta" element={<PatientGuidePage />} />
             <Route path="kontakt" element={<ContactPage />} />
         </Route>
     </Routes>
  )
}

export default App
