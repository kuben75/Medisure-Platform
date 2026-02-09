import Modal from './Modal.tsx'
import Button from '../Button.tsx'
import type {IEditProfileModalProps} from "../../../types/ui.types.ts"
import InfoIcon from "../../icons/InfoIcon.tsx"
import PhoneIcon from "../../icons/PhoneIcon.tsx"
import KeyIcon from "../../icons/KeyIcon.tsx"
import ShieldIcon from "../../icons/ShieldIcon.tsx"
import MailIcon from "../../icons/MailIcon.tsx"
import CalendarIcon from "../../icons/CalendarIcon.tsx"
import UserIcon from "../../icons/UserIcon.tsx"
import {useEditProfile} from "../../../hooks/useEditProfile.ts";

export default function EditProfileModal({ isOpen, onClose }: IEditProfileModalProps) {
    const {
        formData,
        handleInputChange,
        currentPassword, setCurrentPassword,
        twoFactorCode, setTwoFactorCode,
        step, setStep,
        isLoading,
        error, setError,
        handleFormSubmit,
        handlePasswordStep,
        handle2FAStep,
        user
    } = useEditProfile({ isOpen, onClose })

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
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Nazwisko *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <UserIcon className="w-5 h-5"/>
                                    </div>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Email *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <MailIcon className="w-5 h-5"/>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Telefon</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <PhoneIcon className="w-5 h-5"/>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4E61F6] outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Data ur.</label>

                                    {isBirthDateLocked && (
                                        <div className="group relative">
                                            <span
                                                className="cursor-help text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-green-100 hover:bg-green-100 transition-colors">
                                                <InfoIcon className='w-4 h-4'/> Zweryfikowano
                                            </span>
                                            <div
                                                className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-1 group-hover:translate-y-0">
                                                <p className="font-semibold mb-1">Data urodzenia została
                                                    zatwierdzona.</p>
                                                <p className="text-gray-300 leading-relaxed">
                                                    Ze względów bezpieczeństwa zmiana daty urodzenia jest zablokowana.
                                                    W celu korekty skontaktuj się z obsługą klienta.
                                                </p>
                                                <div
                                                    className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <CalendarIcon className="w-5 h-5"/>
                                    </div>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                        disabled={isBirthDateLocked}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all ${isBirthDateLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#4E61F6]'}`}
                                    />
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
                    <div
                        className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                        <KeyIcon className="w-12 h-12 text-amber-500"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Potwierdź hasłem</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Zmieniasz adres e-mail. <br/>Aby kontynuować, wprowadź swoje obecne hasło.
                    </p>

                    {error && <div
                        className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 animate-shake">{error}</div>}

                    <form onSubmit={handlePasswordStep} className="space-y-4 text-left max-w-sm mx-auto">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Obecne
                                hasło</label>
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
                            <Button type="button" variant="secondary" onClick={() => {
                                setStep('form');
                                setError(null);
                            }} className="w-1/3">Wróć</Button>
                            <Button type="submit" variant="primary"
                                    className="w-2/3 shadow-lg bg-amber-600 hover:bg-amber-700 border-amber-600"
                                    disabled={isLoading}>
                                {user?.twoFactorEnabled ? "Dalej" : "Potwierdź zmianę"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {step === '2fa' && (
                <div className="animate-fade-in text-center px-4">
                    <div
                        className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <ShieldIcon className="w-12 h-12"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Weryfikacja 2FA</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Twoje konto jest zabezpieczone podwójnym uwierzytelnianiem. <br/>Podaj kod z aplikacji
                        Authenticator.
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
                            <Button type="button" variant="secondary" onClick={() => { setStep('password'); setError(null); }} className="w-1/3">Wróć</Button>
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