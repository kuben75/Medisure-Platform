import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DURATION_OPTIONS } from '../constants/options.ts'
import type {IPricingPlan} from "../types/pricing.types.ts"
import {useAuth} from "./useAuth.ts"
import {useNotification} from "./UseNotification.ts"
import {useConfirm} from "./UseConfrim.ts"

const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/subscriptions`

export const usePackagePurchase = () => {
    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null)
    const [selectedDuration, setSelectedDuration] = useState('1y')
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
    }

    const handleBuyPackage = async () => {
        if (!selectedPlan) return;

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
        if (!user.pesel) {
            const goToProfile = await confirm({
                title: "Wymagane uzupełnienie danych",
                description: "Aby zakupić ubezpieczenie, musimy znać Twój numer PESEL (wymóg prawny). Przejdź do profilu, aby go uzupełnić.",
                confirmText: "Uzupełnij PESEL",
                cancelText: "Anuluj",
                variant: 'info'
            });

            if (goToProfile) {
                closeModal();
                navigate('/profile');
            }
            return;
        }

        const durationLabel = DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label

        const isConfirmed = await confirm({
            title: "Potwierdzenie zakupu",
            description: `Czy na pewno chcesz wykupić pakiet "${selectedPlan.name}" na okres: ${durationLabel}?`,
            confirmText: "Kupuję i płacę",
            cancelText: "Anuluj",
            variant: 'info'
        })

        if (!isConfirmed) return

        setIsBuying(true)
        try {
            const response = await fetch(`${SUBSCRIBE_URL}/${selectedPlan.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ duration: selectedDuration })
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.Message || "Wystąpił błąd podczas zakupu.")
            }

            notify.success(`Gratulacje! Pakiet został pomyślnie wykupiony na okres: ${durationLabel}.`)
            closeModal()
            navigate('/profile')
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd podczas zakupu.")
        } finally {
            setIsBuying(false)
        }
    }

    return {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        isBuying,
        openModal,
        closeModal,
        handleBuyPackage
    }
}