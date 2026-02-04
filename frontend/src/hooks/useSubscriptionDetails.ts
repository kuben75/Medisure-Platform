import { useState } from "react";
import { useAuth } from "./useAuth.ts";
import { useNotification } from "./UseNotification.ts";
import { useConfirm } from "./UseConfrim.ts";
import { generatePolicyPDF } from "../utils/pdfGenerator.ts";
import type { ISubscriptionDetailsModalProps } from "../types/pricing.types.ts";
import {formatDate} from "../utils/dateHelpers.ts";

type TUseSubscriptionDetailsProps = Pick<ISubscriptionDetailsModalProps, 'subscription' | 'onClose' | 'onRefresh'>;

export const useSubscriptionDetails = ({ subscription, onRefresh, onClose }: TUseSubscriptionDetailsProps) => {
    const { notify } = useNotification()
    const { user, token } = useAuth()
    const confirm = useConfirm()
    const [isDownloading, setIsDownloading] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    const startDate = subscription ? new Date(subscription.startDate) : new Date()
    const endDate = subscription ? new Date(subscription.endDate) : new Date()
    const now = new Date()

    const isExpired = endDate < now
    const isPending = startDate > now
    const isCancelled = subscription?.status === 'Cancelled'

    const hasMonthlyBilling = subscription && 'billingPeriod' in subscription && (subscription as { billingPeriod?: string }).billingPeriod === 'monthly';
    const isMonthly = subscription?.price?.includes('/ mies') || hasMonthlyBilling;

    const handleDownload = async () => {
        if (!subscription) return;

        setIsDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await generatePolicyPDF(
                subscription,
                `${user?.firstName} ${user?.lastName}`,
                user?.pesel ?? ''
            )
            notify.success("Potwierdzenie zostało pobrane.")
        } catch (error) {
            console.error(error)
            notify.error("Błąd podczas generowania PDF.")
        } finally {
            setIsDownloading(false)
        }
    }

    const handleCancelSubscription = async () => {
        if (!subscription) return;

        const confirmed = await confirm({
            title: "Anulowanie subskrypcji",
            description: `Czy na pewno chcesz anulować? Pakiet pozostanie aktywny do ${formatDate(subscription.endDate)}, po czym wygaśnie.`,
            confirmText: "Tak, anuluj",
            cancelText: "Wróć",
            variant: "danger"
        });

        if (!confirmed) return;

        setIsCancelling(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/${subscription.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || "Nie udało się anulować subskrypcji.")
            }

            notify.success("Subskrypcja została anulowana.")
            if (onRefresh) onRefresh()
            onClose()

        } catch (error) {
            notify.error(error instanceof Error ? error.message : "Błąd podczas anulowania subskrypcji.")
        } finally {
            setIsCancelling(false)
        }
    }

    return {
        isDownloading,
        isCancelling,
        isMonthly,
        handleDownload,
        handleCancelSubscription,
        isExpired,
        isCancelled,
        isPending,
        endDate
    }
}