import Modal from '../../ui/modals/Modal.tsx';
import Button from '../../ui/Button.tsx';
import BirthDatePicker from '../../ui/BirthDatePicker.tsx';
import {useOnboardingModal} from '../../../hooks/useOnboardingModal.ts';

export default function OnboardingModal() {
    const {
        isOpen,
        handleSkip,
        birthDateStr,
        setBirthDateStr,
        handleSave,
        loading
    } = useOnboardingModal();

    return (
        <Modal isOpen={isOpen} onClose={handleSkip} className="max-w-md">
            <div className="text-center">
                <div
                    className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                    🎁
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Dokończ konfigurację</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Podaj datę urodzenia, abyśmy mogli dobrać dla Ciebie najlepsze oferty.
                </p>

                <div className="mb-8 text-left">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Data urodzenia</label>

                    <BirthDatePicker
                        value={birthDateStr}
                        onChange={setBirthDateStr}
                    />

                    <p className="text-xs text-gray-400 mt-2 ml-1">Wymagane ukończone 18 lat.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button variant="primary" onClick={handleSave} disabled={loading || !birthDateStr}
                            className="w-full py-3">
                        {loading ? "Zapisywanie..." : "Zapisz i przejdź dalej"}
                    </Button>
                    <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 underline py-2">
                        Pomiń ten krok
                    </button>
                </div>
            </div>
        </Modal>
    );
}