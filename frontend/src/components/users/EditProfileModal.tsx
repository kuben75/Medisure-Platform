import React, { useState, useEffect } from 'react'
import Modal from '../ui/modals/Modal.tsx'
import Button from '../ui/Button.tsx'
import type {IEditProfileModalProps} from "../../types/ui.types.ts";
import {useNotification} from "../../hooks/UseNotification.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import InfoIcon from "../icons/InfoIcon.tsx";

// Ikony (bez zmian)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" /></svg>
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.801a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>

export default function EditProfileModal({ isOpen, onClose }: IEditProfileModalProps) {
    const { user, token, updateUser } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [birthDate, setBirthDate] = useState('')

    const [currentPassword, setCurrentPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    // Zmieniamy stan step na 3 opcje
    const [step, setStep] = useState<'form' | 'password' | '2fa'>('form')

    const {notify} = useNotification()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && isOpen) {
            setFirstName(user.firstName || '')
            setLastName(user.lastName || '')
            setEmail(user.email || '')
            setPhoneNumber(user.phoneNumber || '')
            setBirthDate(user.birthDate ? user.birthDate.split('T')[0] : '')

            setStep('form')
            setCurrentPassword('')
            setTwoFactorCode('')
            setError(null)
        }
    }, [user, isOpen])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if(!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("Imię, Nazwisko i Email są wymagane.")
            return
        }

        const isEmailChanged = email.toLowerCase() !== user?.email?.toLowerCase();

        if (isEmailChanged) {
            // Jeśli email zmieniony, idziemy do kroku z hasłem
            setStep('password')
        } else {
            performUpdate()
        }
    }

    // Obsługa przejścia z hasła do 2FA lub zapisu
    const handlePasswordStep = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!currentPassword) {
            setError("Wprowadź hasło")
            return
        }

        if (user?.twoFactorEnabled) {
            // Jeśli 2FA włączone, idziemy do kroku 2FA
            setStep('2fa')
        } else {
            // Jeśli brak 2FA, próbujemy zapisać od razu
            performUpdate()
        }
    }

    // Obsługa finalnego kroku z 2FA
    const handle2FAStep = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!twoFactorCode || twoFactorCode.length !== 6) {
            setError("Wprowadź 6-cyfrowy kod")
            return
        }

        performUpdate()
    }

    const performUpdate = async () => {
        if (!token) return
        setIsLoading(true)
        setError(null)

        const payload = {
            firstName,
            lastName,
            email,
            phoneNumber: phoneNumber.trim() === '' ? null : phoneNumber.trim(),
            birthDate: birthDate ? new Date(birthDate).toISOString() : null,
            // Wysyłamy dane autoryzacyjne tylko jeśli były wymagane
            currentPassword: step !== 'form' ? currentPassword : null,
            twoFactorCode: user?.twoFactorEnabled && step !== 'form' ? twoFactorCode : null
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errData = await response.json()
                let msg = errData.message || "Błąd aktualizacji."
                if(errData.errors) msg = Object.values(errData.errors).flat().join(', ')

                // --- INTELIGENTNE COFANIE ---
                // Jeśli błąd dotyczy hasła, a jesteśmy na etapie 2FA, cofnij do hasła
                const lowerMsg = msg.toLowerCase();
                if (lowerMsg.includes('hasł') || lowerMsg.includes('password')) {
                    setStep('password')
                    setError("Nieprawidłowe hasło. Spróbuj ponownie.")
                } else if (lowerMsg.includes('code') || lowerMsg.includes('kod') || lowerMsg.includes('2fa')) {
                    // Zostajemy na 2fa, wyświetlamy błąd
                    setError("Nieprawidłowy kod 2FA.")
                } else {
                    setError(msg)
                }

                throw new Error(msg) // Przerwij dalsze wykonywanie
            }

            const updatedUser = await response.json()

            const isEmailChangePending = updatedUser.emailChangePending || updatedUser.EmailChangePending

            if (isEmailChangePending) {
                notify.info("Na nowy adres wysłano link potwierdzający.")
                setEmail(user?.email || '') // Reset wizualny do starego, dopóki nie potwierdzi
            } else {
                notify.success("Profil zaktualizowany!")
            }

            updateUser(updatedUser)
            onClose()

        } catch (err) {
            // Error jest ustawiany w bloku if(!response.ok) lub tutaj jako fallback
            if (!error) setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    const isBirthDateLocked = !!user?.birthDate

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">

            {step === 'form' && (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Edycja profilu</h2>
                        <p className="text-gray-500 text-sm mt-1">Zaktualizuj swoje dane osobowe</p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6 animate-fade-in">
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">{error}</div>}

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Imię *</label>
                                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><UserIcon /></div>
                                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Nazwisko *</label>
                                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><UserIcon /></div>
                                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Email *</label>
                            <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><MailIcon /></div>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Telefon</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <PhoneIcon/></div>
                                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                           className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all"/>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Data ur.
                                    </label>

                                    {isBirthDateLocked && (
                                        <div className="group relative">
                                            <span
                                                className="cursor-help text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-green-100 hover:bg-green-100 transition-colors">
                                                <InfoIcon className='w-4 h-4'/> Zweryfikowano
                                            </span>
                                            <div
                                                className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                                Data urodzenia została zatwierdzona.
                                                <br/>
                                                <span className="text-gray-300">W celu korekty skontaktuj się z obsługą.</span>
                                                <div
                                                    className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <CalendarIcon/></div>
                                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                                           disabled={isBirthDateLocked}
                                           className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all ${isBirthDateLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#4E61F6]'}`}/>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}
                                    className="w-1/3">Anuluj</Button>
                            <Button type="submit" variant="primary" className="w-2/3 shadow-lg">Zapisz zmiany</Button>
                        </div>
                    </form>
                </>
            )}

            {step === 'password' && (
                <div className="animate-fade-in text-center px-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 animate-pulse">
                        <KeyIcon />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Potwierdź hasłem</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Zmieniasz adres e-mail. <br/>Aby kontynuować, wprowadź swoje obecne hasło.
                    </p>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 animate-shake">{error}</div>}

                    <form onSubmit={handlePasswordStep} className="space-y-4 text-left max-w-sm mx-auto">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Obecne hasło</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="pt-8 flex gap-3">
                            <Button type="button" variant="secondary" onClick={() => { setStep('form'); setError(null); }} className="w-1/3">
                                Wróć
                            </Button>
                            <Button type="submit" variant="primary" className="w-2/3 shadow-lg bg-amber-600 hover:bg-amber-700 border-amber-600" disabled={isLoading}>
                                {user?.twoFactorEnabled ? "Dalej" : "Potwierdź zmianę"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {step === '2fa' && (
                <div className="animate-fade-in text-center px-4">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <ShieldIcon />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Weryfikacja 2FA</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Twoje konto jest zabezpieczone podwójnym uwierzytelnianiem. <br/>Podaj kod z aplikacji Authenticator.
                    </p>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 animate-shake">{error}</div>}

                    <form onSubmit={handle2FAStep} className="space-y-4 text-left max-w-sm mx-auto">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Kod 6-cyfrowy</label>
                            <input
                                type="text"
                                value={twoFactorCode}
                                onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-2xl font-mono font-bold"
                                placeholder="000 000"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="pt-8 flex gap-3">
                            <Button type="button" variant="secondary" onClick={() => { setStep('password'); setError(null); }} className="w-1/3">
                                Wróć
                            </Button>
                            <Button type="submit" variant="primary" className="w-2/3 shadow-lg" disabled={isLoading}>
                                {isLoading ? "Weryfikacja..." : "Zatwierdź zmianę"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </Modal>
    )
}