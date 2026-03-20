import {QRCodeSVG} from 'qrcode.react';
import Modal from './Modal.tsx';
import Button from '../Button.tsx';
import ShieldCheckIcon from "../../icons/ShieldCheckIcon.tsx";
import LockIcon from "../../icons/LockIcon.tsx";
import type {ITwoFactorModalProps} from "../../../types/ui.types.ts";
import {useTwoFactorModal} from "../../../hooks/useTwoFactorModal.ts";
import PhoneIcon from "../../icons/PhoneIcon.tsx";
import QrIcon from "../../icons/QrIcon.tsx";
import KeyIcon from "../../icons/KeyIcon.tsx";

export default function TwoFactorModal({isOpen, onClose}: ITwoFactorModalProps) {
    const {
        step,
        qrUri,
        setupKey,
        code,
        setCode,
        disablePassword,
        setDisablePassword,
        isLoading,
        handleEnable,
        handleDisableSubmit,
        setStep
    } = useTwoFactorModal({isOpen, onClose});
    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${step === 'disable-auth' ? 'bg-red-50' : 'bg-indigo-50'}`}>
                        {step === 'disable-auth' ? <LockIcon className="w-12 h-12 text-red-500"/> : <ShieldCheckIcon/>}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {step === 'disable-auth' ? 'Potwierdź tożsamość' : 'Weryfikacja dwuetapowa (2FA)'}
                </h2>

                {step === 'loading' && <p className="text-gray-500 py-10">Ładowanie...</p>}

                {step === 'intro' && (
                    <div className="animate-fade-in text-left">
                        <p className="text-center text-gray-600 mb-8 text-sm">
                            Zabezpiecz swoje konto dodatkową warstwą ochrony. Nawet jeśli ktoś pozna Twoje hasło, nie
                            zaloguje się bez Twojego telefonu.
                        </p>
                        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-2 rounded-lg text-[#4E61F6] shadow-sm shrink-0"><PhoneIcon
                                    className={"w-6 h-6"}/></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">1. Pobierz aplikację</h4>
                                    <p className="text-xs text-gray-500 mt-1">Google Authenticator lub Microsoft
                                    Authenticator.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-2 rounded-lg text-[#4E61F6] shadow-sm shrink-0"><QrIcon/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">2. Zeskanuj kod</h4>
                                    <p className="text-xs text-gray-500 mt-1">Zeskanuj kod QR widoczny w następnym
                                    kroku.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-2 rounded-lg text-[#4E61F6] shadow-sm shrink-0"><KeyIcon
                                    className={"w-6 h-6"}/></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">3. Potwierdź kodem</h4>
                                    <p className="text-xs text-gray-500 mt-1">Wpisz kod z aplikacji, aby aktywować.</p>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => setStep('setup')} className="w-full py-3 shadow-lg">Rozpocznij
                            konfigurację</Button>
                    </div>
                )}

                {step === 'setup' && (
                    <div className="animate-slide-in-right">
                        <div
                            className="flex justify-center mb-6 p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm w-fit mx-auto">
                            {qrUri && <QRCodeSVG value={qrUri} size={150}/>}
                        </div>
                        <div className="mb-6 text-center">
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                                Kod ręczny: <span
                                className="font-mono font-bold text-gray-700 select-all">{setupKey}</span>
                            </p>
                        </div>
                        <div className="text-left mb-6">
                            <input type="text" maxLength={6} value={code}
                                   onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none text-center text-2xl tracking-widest font-bold"
                                   placeholder="000 000" autoFocus/>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setStep('intro')} className="w-1/3">Wróć</Button>
                            <Button variant="primary" className="w-2/3 shadow-lg" onClick={handleEnable}
                                    disabled={code.length !== 6}>Włącz weryfikację</Button>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="animate-fade-in py-8">
                        <div
                            className="w-16 h-16 bg-green-100 rounded-full flex
                            items-center justify-center mx-auto mb-4 text-green-600 text-3xl">✓
                        </div>
                        <p className="text-green-700 font-bold text-lg mb-2">Gotowe!</p>
                        <p className="text-gray-500 text-sm">Twoje konto jest teraz podwójnie chronione.</p>
                        <Button variant="primary" className="w-full mt-8" onClick={onClose}>Zamknij</Button>
                    </div>
                )}

                {step === 'disabled' && (
                    <div className="animate-fade-in">
                        <div
                            className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 text-green-800 text-sm font-medium flex items-center gap-3">
                            <div className="bg-green-200 p-1.5 rounded-full text-green-700"><ShieldCheckIcon
                                className="w-5 h-5 !text-green-700"/></div>
                            Ochrona 2FA jest aktywna.
                        </div>
                        <p className="text-sm text-gray-500 mb-8">
                            Jeśli chcesz wyłączyć 2FA, będziesz musiał potwierdzić to hasłem.
                        </p>
                        <Button
                            variant="danger"
                            className="w-full py-3 border-red-200 text-red-600 !bg-red-500 hover:bg-red-50"
                            onClick={() => setStep('disable-auth')}
                        >
                            Wyłącz 2FA
                        </Button>
                        <button onClick={onClose}
                                className="w-full text-center text-gray-400 text-xs mt-4 hover:text-gray-600">
                            Zamknij
                        </button>
                    </div>
                )}

                {step === 'disable-auth' && (
                    <div className="animate-slide-in-right text-left">
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            Wyłączenie 2FA obniży bezpieczeństwo Twojego konta.<br/>
                            <strong>Wpisz hasło, aby potwierdzić operację.</strong>
                        </p>

                        <form onSubmit={handleDisableSubmit}>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Hasło do
                                    konta</label>
                                <input
                                    type="password"
                                    value={disablePassword}
                                    onChange={e => setDisablePassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Wpisz swoje hasło"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="secondary" onClick={() => setStep('disabled')}
                                        className="w-1/3">
                                    Anuluj
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    className="w-2/3 shadow-lg text-red-500 bg-red-600 hover:bg-red-700 border-red-600 hover:text-white"
                                    disabled={isLoading || !disablePassword}
                                >
                                    {isLoading ? "Przetwarzanie..." : "Potwierdź wyłączenie"}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    )
}