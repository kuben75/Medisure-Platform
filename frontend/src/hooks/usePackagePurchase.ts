import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DURATION_OPTIONS } from '../constants/options.ts';
import type { IPricingPlan } from "../types/pricing.types.ts";
import { useAuth } from "./useAuth.ts";
import { useNotification } from "./UseNotification.ts";
import { useConfirm } from "./UseConfrim.ts";

const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL}/subscriptions`

export const usePackagePurchase = () => {
    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null)
    const [selectedDuration, setSelectedDuration] = useState('1y')
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [isBuying, setIsBuying] = useState(false)

    const { token, user } = useAuth()
    const navigate = useNavigate()
    const { notify } = useNotification()
    const confirm = useConfirm()

    const openModal = (plan: IPricingPlan) => {
        setSelectedPlan(plan)
        setSelectedDuration('1y')
    }

    const closeModal = () => {
        setSelectedPlan(null)
        setIsCheckoutOpen(false)
    }

    const priceDetails = useMemo(() => {
        if (!selectedPlan) return { total: 0, monthly: 0, originalTotal: 0, isDiscounted: false, months: 12, discountLabel: '' }

        const option = DURATION_OPTIONS.find(o => o.value === selectedDuration) || DURATION_OPTIONS.find(o => o.value === '1y')!
        const baseMonthly = selectedPlan.priceValue || 0
        const months = option.months
        const originalTotal = baseMonthly * months
        const discountFactor = 1 - option.discount
        const finalTotal = originalTotal * discountFactor

        return {
            total: Math.round(finalTotal),
            originalTotal: Math.round(originalTotal),
            monthly: baseMonthly,
            isDiscounted: option.discount > 0,
            months: months,
            discountLabel: option.discount > 0 ? `-${option.discount * 100}%` : ''
        }
    }, [selectedPlan, selectedDuration])

    const handleProceedToCheckout = async () => {
        if (!selectedPlan) return

        if (!token || !user) {
            const shouldLogin = await confirm({
                title: "Wymagane logowanie",
                description: "Musisz być zalogowany, aby kupić pakiet. Czy chcesz się zalogować teraz?",
                confirmText: "Zaloguj się",
                cancelText: "Anuluj",
                variant: 'info'
            })
            if (shouldLogin) navigate('/login')
            return
        }
        if(!user.pesel) {
            const shouldUpdate = await confirm({
                title: "Brak numeru PESEL",
                description: "Aby kupić pakiet, musisz podać swój numer PESEL w ustawieniach profilu.",
                confirmText: "Przejdź do profilu",
                cancelText: "Anuluj",
                variant: 'info'
            })
            if (shouldUpdate) navigate('/profile')
            return
        }

        setIsCheckoutOpen(true);
    }

    const finalizePurchase = async (method: string, txId: string, addressData: any) => {
       setIsBuying(true)
        try {
            const payload = {
                duration: selectedDuration,
                paymentMethod: method,
                transactionId: txId,
                ...addressData
            }

            const response = await fetch(`${SUBSCRIBE_URL}/${selectedPlan!.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error("Błąd zakupu")

            notify.success("Pakiet zakupiony pomyślnie!")
            closeModal()
            navigate('/profile')

        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Błąd podczas zakupu pakietu")
        }
        finally {
            setIsBuying(false)
        }
    }

    return {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        openModal,
        closeModal,
        priceDetails,
        handleProceedToCheckout,
        isCheckoutOpen,
        closeCheckout: () => setIsCheckoutOpen(false),
        finalizePurchase,
        isBuying
    }
}