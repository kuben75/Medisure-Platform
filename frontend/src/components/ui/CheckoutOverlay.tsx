import {type FormEvent, useEffect, useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import type {ICheckoutOverlayProps, TBankOptionType, TPaymentMethodType} from '../../types/pricing.types';
import {calculateAge} from "../../utils/dateHelpers.ts";
import PersonalDataForm from "./checkoutComponents/PersonalDataForm.tsx";
import SuccessScreen from "./checkoutComponents/SuccessScreen.tsx";
import PaymentMethodsForm from "./checkoutComponents/PaymentMethodsForm.tsx";
import OrderSummary from "./checkoutComponents/OrderSummary.tsx";

export default function CheckoutOverlay({isOpen, onClose, plan, priceDetails, onFinalize, billingPeriod}: ICheckoutOverlayProps) {
    const {user} = useAuth()
    const [step, setStep] = useState<1 | 2>(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingStatus, setProcessingStatus] = useState("Inicjowanie...")
    const [isSuccess, setIsSuccess] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isPeselLocked, setIsPeselLocked] = useState(false)
    const [isBirthDateLocked, setIsBirthDateLocked] = useState(false)
    const [saveInfo, setSaveInfo] = useState(false)
    const [countdown, setCountdown] = useState(5)

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', birthDate: '',
        pesel: '', street: '', houseNumber: '', city: '',
        zipCode: '', startDate: ''
    })

    const [dynamicTotalContractValue, setDynamicTotalContractValue] = useState(priceDetails.total);

    const [paymentMethod, setPaymentMethod] = useState<TPaymentMethodType>('card')
    const [selectedBank, setSelectedBank] = useState<TBankOptionType | null>(null)
    const [bankLogin, setBankLogin] = useState({login: '', password: ''})
    const [cardData, setCardData] = useState({number: '', expiry: '', cvc: '', holder: ''})
    const [blikCode, setBlikCode] = useState('')

    const durationMonths = priceDetails.months === 0 ? 0 : priceDetails.months;

    const effectiveStart = formData.startDate ? new Date(formData.startDate) : new Date();
    const effectiveEnd = new Date(effectiveStart);

    if (billingPeriod === 'monthly') {
        effectiveEnd.setMonth(effectiveEnd.getMonth() + 1)
    } else {
        if (durationMonths === 0) effectiveEnd.setDate(effectiveEnd.getDate() + 7)
        else effectiveEnd.setMonth(effectiveEnd.getMonth() + durationMonths)
    }
    effectiveEnd.setDate(effectiveEnd.getDate() - 1);

    useEffect(() => {
        if (!formData.birthDate) {
            setDynamicTotalContractValue(priceDetails.total)
            return
        }

        if (isBirthDateLocked || plan.category === 'Senior') {
            setDynamicTotalContractValue(priceDetails.total)
            return
        }
        const age = calculateAge(formData.birthDate)
        let multiplier = 1.0

        if (age > 30 && age <= 50) multiplier += (age - 30) * 0.015
        else if (age > 50) multiplier += 0.30 + (age - 50) * 0.025

        const newTotal = parseFloat((priceDetails.total * multiplier).toFixed(2))
        setDynamicTotalContractValue(newTotal)

    }, [formData.birthDate, isBirthDateLocked, priceDetails.total, plan.category])


    const amountToPayNow = (billingPeriod === 'monthly' && durationMonths > 0)
        ? dynamicTotalContractValue / durationMonths
        : dynamicTotalContractValue

    const savingsAmount = Math.round(priceDetails.originalTotal - priceDetails.total)
    const hasSavings = billingPeriod === 'upfront' && savingsAmount > 5

    const safeAmountToPay = Math.round(amountToPayNow * 100) / 100;

    const dynamicNetto = (safeAmountToPay / 1.23).toFixed(2);

    const dynamicVat = (safeAmountToPay - Number(dynamicNetto)).toFixed(2);

    const priceIncrease = dynamicTotalContractValue - priceDetails.total


    useEffect(() => {
        if (isOpen && user) {
            const userPhone = user.phoneNumber || ''
            let rawBirthDate = user.birthDate || '';
            if (rawBirthDate.includes('T')) {
                rawBirthDate = rawBirthDate.split('T')[0];
            }
            const userBirthDate = rawBirthDate;
            const userPesel = user.pesel || ''
            const savedData = localStorage.getItem('saved_billing_data')
            let initialData = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: userPhone,
                birthDate: userBirthDate,
                pesel: userPesel,
                street: '',
                houseNumber: '',
                city: '',
                zipCode: '',
                startDate: ''
            }

            if (savedData) {
                const parsed = JSON.parse(savedData)
                initialData = {
                    ...initialData,
                    ...parsed,
                    email: user.email,
                    phone: userPhone || parsed.phone || '',
                    birthDate: userBirthDate || parsed.birthDate || '',
                    pesel: userPesel
                }
                setSaveInfo(true)
            }

            setFormData(initialData)

            const hasExistingPesel = Boolean(user.pesel && user.pesel.trim().length >= 11)
            const hasExistingBirthDate = Boolean(user.birthDate && user.birthDate.trim().length > 0)
            setIsPeselLocked(hasExistingPesel)
            setIsBirthDateLocked(hasExistingBirthDate)
            setFormData(prev => ({
                ...prev,
                pesel: hasExistingPesel ? user.pesel! : prev.pesel,
                birthDate: hasExistingBirthDate ? (user.birthDate!.split('T')[0]) : prev.birthDate
            }))
            setStep(1)
            setIsSuccess(false)
            setCountdown(5)
            setIsProcessing(false)
            setErrors({})
            setSelectedBank(null)
            setCardData({number: '', expiry: '', cvc: '', holder: ''})
            setBlikCode('')
            setDynamicTotalContractValue(priceDetails.total)
        }
    }, [isOpen, user, priceDetails.total])

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {}
        const cleanPhone = formData.phone.replace(/\D/g, '')

        if (!formData.firstName.trim()) newErrors.firstName = "Imię wymagane"
        if (!formData.lastName.trim()) newErrors.lastName = "Nazwisko wymagane"
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Poprawny email wymagany"

        if (!cleanPhone || cleanPhone.length < 9) newErrors.phone = "Wymagany poprawny nr telefonu"
        if (!formData.birthDate) newErrors.birthDate = "Data urodzenia jest wymagana do kalkulacji"

        if (formData.birthDate) {
            const age = calculateAge(formData.birthDate)
            if (age < 18) newErrors.birthDate = "Musisz być pełnoletni"
        }
        if (!/^\d{11}$/.test(formData.pesel)) {
            newErrors.pesel = "PESEL musi mieć 11 cyfr"
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
                if (!bankLogin.login || bankLogin.login.length < 5) newErrors.bankLogin = "Login musi mieć min. 5 znaków"
                if (!bankLogin.password || bankLogin.password.length < 8) newErrors.bankPass = "Hasło musi mieć min. 8 znaków"
            }
        }
        if (paymentMethod === 'card') {
            const cleanCard = cardData.number.replace(/\s/g, '')
            if (!/^\d{16}$/.test(cleanCard)) newErrors.cardNumber = "Niepoprawny numer karty"
            if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
                newErrors.expiry = "Format MM/YY"
            } else {
                const [monthStr, yearStr] = cardData.expiry.split('/');
                const month = parseInt(monthStr, 10);
                const year = parseInt(`20${yearStr}`, 10);
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                if (month < 1 || month > 12) newErrors.expiry = "Niepoprawny miesiąc";
                else if (year < currentYear || (year === currentYear && month < currentMonth)) newErrors.expiry = "Karta straciła ważność";
            }
            if (!/^\d{3}$/.test(cardData.cvc)) newErrors.cvc = "CVC to 3 cyfry"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
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

        let finalMethodName: string = paymentMethod
        if (paymentMethod === 'card') finalMethodName = 'Karta'
        else if (paymentMethod === 'paypal') finalMethodName = 'PayPal'
        else if (paymentMethod === 'gpay') finalMethodName = 'Google Pay'
        else if (paymentMethod === 'transfer') finalMethodName = selectedBank === 'blik' ? 'BLIK' : `Przelew (${selectedBank?.toUpperCase()})`;

        onFinalize(finalMethodName, txId, {
            ...formData,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined
        })
    }

    const handleErrorsClear = (key: string) => {
        setErrors({...errors, [key]: ''});
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-white animate-fade-in font-sans overflow-y-auto lg:overflow-hidden">

            <OrderSummary
                plan={plan}
                billingPeriod={billingPeriod || 'upfront'}
                durationMonths={durationMonths}
                effectiveStart={effectiveStart}
                effectiveEnd={effectiveEnd}
                priceIncrease={priceIncrease}
                dynamicNetto={dynamicNetto}
                dynamicVat={dynamicVat}
                dynamicTotalContractValue={dynamicTotalContractValue}
                safeAmountToPay={safeAmountToPay}
                savingsAmount={savingsAmount}
                hasSavings={hasSavings}
                onClose={onClose}
            />

            <div className="w-full lg:w-7/12 xl:w-8/12 bg-white flex flex-col relative order-last lg:h-full lg:overflow-y-auto custom-scrollbar">

                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-4 md:px-10 md:py-6 z-30 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base md:text-lg tracking-tight">Finalizacja zakupu</span>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shadow-sm transition-colors ${step === 1 ? 'bg-[#4E61F6] text-white' : 'bg-gray-100 text-gray-500'}`}>1</div>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-600 hidden sm:inline-block">Dane</span>
                        </div>
                        <div className="w-4 md:w-8 h-px bg-gray-200"></div>
                        <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shadow-sm transition-colors ${step === 2 ? 'bg-[#4E61F6] text-white' : 'bg-gray-100 text-gray-500'}`}>2</div>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-600 hidden sm:inline-block">Płatność</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-10 lg:p-16 max-w-2xl mx-auto w-full flex-grow flex flex-col justify-start pt-6 md:pt-12">
                    {isSuccess ? (
                        <SuccessScreen countdown={countdown} onCountdownChange={setCountdown} />
                    ) : (
                        <>
                            {step === 1 && (
                                <PersonalDataForm
                                    formData={formData}
                                    errors={errors}
                                    isPeselLocked={isPeselLocked}
                                    isBirthDateLocked={isBirthDateLocked}
                                    saveInfo={saveInfo}
                                    onFormChange={setFormData}
                                    onSaveInfoChange={setSaveInfo}
                                    onSubmit={handleNextStep}
                                    onErrorsClear={handleErrorsClear}
                                />
                            )}

                            {step === 2 && (
                                <PaymentMethodsForm
                                    paymentMethod={paymentMethod}
                                    selectedBank={selectedBank}
                                    cardData={cardData}
                                    blikCode={blikCode}
                                    bankLogin={bankLogin}
                                    errors={errors}
                                    amountToPayNow={amountToPayNow}
                                    isProcessing={isProcessing}
                                    processingStatus={processingStatus}
                                    onPaymentMethodChange={(method: TPaymentMethodType) => {
                                        setPaymentMethod(method);
                                        setErrors({});
                                    }}
                                    onSelectedBankChange={(bank: TBankOptionType | null) => {
                                        setSelectedBank(bank);
                                        if (!bank) setErrors({});
                                    }}
                                    onCardDataChange={setCardData}
                                    onBlikCodeChange={setBlikCode}
                                    onBankLoginChange={setBankLogin}
                                    onErrorsClear={handleErrorsClear}
                                    onBack={() => setStep(1)}
                                    onPayment={handlePayment}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}