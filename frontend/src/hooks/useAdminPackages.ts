import {useState, useEffect, useCallback} from "react";
import {useAuth} from "./useAuth.ts";
import {useConfirm} from "./UseConfrim.ts";
import {useNotification} from "./UseNotification.ts";
import type {IPricingPlan} from "../types/pricing.types.ts";

const API_URL = `${import.meta.env.VITE_API_URL}/packages`;

export const useAdminPackages = () => {
    const [packages, setPackages] = useState<IPricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<IPricingPlan | null>(null);

    const {token} = useAuth();
    const confirm = useConfirm();
    const {notify} = useNotification();

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            setPackages(await response.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages().then(() => console.log("Pakiety załadowane"));
    }, [fetchPackages]);

    const deletePackage = async (id: number) => {
        if (!await confirm({
            title: "Usuwanie pakietu",
            description: "Czy na pewno chcesz usunąć ten pakiet? Operacja jest nieodwracalna.",
            confirmText: "Usuń trwale",
            variant: 'danger'
        })) {
            return;
        }

        if (!token) {
            notify.error("Błąd: Brak autoryzacji.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (!response.ok) {
                throw new Error('Nie udało się usunąć pakietu.');
            }

            notify.success("Pakiet został usunięty.");
            await fetchPackages();
        } catch (err) {
            notify.error(err instanceof Error ? err.message : String(err));
        }
    };

    const handleOpenAdd = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (pkg: IPricingPlan) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    const handleSaveSuccess = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
        fetchPackages().then(() => console.log("Zaktualizowano listę pakietów"));
        notify.success(editingPackage ? "Pakiet zaktualizowany." : "Dodano nowy pakiet.");
    };

    return {
        packages, loading, error, token,
        modals: {isModalOpen, setIsModalOpen, editingPackage, setEditingPackage},
        actions: {deletePackage, handleOpenAdd, handleOpenEdit, handleSaveSuccess}
    }
}