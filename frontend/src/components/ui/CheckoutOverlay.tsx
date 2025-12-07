import {type ChangeEvent, type FormEvent, useEffect, useState} from 'react';
import Button from '../ui/Button';
import {useAuth} from '../../hooks/useAuth';
import CheckIcon from '../icons/CheckIcon';
import type {ICheckoutOverlayProps, TBankOptionType, TPaymentMethodType} from '../../types/pricing.types';
import UserIcon from "../icons/UserIcon.tsx";
import LockIcon from "../icons/LockIcon.tsx";
import CreditCardIcon from "../icons/CreditCardIcon.tsx";
import MapIcon from "../icons/MapIcon.tsx";
import CalendarIcon from "../icons/CalendarIcon.tsx";
import ShieldCheckIcon from "../icons/ShieldCheckIcon.tsx";
import InfoIcon from "../icons/InfoIcon.tsx";
import BlikLogo from "../icons/BlikLogo.tsx";
import PayPalLogo from "../icons/PayPalLogo.tsx";
import GPayLogo from "../icons/GPayLogo.tsx";

const BankIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>;

const BankLogo = ({name, color}: { name: string, color: string }) => (
    <div className="flex items-center justify-center w-full h-full font-bold text-sm tracking-tight"
         style={{color: color}}>
        {name}
    </div>
)

const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export default function CheckoutOverlay({isOpen, onClose, plan, priceDetails, onFinalize}: ICheckoutOverlayProps) {
    const {user} = useAuth()
    const [step, setStep] = useState<1 | 2>(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingStatus, setProcessingStatus] = useState("Inicjowanie...")
    const [isSuccess, setIsSuccess] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isPhoneLocked, setIsPhoneLocked] = useState(false)

    const [isBirthDateLocked, setIsBirthDateLocked] = useState(false)

    const [saveInfo, setSaveInfo] = useState(false)
    const [countdown, setCountdown] = useState(5)

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', birthDate: '',
        street: '', houseNumber: '', city: '', zipCode: ''
    })

    const [dynamicTotal, setDynamicTotal] = useState(priceDetails.total);

    const [paymentMethod, setPaymentMethod] = useState<TPaymentMethodType>('card')
    const [selectedBank, setSelectedBank] = useState<TBankOptionType | null>(null)
    const [bankLogin, setBankLogin] = useState({login: '', password: ''})
    const [cardData, setCardData] = useState({number: '', expiry: '', cvc: '', holder: ''})
    const [blikCode, setBlikCode] = useState('')

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + priceDetails.months)

    const formatDate = (date: Date) => date.toLocaleDateString('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    })

    useEffect(() => {
        if (!formData.birthDate) {
            setDynamicTotal(priceDetails.total);
            return;
        }

        const age = calculateAge(formData.birthDate);
        let multiplier = 1.0;

        if (!isBirthDateLocked) {
            if (age > 30 && age <= 50)
                multiplier += (age - 30) * 0.015;
            else if (age > 50)
                multiplier += 0.30 + (age - 50) * 0.025;

            const newTotal = parseFloat((priceDetails.total * multiplier).toFixed(2));
            setDynamicTotal(newTotal);
        } else {
            setDynamicTotal(priceDetails.total);
        }

    }, [formData.birthDate, isBirthDateLocked, priceDetails.total]);


    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isSuccess && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (isSuccess && countdown === 0) {
            window.location.href = '/profile?tab=subscriptions'
        }
        return () => clearInterval(timer);
    }, [isSuccess, countdown]);


    useEffect(() => {
        if (isOpen && user) {
            const userPhone = user.phoneNumber || ''
            const userBirthDate = user.birthDate  || '';

            const savedData = localStorage.getItem('saved_billing_data')
            let initialData = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: userPhone,
                birthDate: userBirthDate,
                street: '', houseNumber: '', city: '', zipCode: ''
            }

            if (savedData) {
                const parsed = JSON.parse(savedData);
                initialData = {
                    ...initialData,
                    ...parsed,
                    email: user.email,
                    phone: userPhone || parsed.phone || '',
                }
                setSaveInfo(true)
            }

            setFormData(initialData)

            setIsPhoneLocked(!!userPhone && userPhone.length > 0)
            setIsBirthDateLocked(!!userBirthDate && userBirthDate.length > 0)

            setStep(1)
            setIsSuccess(false)
            setCountdown(5)
            setIsProcessing(false)
            setErrors({})
            setSelectedBank(null)
            setCardData({number: '', expiry: '', cvc: '', holder: ''})
            setBlikCode('')
            setDynamicTotal(priceDetails.total)
        }
    }, [isOpen, user, priceDetails.total])

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {}
        const cleanPhone = formData.phone.replace(/\D/g, '')

        if (!cleanPhone || cleanPhone.length < 9) newErrors.phone = "Wymagany poprawny nr telefonu"
        if (!formData.birthDate) newErrors.birthDate = "Data urodzenia jest wymagana do kalkulacji"

        if (formData.birthDate) {
            const age = calculateAge(formData.birthDate);
            if (age < 18) newErrors.birthDate = "Musisz być pełnoletni";
        }

        if (!formData.street.trim()) newErrors.street = "Ulica jest wymagana"
        if (!formData.houseNumber.trim()) newErrors.houseNumber = "Nr domu jest wymagany"
        if (!formData.city.trim()) newErrors.city = "Miasto jest wymagane"
        if (!/^\d{2}-\d{3}$/.test(formData.zipCode)) newErrors.zipCode = "Format: XX-XXX"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {}

        if (paymentMethod === 'transfer') {
            if (!selectedBank) return false

            if (selectedBank === 'blik') {
                if (!/^\d{6}$/.test(blikCode)) newErrors.blik = "Kod BLIK musi mieć 6 cyfr"
            } else {
                // WALIDACJA BANKU (DŁUGOŚĆ PÓL)
                if (!bankLogin.login || bankLogin.login.length < 5)
                    newErrors.bankLogin = "Login musi mieć min. 5 znaków"
                if (!bankLogin.password || bankLogin.password.length < 8)
                    newErrors.bankPass = "Hasło musi mieć min. 8 znaków"
            }
        }

        if (paymentMethod === 'card') {
            const cleanCard = cardData.number.replace(/\s/g, '')
            if (!/^\d{16}$/.test(cleanCard)) newErrors.cardNumber = "Niepoprawny numer karty"

            // WALIDACJA DATY WAŻNOŚCI KARTY
            if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
                newErrors.expiry = "Format MM/YY"
            } else {
                const [monthStr, yearStr] = cardData.expiry.split('/');
                const month = parseInt(monthStr, 10);
                const year = parseInt(`20${yearStr}`, 10);
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                if (month < 1 || month > 12) {
                    newErrors.expiry = "Niepoprawny miesiąc";
                } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    newErrors.expiry = "Karta straciła ważność";
                }
            }

            if (!/^\d{3}$/.test(cardData.cvc)) newErrors.cvc = "CVC to 3 cyfry"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleZipCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '')
        if (val.length > 2) val = `${val.slice(0, 2)}-${val.slice(2, 5)}`
        setFormData({...formData, zipCode: val.slice(0, 6)})
        if (errors.zipCode) setErrors({...errors, zipCode: ''})
    }
    const handleExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '')
        if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`
        setCardData({...cardData, expiry: val.slice(0, 5)})
        if (errors.expiry) setErrors({...errors, expiry: ''})
    }
    const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16)
        val = val.match(/.{1,4}/g)?.join(' ') || val
        setCardData({...cardData, number: val})
        if (errors.cardNumber) setErrors({...errors, cardNumber: ''})
    }
    const handleBlikChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 6)
        setBlikCode(val)
        if (errors.blik) setErrors({...errors, blik: ''})
    }
    const handleNextStep = (e: FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            if (saveInfo) {
                const dataToSave = {
                    street: formData.street,
                    houseNumber: formData.houseNumber,
                    city: formData.city,
                    zipCode: formData.zipCode,
                    phone: formData.phone
                }
                localStorage.setItem('saved_billing_data', JSON.stringify(dataToSave))
            } else
                localStorage.removeItem('saved_billing_data')

            setStep(2)
        }
    }

    const handlePayment = async () => {
        if (!validateStep2()) return

        // SYMULACJA PROCESOWANIA
        setIsProcessing(true)
        setProcessingStatus("Nawiązywanie bezpiecznego połączenia...")

        await new Promise(resolve => setTimeout(resolve, 800))
        setProcessingStatus("Weryfikacja danych płatności...")

        await new Promise(resolve => setTimeout(resolve, 1000))
        setProcessingStatus("Autoryzacja transakcji...")

        await new Promise(resolve => setTimeout(resolve, 800))

        const txId = `TX-${Math.floor(Math.random() * 1000000000)}`

        setIsProcessing(false)
        setIsSuccess(true)

        let finalMethodName :string = paymentMethod
        if (paymentMethod === 'card') finalMethodName = 'Karta'
        else if (paymentMethod === 'paypal') finalMethodName = 'PayPal'
        else if (paymentMethod === 'gpay') finalMethodName = 'Google Pay'
        else if (paymentMethod === 'transfer') finalMethodName = selectedBank === 'blik' ? 'BLIK' : `Przelew (${selectedBank?.toUpperCase()})`;

        // Wywołujemy onFinalize, aby zapisać dane, ale nie zamykamy okna (robimy to via redirect/button)
        onFinalize(finalMethodName, txId, { ...formData })
    }

    if (!isOpen) return null

    const getInputClass = (errorKey: string, locked = false) => `
        w-full border rounded-xl px-4 py-3.5 font-medium transition-all outline-none 
        ${locked
        ? 'bg-gray-50 border-gray-200 text-slate-500 cursor-not-allowed'
        : errorKey
            ? 'bg-red-50 border-red-300 text-red-900 focus:ring-2 focus:ring-red-200 placeholder:text-red-300'
            : 'bg-white border-gray-300 text-slate-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-gray-300 hover:border-gray-400'
    }
    `

    // Obliczenie VAT i Netto na podstawie dynamicznej ceny
    const dynamicNetto = (dynamicTotal * 0.77).toFixed(2);
    const dynamicVat = (dynamicTotal * 0.23).toFixed(2);
    const priceIncrease = dynamicTotal - priceDetails.total;

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white animate-fade-in font-sans">

            <div className="w-full md:w-5/12 bg-[#0F172A] text-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden order-1 shadow-2xl z-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -ml-20 -mb-20"></div>

                <div className="relative z-10 flex flex-col h-full">
                    <button onClick={onClose}
                            className="mb-10 self-start group flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                        <span className="text-xl leading-none group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Powrót</span>
                    </button>

                    <div className="flex-grow">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-white/5">
                                Twoje zamówienie
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold mb-3 tracking-tight text-white">{plan.name}</h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">{plan.description}</p>


                        <div className="space-y-3 mb-8">
                            {plan.features.slice(0, 4).map((f, i) => (
                                <div key={i} className="flex items-start gap-4 text-sm text-slate-300 group">
                                    <div
                                        className="mt-0.5 p-1 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                                        <CheckIcon className="w-3 h-3 text-indigo-400"/>
                                    </div>
                                    <span className="leading-snug">{f}</span>
                                </div>))}
                        </div>
                        <div
                            className="mb-8 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-500/20 p-2 rounded-lg"><CalendarIcon className="w-4 h-4"/></div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Start</p>
                                    <p className="font-medium text-slate-200">{formatDate(startDate)}</p>
                                </div>
                            </div>
                            <div className="h-px w-12 bg-white/20"></div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Koniec</p>
                                <p className="font-medium text-slate-200">{formatDate(endDate)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div
                                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                                <ShieldCheckIcon/>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Gwarancja</p>
                                    <p className="text-xs text-slate-300">14 dni na zwrot</p>
                                </div>
                            </div>
                            <div
                                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                                <InfoIcon className="w-6 h-6 text-indigo-400"/>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Wsparcie</p>
                                    <p className="text-xs text-slate-300">Pomoc 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg transition-all duration-300">
                        <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Okres</span>
                                <span className="text-slate-200 font-medium">{priceDetails.months} mies.</span>
                            </div>

                            {/* POKAZUJEMY ZWYŻKĘ JEŚLI ISTNIEJE */}
                            {priceIncrease > 0.01 && (
                                <div className="flex justify-between text-sm animate-fade-in">
                                    <span className="text-orange-300">Zwyżka (wiek)</span>
                                    <span className="text-orange-300 font-medium">+{priceIncrease.toFixed(2)} zł</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Netto</span>
                                <span className="text-slate-200 font-medium">{dynamicNetto} zł</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">VAT (23%)</span>
                                <span className="text-slate-200 font-medium">{dynamicVat} zł</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Do zapłaty</span>
                                {(priceDetails.isDiscounted || dynamicTotal > priceDetails.total) && (
                                    <span className="text-xs text-slate-400/80">
                                        Cena bazowa: {priceDetails.total} zł
                                    </span>
                                )}
                            </div>
                            <span className="text-4xl font-black text-white tracking-tight animate-fade-in-up key-{dynamicTotal}">
                                {dynamicTotal.toFixed(2)} <span className="text-xl text-slate-500 font-bold">zł</span>
                            </span>
                        </div>
                    </div>

                    <div
                        className="mt-6 flex items-center gap-2 text-[10px] text-slate-500 font-medium opacity-60 justify-center">
                        <LockIcon className="w-3 h-3"/> Płatność szyfrowana SSL 256-bit
                    </div>
                </div>
            </div>

            <div className="w-full md:w-7/12 bg-white flex flex-col relative order-2 overflow-y-auto custom-scrollbar">

                <div
                    className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-10 py-6 z-30 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-lg tracking-tight">Finalizacja zakupu</span>
                    <div className="flex items-center gap-6">
                        <div
                            className={`flex items-center gap-2.5 transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${step === 1 ? 'bg-[#4E61F6] text-white' : 'bg-gray-100 text-gray-500'}`}>1
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Dane</span>
                        </div>
                        <div className="w-8 h-px bg-gray-200"></div>
                        <div
                            className={`flex items-center gap-2.5 transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${step === 2 ? 'bg-[#4E61F6] text-white' : 'bg-gray-100 text-gray-500'}`}>2
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Płatność</span>
                        </div>
                    </div>
                </div>

                <div className="p-10 md:p-16 max-w-2xl mx-auto w-full flex-grow flex flex-col justify-start pt-12">

                    {isSuccess ? (
                        <div className="text-center py-12 animate-fade-in-up flex flex-col items-center justify-center h-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                                <div
                                    className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl relative z-10 animate-bounce-short">
                                    <CheckIcon className="w-12 h-12 text-white"/>
                                </div>
                            </div>

                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Płatność przyjęta!</h2>
                            <p className="text-slate-500 text-lg leading-relaxed max-w-md mx-auto mb-10">
                                Dziękujemy za zaufanie. Potwierdzenie oraz dokumenty polisy wysłaliśmy na Twój adres email.
                            </p>

                            <div className="w-full max-w-xs space-y-4">
                                <Button onClick={() => window.location.href = '/'} variant="primary" className="w-full py-4 rounded-xl shadow-lg !bg-green-500 shadow-green-500/20 hover:shadow-green-500/30">
                                    Wróć do strony głównej
                                </Button>
                                <p className="text-xs text-gray-400 font-medium">
                                    Automatyczne przekierowanie do panelu za <span className="text-slate-800 font-bold text-base mx-1">{countdown}s</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <form onSubmit={handleNextStep} className="animate-fade-in space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                            <div className="bg-blue-50 p-2 rounded-lg"><UserIcon className="w-5 h-5"/>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Dane Odbiorcy</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="group">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Imię</label>
                                                <input type="text" value={formData.firstName} readOnly
                                                       className={getInputClass('', true)}/>
                                            </div>
                                            <div className="group">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nazwisko</label>
                                                <input type="text" value={formData.lastName} readOnly
                                                       className={getInputClass('', true)}/>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="group">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                                <input type="text" value={formData.email} readOnly
                                                       className={getInputClass('', true)}/>
                                            </div>

                                            <div className="group relative">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Telefon
                                                    kontaktowy <span className="text-red-400">*</span></label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => {
                                                        if (!isPhoneLocked) setFormData({
                                                            ...formData,
                                                            phone: e.target.value
                                                        });
                                                        if (errors.phone) setErrors({...errors, phone: ''});
                                                    }}
                                                    readOnly={isPhoneLocked}
                                                    placeholder="np. 500 600 700"
                                                    className={getInputClass(errors.phone, isPhoneLocked)}
                                                />
                                                {errors.phone &&
                                                    <p className="text-red-500 text-xs mt-1 absolute">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        {/* POLE DATY URODZENIA - WYŚWIETLANE TYLKO JEŚLI NIE MA GO W PROFILU (lub jest edytowalne) */}
                                        {!isBirthDateLocked && (
                                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 animate-fade-in">
                                                <div className="flex gap-4 items-center">
                                                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                                        <CalendarIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-grow group relative">
                                                        <label className="block text-[11px] font-bold text-orange-800 uppercase tracking-wider mb-2">
                                                            Data urodzenia <span className="text-red-400">*</span>
                                                            <span className="ml-2 normal-case font-normal text-orange-600/70 text-[10px]">(Wymagane do kalkulacji składki)</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={formData.birthDate}
                                                            max={new Date().toISOString().split('T')[0]}
                                                            onChange={e => {
                                                                setFormData({...formData, birthDate: e.target.value});
                                                                if (errors.birthDate) setErrors({...errors, birthDate: ''});
                                                            }}
                                                            className={getInputClass(errors.birthDate, false) + " bg-white"}
                                                        />
                                                        {errors.birthDate &&
                                                            <p className="text-red-500 text-xs mt-1 absolute">{errors.birthDate}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                            <div className="bg-blue-50 p-2 rounded-lg"><MapIcon/></div>
                                            <h3 className="text-lg font-bold text-slate-800">Dane do umowy</h3>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="col-span-2 group relative">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ulica</label>
                                                <input
                                                    type="text" value={formData.street}
                                                    onChange={e => {
                                                        setFormData({...formData, street: e.target.value})
                                                        if (errors.street) setErrors({...errors, street: ''})
                                                    }}
                                                    className={getInputClass(errors.street)}
                                                    placeholder="np. Marszałkowska"/>
                                                {errors.street &&
                                                    <p className="text-red-500 text-xs mt-1 absolute">{errors.street}</p>}
                                            </div>
                                            <div className="group relative">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nr
                                                    domu</label>
                                                <input
                                                    type="text" value={formData.houseNumber}
                                                    onChange={e => {
                                                        setFormData({...formData, houseNumber: e.target.value});
                                                        if (errors.houseNumber) setErrors({...errors, houseNumber: ''});
                                                    }}
                                                    className={getInputClass(errors.houseNumber)} placeholder="10/24"/>
                                                {errors.houseNumber &&
                                                    <p className="text-red-500 text-xs mt-1 absolute">{errors.houseNumber}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="group relative">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kod
                                                    pocztowy</label>
                                                <input type="text" maxLength={6} value={formData.zipCode}
                                                       onChange={handleZipCodeChange}
                                                       className={getInputClass(errors.zipCode)} placeholder="00-000"/>
                                                {errors.zipCode &&
                                                    <p className="text-red-500 text-xs mt-1 absolute">{errors.zipCode}</p>}
                                            </div>
                                            <div className="col-span-2 group relative">
                                                <label
                                                    className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Miejscowość</label>
                                                <input
                                                    type="text" value={formData.city}
                                                    onChange={e => {
                                                        setFormData({...formData, city: e.target.value});
                                                        if (errors.city) setErrors({...errors, city: ''});
                                                    }}
                                                    className={getInputClass(errors.city)} placeholder="Warszawa"/>
                                                {errors.city &&
                                                    <p className="text-red-500 text-xs mt-1 absolute">{errors.city}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={saveInfo}
                                                onChange={e => setSaveInfo(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#4E61F6] focus:ring-[#4E61F6] cursor-pointer accent-[#4E61F6]"
                                            />
                                            <span
                                                className="ml-3 text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                                                Zapamiętaj moje dane i telefon do przyszłych zamówień
                                            </span>
                                        </label>
                                    </div>
                                    <div className="pt-6">
                                        <Button type="submit" variant="primary"
                                                className="w-full py-4.5 text-base font-bold shadow-xl shadow-blue-600/10 rounded-xl hover:shadow-blue-600/20 transition-all">
                                            Zatwierdź i Przejdź dalej
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in space-y-8">
                                    <div>
                                        <label
                                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Wybierz
                                            metodę płatności</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { id: 'card', label: 'Karta', icon: <CreditCardIcon /> },
                                                { id: 'transfer', label: 'Płatność', icon: <BankIcon />, subtext: "BLIK i przelewy" },
                                                { id: 'gpay', label: 'Google Pay', icon: <GPayLogo /> },
                                                { id: 'paypal', label: 'PayPal', icon: <PayPalLogo /> }
                                            ].map((m) => (
                                                <button key={m.id} onClick={() => {
                                                    setPaymentMethod(m.id as TPaymentMethodType)
                                                    setErrors({})
                                                    setSelectedBank(null)}}
                                                        className= {`relative flex flex-col items-center justify-center gap-3 h-28 rounded-2xl border transition-all duration-300 group
                                                        ${paymentMethod === m.id
                                                            ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.02] z-10 ring-1 ring-blue-500'
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                        }`}>
                                                    {paymentMethod === m.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                                                    <div className={`transition-all duration-300 ${paymentMethod === m.id ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>{m.icon}</div>
                                                    <span className={`text-xs font-bold ${paymentMethod === m.id ? 'text-blue-700' : 'text-slate-500'}`}>{m.label}</span>
                                                </button>))}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm relative overflow-hidden min-h-[280px]">

                                        {paymentMethod === 'card' && (
                                            <div className="space-y-6 animate-fade-in relative z-10">
                                                <div className="relative group">
                                                    <label
                                                        className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Numer
                                                        karty</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text" maxLength={19} placeholder="0000 0000 0000 0000"
                                                            value={cardData.number} onChange={handleCardNumberChange}
                                                            className={getInputClass(errors.cardNumber)}
                                                        />
                                                        <div className="absolute right-0 top-3 text-gray-300 pr-3">
                                                            <CreditCardIcon/></div>
                                                    </div>
                                                    {errors.cardNumber &&
                                                        <p className="text-red-500 text-xs mt-1 absolute">{errors.cardNumber}</p>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-10">
                                                    <div className="relative group">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ważna
                                                            do</label>
                                                        <input
                                                            type="text" maxLength={5} placeholder="MM/YY"
                                                            value={cardData.expiry} onChange={handleExpiryChange}
                                                            className={getInputClass(errors.expiry)}
                                                        />
                                                        {errors.expiry &&
                                                            <p className="text-red-500 text-xs mt-1 absolute">{errors.expiry}</p>}
                                                    </div>
                                                    <div className="relative group">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">CVC</label>
                                                        <input
                                                            type="text" maxLength={3} placeholder="123"
                                                            value={cardData.cvc} onChange={e => {
                                                            setCardData({
                                                                ...cardData,
                                                                cvc: e.target.value.replace(/\D/g, '')
                                                            });
                                                            if (errors.cvc) setErrors({...errors, cvc: ''})
                                                        }}
                                                            className={getInputClass(errors.cvc)}
                                                        />
                                                        {errors.cvc &&
                                                            <p className="text-red-500 text-xs mt-1 absolute">{errors.cvc}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {paymentMethod === 'transfer' && (
                                            <div className="animate-fade-in h-full flex flex-col">
                                                {!selectedBank ? (
                                                    <>
                                                        <h4 className="text-sm font-bold text-gray-700 mb-4 text-center">Wybierz swój bank lub BLIK</h4>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                            <button
                                                                onClick={() => setSelectedBank('blik')}
                                                                className="col-span-1 h-20 border border-gray-200 rounded-xl flex items-center justify-center hover:border-black hover:shadow-md transition-all bg-white"
                                                            >
                                                                <BlikLogo />
                                                            </button>
                                                            {[
                                                                { id: 'mbank', name: 'mBank', color: '#e60023' },
                                                                { id: 'pko', name: 'IPKO', color: '#003c71' },
                                                                { id: 'santander', name: 'Santander', color: '#ec0000' },
                                                                { id: 'ing', name: 'ING', color: '#ff6200' },
                                                                { id: 'pekao', name: 'Pekao24', color: '#cc0000' },
                                                                { id: 'millennium', name: 'Millennium', color: '#bf005d' },
                                                                { id: 'alior', name: 'Alior', color: '#5b1f00' },
                                                            ].map(bank => (
                                                                <button
                                                                    key={bank.id}
                                                                    onClick={() => setSelectedBank(bank.id as TBankOptionType)}
                                                                    className="h-20 border border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all bg-white text-xs font-bold text-gray-700">
                                                                    <BankLogo name={bank.name} color={bank.color} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col h-full animate-fade-in-up">
                                                        <button
                                                            onClick={() => { setSelectedBank(null); setErrors({}); }}
                                                            className="self-start text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                                                            ← Zmień metodę
                                                        </button>

                                                        {selectedBank === 'blik' ? (
                                                            <div className="flex flex-col items-center justify-center py-4 flex-grow">
                                                                <BlikLogo />
                                                                <label className="text-sm font-bold text-slate-500 mt-6 mb-4 block">Wpisz kod z aplikacji bankowej</label>
                                                                <div className="relative w-full flex flex-col items-center">
                                                                    <input
                                                                        type="text" maxLength={6} placeholder="000 000"
                                                                        value={blikCode} onChange={handleBlikChange}
                                                                        className={`text-5xl font-black text-center tracking-[0.2em] w-64 border-b-2 focus:border-blue-500 outline-none py-2 text-slate-800 placeholder:text-gray-200 bg-transparent transition-colors ${errors.blik ? 'border-red-300 text-red-900' : 'border-gray-200'}`}
                                                                    />
                                                                    {errors.blik && <p className="text-red-500 text-xs mt-4 font-bold">{errors.blik}</p>}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col justify-center flex-grow px-4">
                                                                <div className="text-center mb-6">
                                                                    <h4 className="text-lg font-bold text-gray-800">Logowanie do banku</h4>
                                                                    <p className="text-xs text-gray-500">Bezpieczne połączenie z {selectedBank?.toUpperCase()}</p>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <input
                                                                            type="text" placeholder="Identyfikator / Login"
                                                                            value={bankLogin.login}
                                                                            onChange={e => setBankLogin({...bankLogin, login: e.target.value})}
                                                                            className={getInputClass(errors.bankLogin)}
                                                                        />
                                                                        {errors.bankLogin && <p className="text-red-500 text-xs mt-1">{errors.bankLogin}</p>}
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            type="password" placeholder="Hasło"
                                                                            value={bankLogin.password}
                                                                            onChange={e => setBankLogin({...bankLogin, password: e.target.value})}
                                                                            className={getInputClass(errors.bankPass)}
                                                                        />
                                                                        {errors.bankPass && <p className="text-red-500 text-xs mt-1">{errors.bankPass}</p>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(paymentMethod === 'gpay' || paymentMethod === 'paypal') && (
                                            <div
                                                className="flex flex-col items-center justify-center h-full animate-fade-in text-center py-6">
                                                <div
                                                    className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                                    <span className="text-2xl text-blue-500">➔</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800 mb-2">Przekierowanie do
                                                    operatora</h4>
                                                <p className="text-slate-500 text-sm max-w-xs">Bezpieczna finalizacja
                                                    transakcji nastąpi na
                                                    stronie {paymentMethod === 'gpay' ? 'Google Pay' : 'PayPal'}.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-5 pt-2">
                                        <button onClick={() => setStep(1)}
                                                className="px-8 py-4 rounded-xl border border-gray-200 text-slate-500 font-bold hover:bg-gray-50 hover:text-slate-700 transition-all">
                                            Wróć
                                        </button>
                                        <Button
                                            onClick={handlePayment}
                                            variant="primary"
                                            className="flex-1 py-4 text-lg shadow-xl shadow-blue-600/20 rounded-xl hover:shadow-blue-600/30 transition-all flex justify-center items-center gap-3"
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>{processingStatus}</span>
                                                </>
                                            ) : (
                                                <span>Zapłać {dynamicTotal.toFixed(2)} zł</span>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400">Klikając przycisk, akceptujesz <a
                                            href="#" className="underline hover:text-gray-600">Regulamin</a> świadczenia
                                            usług drogą elektroniczną.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}