import Modal from './Modal.tsx';
import Button from '../Button.tsx';
import type {IUserFormModalProps} from "../../../types/user.types.ts";
import {useUserForm} from "../../../hooks/useUserForm.ts";

export const UserFormModal = ({ isOpen, onClose, onSaveSuccess, token, userToEdit }: IUserFormModalProps) => {

    const { formData, handleChange, handleSubmit, isLoading, error } = useUserForm(isOpen, userToEdit, token, () => { onSaveSuccess(); onClose(); }
    )

    const inputClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E61F6] outline-none"
    const labelClass = "block text-sm font-medium text-gray-700"

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edytuj użytkownika</h2>

            <form onSubmit={handleSubmit} className="space-y-4" onClick={e => e.stopPropagation()}>
                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className={labelClass}>Imię <span className='text-red-500'>*</span></label>
                        <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Nazwisko <span className='text-red-500'>*</span></label>
                        <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Email <span className='text-red-500'>*</span></label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className={labelClass}>Telefon (opcjonalnie)</label>
                        <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Data urodzenia</label>
                        <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full !py-3" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}