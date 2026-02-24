import {type ChangeEvent} from 'react';
import Button from '../Button.tsx';
import UserIcon from "../../icons/UserIcon.tsx";
import MapIcon from "../../icons/MapIcon.tsx";
import CalendarIcon from "../../icons/CalendarIcon.tsx";
import ShieldCheckIcon from "../../icons/ShieldCheckIcon.tsx";
import type {IPersonalDataFormProps} from "../../../types/pricing.types.ts";

export default function PersonalDataForm({
                                             formData,
                                             errors,
                                             isPeselLocked,
                                             isBirthDateLocked,
                                             saveInfo,
                                             onFormChange,
                                             onSaveInfoChange,
                                             onSubmit,
                                             onErrorsClear
                                         }: IPersonalDataFormProps) {
    const getInputClass = (errorKey: string, locked = false) => `
        w-full border rounded-xl px-4 py-3.5 font-medium transition-all outline-none 
        ${locked
        ? 'bg-gray-50 border-gray-200 text-slate-500 cursor-not-allowed'
        : errorKey
            ? 'bg-red-50 border-red-300 text-red-900 focus:ring-2 focus:ring-red-200 placeholder:text-red-300'
            : 'bg-white border-gray-300 text-slate-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-gray-300 hover:border-gray-400'
    }
    `;

    const handleZipCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = `${val.slice(0, 2)}-${val.slice(2, 5)}`;
        }
        onFormChange({...formData, zipCode: val.slice(0, 6)});
        if (errors.zipCode) {
            onErrorsClear('zipCode');
        }
    };

    return (
        <form onSubmit={onSubmit} className="animate-fade-in space-y-8 md:space-y-10" autoComplete="off">
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                    <div className="bg-blue-50 p-2 rounded-lg"><UserIcon className="w-5 h-5"/></div>
                    <h3 className="text-lg font-bold text-slate-800">Dane Odbiorcy</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="group">
                        <label
                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Imię</label>
                        <input type="text" value={formData.firstName}
                               onChange={e => onFormChange({...formData, firstName: e.target.value})}
                               className={getInputClass(errors.firstName)}/>
                        {errors.firstName && <p className="text-red-500 text-xs mt-1 absolute">{errors.firstName}</p>}
                    </div>
                    <div className="group">
                        <label
                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nazwisko</label>
                        <input type="text" value={formData.lastName}
                               onChange={e => onFormChange({...formData, lastName: e.target.value})}
                               className={getInputClass(errors.lastName)}/>
                        {errors.lastName && <p className="text-red-500 text-xs mt-1 absolute">{errors.lastName}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="group">
                        <label
                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                        <input type="text" value={formData.email}
                               onChange={e => onFormChange({...formData, email: e.target.value})}
                               className={getInputClass(errors.email)}/>
                        {errors.email && <p className="text-red-500 text-xs mt-1 absolute">{errors.email}</p>}
                    </div>

                    <div className="group relative">
                        <label
                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Telefon <span
                            className="text-red-400">*</span></label>
                        <input type="tel" value={formData.phone} onChange={e => {
                            onFormChange({...formData, phone: e.target.value});
                            if (errors.phone) {
                                onErrorsClear('phone');
                            }
                        }} className={getInputClass(errors.phone)}/>
                        {errors.phone && <p className="text-red-500 text-xs mt-1 absolute">{errors.phone}</p>}
                    </div>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 md:p-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 text-orange-800">
                        <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                            <ShieldCheckIcon className="w-5 h-5 text-orange-800"/>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">Weryfikacja Tożsamości</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="group relative">
                            <label
                                className="block text-[11px] font-bold text-orange-800 uppercase tracking-wider mb-2">
                                Data urodzenia {isBirthDateLocked &&
                                <span className="text-green-600 ml-1">(Zweryfikowano)</span>}
                            </label>
                            <input type="date" name="birthDate" value={formData.birthDate}
                                   max={new Date().toISOString().split('T')[0]} readOnly={isBirthDateLocked}
                                   onChange={e => {
                                       if (!isBirthDateLocked) {
                                           onFormChange({...formData, birthDate: e.target.value});
                                           if (errors.birthDate) {
                                               onErrorsClear('birthDate');
                                           }
                                       }
                                   }}
                                   className={getInputClass(errors.birthDate, isBirthDateLocked) + " bg-white"}
                            />
                            {errors.birthDate &&
                                <p className="text-red-500 text-xs mt-1 absolute">{errors.birthDate}</p>}
                        </div>

                        <div className="group relative">
                            <label className="block text-[11px] font-bold text-orange-800 uppercase tracking-wider mb-2">
                                PESEL {isPeselLocked && <span className="text-green-600 ml-1">(Zweryfikowano)</span>}
                            </label>
                            <input type="text" name="pesel" maxLength={11} value={formData.pesel}
                                   readOnly={isPeselLocked}
                                   onChange={e => {
                                       if (!isPeselLocked) {
                                           onFormChange({...formData, pesel: e.target.value.replace(/\D/g, '')});
                                           if (errors.pesel) {
                                               onErrorsClear('pesel');
                                           }
                                       }
                                   }}
                                   className={getInputClass(errors.pesel, isPeselLocked)}
                            />
                            {errors.pesel && <p className="text-red-500 text-xs mt-1 absolute">{errors.pesel}</p>}
                            {!isPeselLocked &&
                                <p className="text-[10px] text-orange-600/70 mt-1">Numer PESEL zostanie przypisany do
                                    Twojego konta na stałe.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 hidden sm:block">
                        <CalendarIcon className="w-5 h-5"/>
                    </div>
                    <div className="flex-grow group relative w-full">
                        <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2">
                            Data rozpoczęcia ochrony
                        </label>
                        <input type="date" value={formData.startDate}
                               min={new Date().toISOString().split('T')[0]}
                               max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                               onChange={e => onFormChange({...formData, startDate: e.target.value})}
                               className="w-full border rounded-xl px-4 py-3 font-medium bg-white border-blue-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="text-[10px] text-blue-600/70 mt-1">Pozostaw puste, aby aktywować pakiet od
                            dzisiaj.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-2">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                    <div className="bg-blue-50 p-2 rounded-lg"><MapIcon className="w-5 h-5"/></div>
                    <h3 className="text-lg font-bold text-slate-800">Dane do umowy</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="sm:col-span-2 group relative">
                        <label
                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ulica</label>
                        <input type="text" value={formData.street} onChange={e => {
                            onFormChange({...formData, street: e.target.value});
                            if (errors.street) {
                                onErrorsClear('street');
                            }
                        }} className={getInputClass(errors.street)} />
                        {errors.street && <p className="text-red-500 text-xs mt-1 absolute">{errors.street}</p>}
                    </div>
                    <div className="group relative">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nr
                            domu</label>
                        <input type="text" value={formData.houseNumber} onChange={e => {
                            onFormChange({...formData, houseNumber: e.target.value});
                            if (errors.houseNumber) {
                                onErrorsClear('houseNumber');
                            }
                        }} className={getInputClass(errors.houseNumber)} />
                        {errors.houseNumber &&
                            <p className="text-red-500 text-xs mt-1 absolute">{errors.houseNumber}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="group relative">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kod
                            pocztowy</label>
                        <input type="text" maxLength={6} value={formData.zipCode} onChange={handleZipCodeChange}
                               className={getInputClass(errors.zipCode)} />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1 absolute">{errors.zipCode}</p>}
                    </div>
                    <div className="sm:col-span-2 group relative">
                        <label
                            className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Miejscowość</label>
                        <input type="text" value={formData.city} onChange={e => {
                            onFormChange({...formData, city: e.target.value});
                            if (errors.city) {
                                onErrorsClear('city');
                            }
                        }} className={getInputClass(errors.city)} />
                        {errors.city && <p className="text-red-500 text-xs mt-1 absolute">{errors.city}</p>}
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <label className="flex items-start sm:items-center cursor-pointer group">
                    <input type="checkbox" checked={saveInfo} onChange={e => onSaveInfoChange(e.target.checked)}
                           className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-gray-300 text-[#4E61F6] focus:ring-[#4E61F6] cursor-pointer accent-[#4E61F6] flex-shrink-0"/>
                    <span
                        className="ml-3 text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium leading-tight">
                        Zapamiętaj moje dane do przyszłych transakcji
                    </span>
                </label>
            </div>
            <div className="pt-6 pb-6 lg:pb-0">
                <Button type="submit" variant="primary"
                        className="w-full py-4 text-base font-bold shadow-xl shadow-blue-600/10 rounded-xl hover:shadow-blue-600/20 transition-all">
                    Zatwierdź i Przejdź dalej
                </Button>
            </div>
        </form>
    )
}