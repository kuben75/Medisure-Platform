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
import UserProfile from "./components/users/UserProfile.tsx"
import UserRoute from "./components/auth/UserRoute.tsx"
import {NotificationProvider} from "./context/NotificationContext.tsx"
import {ConfirmationProvider} from "./context/ConfirmationContext.tsx"
import {FavoritesProvider} from "./context/FavouritesContext.tsx"
import {ComparisonProvider} from "./context/ComparisonContext.tsx"
import OnboardingModal from "./components/users/OnboardingModal.tsx"
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.tsx"
import FaqPage from "./pages/FaqPage.tsx"
import ScrollToTop from "./utils/ScrollToTop.tsx"
import CookieConsent from "./components/ui/CookieConsent.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import ConfirmEmailPage from "./pages/ConfirmEmailPage.tsx";

function AppLayout() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <Navbar/>
            <main>
                <Outlet/>
            </main>
            <Footer/>
            <OnboardingModal/>
            <CookieConsent />
        </div>
    )
}

function App() {
    return (
        <NotificationProvider>
            <ConfirmationProvider>
                <AuthProvider>
                    <FavoritesProvider>
                        <ComparisonProvider>
                                <ScrollToTop/>
                                <Routes>
                                    <Route path="/rejestracja" element={<RegisterPage/>}/>
                                    <Route path="/login" element={<LoginPage/>}/>
                                    <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage/>}/>
                                    <Route path="/faq" element={<FaqPage/>}/>
                                    <Route path="/reset-hasla" element={<ResetPasswordPage />} />
                                    <Route path="/potwierdz-email" element={<ConfirmEmailPage />} />
                                    <Route path="/zapomnialem-hasla" element={<ForgotPasswordPage />} />
                                    <Route path="/" element={<AppLayout/>}>
                                        <Route index element={<HomePage/>}/>
                                        <Route path="przewodnik-pacjenta" element={<PatientGuidePage/>}/>
                                        <Route path="kontakt" element={<ContactPage/>}/>
                                        <Route path="kalkulator" element={<CalculatorPage/>}/>
                                        <Route element={<UserRoute/>}>
                                            <Route path="profile" element={<UserProfile/>}/>
                                        </Route>
                                    </Route>
                                    <Route path="/admin" element={<AdminRoute/>}>
                                        <Route index element={<AdminPanel/>}/>
                                    </Route>
                                </Routes>
                        </ComparisonProvider>
                    </FavoritesProvider>
                </AuthProvider>
            </ConfirmationProvider>
        </NotificationProvider>
    )
}

export default App
