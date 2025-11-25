import {Routes, Route, Outlet} from "react-router-dom"
import Navbar from "./components/layout/Navbar.tsx"
import HomePage from "./views/home/HomePage.tsx"
import Footer from "./components/layout/Footer.tsx"
import PatientGuidePage from "./views/guide/PatientGuidePage.tsx"
import ContactPage from "./views/contact/ContactPage.tsx"
import CalculatorPage from "./views/calculator/CalculatorPage.tsx"
import LoginPage from "./pages/LoginPage.tsx"
import {AuthProvider} from "./context/AuthContext.tsx"
import AdminRoute from './components/auth/AdminRoute.tsx'
import AdminPanel from './pages/AdminPanel.tsx'
import RegisterPage from "./pages/RegisterPage.tsx"
import UserProfile from "./pages/UserProfile.tsx"
import UserRoute from "./components/auth/UserRoute.tsx"
import {NotificationProvider} from "./context/NotificationContext.tsx"
import {ConfirmationProvider} from "./context/ConfirmationContext.tsx"

function AppLayout() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <Navbar/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
        </div>
    )
}

function App() {
    return (
        <NotificationProvider>
            <AuthProvider>
                <ConfirmationProvider>
                    <Routes>
                        <Route path="/" element={<AppLayout/>}>
                            <Route index element={<HomePage/>}/>
                            <Route path="przewodnik-pacjenta" element={<PatientGuidePage/>}/>
                            <Route path="kontakt" element={<ContactPage/>}/>
                            <Route path="kalkulator" element={<CalculatorPage/>}/>
                            <Route element={<UserRoute/>}>
                                <Route path="profile" element={<UserProfile/>}/>
                            </Route>
                        </Route>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/admin" element={<AdminRoute/>}>
                            <Route index element={<AdminPanel/>}/>
                        </Route>
                        <Route path="/rejestracja" element={<RegisterPage/>}/>
                    </Routes>
                </ConfirmationProvider>
            </AuthProvider>
        </NotificationProvider>
    )
}

export default App
