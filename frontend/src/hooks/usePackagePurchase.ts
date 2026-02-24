import {useState, useMemo, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import type {IAddressData, IPricingPlan, ISubscriptionOption, TBillingType} from "../types/pricing.types.ts";
import {useAuth} from "./useAuth.ts";
import {useNotification} from "./UseNotification.ts";
import {useConfirm} from "./UseConfrim.ts";
import {displayApiError} from "../utils/apiErrorHandler.ts";

const SUBSCRIBE_URL = `${import.meta.env.VITE_API_URL}/subscriptions`;
const OPTIONS_URL = `${import.meta.env.VITE_API_URL}/packages/options`;

export const usePackagePurchase = () => {
    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null);
    const [selectedDuration, setSelectedDuration] = useState('yearly');
    const [billingPeriod, setBillingPeriod] = useState<TBillingType>('monthly');
    const [options, setOptions] = useState<ISubscriptionOption[]>([]);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const {token, user, updateUser} = useAuth();
    const navigate = useNavigate();
    const {notify} = useNotification();
    const confirm = useConfirm();

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await fetch(OPTIONS_URL);
                if (res.ok) {
                    const data = await res.json();
                    setOptions(data);
                }
            } catch (err) {
                console.error("Błąd pobierania opcji:", err);
            }
        };
        fetchOptions();
    }, []);

    const openModal = (plan: IPricingPlan) => {
        setSelectedPlan(plan);
        setSelectedDuration('yearly');
        setBillingPeriod('monthly');
    };

    const closeModal = () => {
        setSelectedPlan(null);
        setIsCheckoutOpen(false);
    };

    const priceDetails = useMemo(() => {
        const defaults = {
            total: 0,
            monthly: 0,
            originalTotal: 0,
            isDiscounted: false,
            months: 12,
            discountLabel: '',
            label: ''
        };

        if (!selectedPlan || options.length === 0) {
            return defaults;
        }

        const option = options.find(o => o.id === selectedDuration) || options[0];
        if (!option) {
            return defaults;
        }

        const baseMonthly = selectedPlan.priceValue || 0;

        if (option.id === '7d') {
            return {...defaults, total: 1, monthly: 0, months: 0, label: option.label, discountLabel: 'TEST'};
        }


        const months = option.months;
        const originalTotal = baseMonthly * months;

        if (billingPeriod === 'monthly') {
            return {
                total: originalTotal,
                originalTotal: originalTotal,
                monthly: baseMonthly,
                isDiscounted: false,
                months: months,
                label: option.label,
                discountLabel: ''
            };
        }
        else {
            const discountFactor = 1 - option.discount;
            const finalTotal = originalTotal * discountFactor;
            const effectiveMonthly = finalTotal / months;

            return {
                total: Math.round(finalTotal),
                originalTotal: Math.round(originalTotal),
                monthly: effectiveMonthly,
                isDiscounted: option.discount > 0,
                months: months,
                label: option.label,
                discountLabel: option.discount > 0 ? `-${option.discount * 100}%` : ''
            };
        }
    }, [selectedPlan, selectedDuration, options, billingPeriod]);

    const handleProceedToCheckout = async () => {
        if (!selectedPlan) {
            return;
        }

        if (!token || !user) {
            const shouldLogin = await confirm({
                title: "Wymagane logowanie",
                description: "Musisz być zalogowany, aby kupić pakiet.",
                confirmText: "Zaloguj się",
                cancelText: "Anuluj",
                variant: 'info'
            });
            if (shouldLogin) {
                navigate('/login');
            }
            return;
        }

        setIsCheckoutOpen(true);
    };

    const finalizePurchase = async (method: string, txId: string, addressData: IAddressData) => {
        setIsBuying(true);
        try {
            const payload = {
                duration: selectedDuration,
                billingPeriod: billingPeriod,
                paymentMethod: method,
                transactionId: txId,
                ...addressData
            };

            const response = await fetch(`${SUBSCRIBE_URL}/${selectedPlan!.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw await response.json();
            }

            const data = await response.json();

            const returnedUser = data.data || data.Data;
            if (user) {
                if (returnedUser) {
                    updateUser({
                        ...user,
                        pesel: returnedUser.pesel || returnedUser.Pesel || user.pesel,
                        birthDate: returnedUser.birthDate || returnedUser.BirthDate || user.birthDate,
                        phoneNumber: returnedUser.phoneNumber || returnedUser.PhoneNumber || user.phoneNumber,
                        firstName: returnedUser.firstName || returnedUser.FirstName || user.firstName,
                        lastName: returnedUser.lastName || returnedUser.LastName || user.lastName
                    });
                }
                else {
                    updateUser({
                        ...user,
                        pesel: addressData.pesel || user.pesel || null,
                        phoneNumber: addressData.phone || user.phoneNumber || null,
                        birthDate: addressData.birthDate || user.birthDate || null,
                        roles: user.roles ?? []
                    });
                }
            }
            notify.success("Pakiet zakupiony pomyślnie!");
            closeModal();
            navigate('/profile');
        } catch (err) {
            displayApiError(err, notify);
        } finally {
            setIsBuying(false);
        }
    };

    return {
        selectedPlan,
        selectedDuration,
        setSelectedDuration,
        openModal,
        closeModal,
        priceDetails,
        options,
        handleProceedToCheckout,
        isCheckoutOpen,
        closeCheckout: () => setIsCheckoutOpen(false),
        finalizePurchase,
        isBuying,
        billingPeriod,
        setBillingPeriod,
    }
}