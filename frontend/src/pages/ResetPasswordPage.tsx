import {Link} from 'react-router-dom';
import Navbar from '../components/layout/Navbar.tsx';
import Button from '../components/ui/Button.tsx';
import KeyIcon from "../components/icons/KeyIcon.tsx";
import {useResetPasswordPage} from "../hooks/useResetPasswordPage.ts";


export default function ResetPasswordPage() {
    const {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        pageState,
        errorMessage,
        handleSubmit
    } = useResetPasswordPage();
    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20 pt-32">
                <div
                    className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 text-center">

                    <div className="flex justify-center mb-6">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${pageState === 'invalid' ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-[#4E61F6]'}`}>
                            <KeyIcon className="w-8 h-8"/>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Resetowanie hasła</h2>

                    {pageState === 'verifying' && (
                        <p className="text-gray-500 animate-pulse">Sprawdzanie ważności linku...</p>
                    )}

                    {pageState === 'invalid' && (
                        <div className="animate-fade-in-up">
                            <p className="text-red-600 font-medium mb-6">{errorMessage}</p>
                            <p className="text-sm text-gray-500 mb-6">
                                Linki resetujące są ważne tylko przez 15 minut i są jednorazowe.
                                Jeśli już zmieniłeś hasło lub minął czas, wygeneruj nowy link.
                            </p>
                            <Link to="/zapomnialem-hasla">
                                <Button variant="outline" className="w-full py-3">Wyślij nowy link</Button>
                            </Link>
                        </div>
                    )}

                    {pageState === 'success' && (
                        <div className="animate-fade-in-up">
                            <div
                                className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl mb-6 text-sm font-medium">
                                Twoje hasło zostało pomyślnie zmienione.
                            </div>
                            <Link to="/login">
                                <Button variant="primary" className="w-full py-3 shadow-lg">Zaloguj się nowym
                                    hasłem</Button>
                            </Link>
                        </div>
                    )}

                    {(pageState === 'valid' || pageState === 'submitting') && (
                        <form onSubmit={handleSubmit} className="space-y-5 text-left animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none"
                                    placeholder="Minimum 8 znaków"
                                    disabled={pageState === 'submitting'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none"
                                    placeholder="Powtórz hasło"
                                    disabled={pageState === 'submitting'}
                                />
                            </div>
                            <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                                <li>Minimum 8 znaków</li>
                                <li>Wielka litera, cyfra i znak specjalny</li>
                            </ul>

                            <Button
                                type="submit"
                                className="w-full py-3 shadow-lg mt-4"
                                disabled={pageState === 'submitting'}
                            >
                                {pageState === 'submitting' ? 'Zapisywanie...' : 'Zmień hasło'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}