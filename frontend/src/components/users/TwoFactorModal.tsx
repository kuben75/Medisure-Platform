import  { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { useNotification } from '../../hooks/UseNotification.ts';
import {useConfirm} from "../../hooks/UseConfrim.ts";

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#4E61F6]"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;

export default function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
    const { token } = useAuth()
    const { notify } = useNotification()
    const confirm = useConfirm()

    const [step, setStep] = useState<'loading' | 'setup' | 'success' | 'disabled'>('loading')
    const [qrUri, setQrUri] = useState('')
    const [setupKey, setSetupKey] = useState('')
    const [code, setCode] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchSetupData()
            setCode('')
        }
    }, [isOpen])

    const fetchSetupData = async () => {
        setStep('loading');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/account/2fa/setup`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            setQrUri(data.authenticatorUri);
            setSetupKey(data.key);
            setStep(data.isEnabled ? 'disabled' : 'setup');
        } catch (e) {
            notify.error("Błąd pobierania danych 2FA.");
            onClose();
        }
    };

    const handleEnable = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/account/2fa/enable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ code })
            })

            if (!res.ok) throw new Error("Nieprawidłowy kod")

            setStep('success');
            notify.success("Weryfikacja dwuetapowa włączona!")
        } catch (e) {
            notify.error("Błędny kod weryfikacyjny.")
        }
    }

    const handleDisable = async () => {
        const confirmed = await confirm({
            title: "Wyłącz 2FA",
            description: "Czy na pewno chcesz wyłączyć 2FA?",
            confirmText: "Tak, wyłącz",
            cancelText: "Anuluj",
            variant: "danger"
        })
        if (!confirmed) return

        try {
            await fetch(`${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/account/2fa/disable`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            notify.info("Weryfikacja dwuetapowa wyłączona.");
            onClose();
        } catch (e) {
            notify.error("Błąd.")
        }
    }

    if (!isOpen) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-indigo-50 p-4 rounded-full">
                        <ShieldCheckIcon />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Weryfikacja dwuetapowa (2FA)</h2>

                {step === 'loading' && <p className="text-gray-500 py-10">Ładowanie...</p>}

                {step === 'setup' && (
                    <div className="animate-fade-in">
                        <p className="text-sm text-gray-500 mb-6">
                            Zeskanuj poniższy kod w aplikacji <strong>Google Authenticator</strong> lub <strong>Microsoft Authenticator</strong>.
                        </p>

                        <div className="flex justify-center mb-6 p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                            {qrUri && <QRCodeSVG value={qrUri} size={160} />}
                        </div>

                        <div className="mb-6 text-xs text-gray-400 bg-gray-50 p-2 rounded border border-gray-100">
                            Kod konfiguracyjny: <span className="font-mono font-bold text-gray-600">{setupKey}</span>
                        </div>

                        <div className="text-left mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Wpisz kod z aplikacji</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none text-center text-2xl tracking-widest font-bold"
                                placeholder="000 000"
                            />
                        </div>

                        <Button variant="primary" className="w-full py-3 shadow-lg" onClick={handleEnable} disabled={code.length !== 6}>
                            Włącz zabezpieczenie
                        </Button>
                    </div>
                )}

                {step === 'success' && (
                    <div className="animate-fade-in py-8">
                        <p className="text-green-600 font-bold text-lg mb-2">Gotowe!</p>
                        <p className="text-gray-500 text-sm">Twoje konto jest teraz podwójnie chronione.</p>
                        <Button variant="primary" className="w-full mt-8" onClick={onClose}>Zamknij</Button>
                    </div>
                )}

                {step === 'disabled' && (
                    <div className="animate-fade-in">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 text-green-800 text-sm font-medium">
                            2FA jest aktywne na Twoim koncie.
                        </div>
                        <p className="text-sm text-gray-500 mb-8">
                            Przy logowaniu będziesz proszony o podanie kodu jednorazowego.
                        </p>
                        <Button variant="danger" className="w-full py-3 border-red-200 text-red-600 hover:bg-red-50" onClick={handleDisable}>
                            Wyłącz 2FA
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    )
}