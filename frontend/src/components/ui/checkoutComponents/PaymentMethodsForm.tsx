import {type ChangeEvent} from 'react';
import Button from '../Button.tsx';
import CreditCardIcon from "../../icons/CreditCardIcon.tsx";
import BlikLogo from "../../icons/BlikLogo.tsx";
import PayPalLogo from "../../icons/PayPalLogo.tsx";
import GPayLogo from "../../icons/GPayLogo.tsx";
import type {IPaymentMethodsFormProps, TBankOptionType, TPaymentMethodType} from '../../../types/pricing.types.ts';
import BankIcon from "../../icons/BankIcon.tsx";

const BankLogo = ({name, color}: { name: string, color: string }) => (
    <div className="flex items-center justify-center w-full h-full font-bold text-sm tracking-tight"
         style={{color: color}}>
        {name}
    </div>
);

export default function PaymentMethodsForm({
                                               paymentMethod,
                                               selectedBank,
                                               cardData,
                                               blikCode,
                                               bankLogin,
                                               errors,
                                               amountToPayNow,
                                               isProcessing,
                                               processingStatus,
                                               onPaymentMethodChange,
                                               onSelectedBankChange,
                                               onCardDataChange,
                                               onBlikCodeChange,
                                               onBankLoginChange,
                                               onErrorsClear,
                                               onBack,
                                               onPayment
                                           }: IPaymentMethodsFormProps) {
    const getInputClass = (errorKey: string, locked = false) => `
        w-full border rounded-xl px-4 py-3.5 font-medium transition-all outline-none 
        ${locked
        ? 'bg-gray-50 border-gray-200 text-slate-500 cursor-not-allowed'
        : errorKey
            ? 'bg-red-50 border-red-300 text-red-900 focus:ring-2 focus:ring-red-200 placeholder:text-red-300'
            : 'bg-white border-gray-300 text-slate-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-gray-300 hover:border-gray-400'
    }
    `;

    const handleExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
        onCardDataChange({...cardData, expiry: val.slice(0, 5)});
        if (errors.expiry) onErrorsClear('expiry');
    };

    const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.match(/.{1,4}/g)?.join(' ') || val;
        onCardDataChange({...cardData, number: val});
        if (errors.cardNumber) onErrorsClear('cardNumber');
    };

    const handleBlikChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 6);
        onBlikCodeChange(val);
        if (errors.blik) onErrorsClear('blik');
    };

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8 pb-6 lg:pb-0">
            <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Wybierz metodę płatności
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                        {id: 'card', label: 'Karta', icon: <CreditCardIcon/>},
                        {id: 'transfer', label: 'Płatność', icon: <BankIcon className={"w-5 h-5"}/>, subtext: "BLIK i przelewy"},
                        {id: 'gpay', label: 'Google Pay', icon: <GPayLogo/>},
                        {id: 'paypal', label: 'PayPal', icon: <PayPalLogo/>}
                    ].map((m) => (
                        <button key={m.id} onClick={() => {
                            onPaymentMethodChange(m.id as TPaymentMethodType);
                            onSelectedBankChange(null);
                        }}
                                className={`relative flex flex-col items-center justify-center gap-2 md:gap-3 h-24 md:h-28 rounded-2xl border transition-all duration-300 group
                                    ${paymentMethod === m.id ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.02] z-10 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }`}>
                            {paymentMethod === m.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                            <div className={`transition-all duration-300 transform scale-90 md:scale-100 ${paymentMethod === m.id ? 'scale-100 md:scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                                {m.icon}
                            </div>
                            <span className={`text-xs font-bold ${paymentMethod === m.id ? 'text-blue-700' : 'text-slate-500'}`}>{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm relative overflow-hidden min-h-[280px]">
                {paymentMethod === 'card' && (
                    <div className="space-y-6 animate-fade-in relative z-10">
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Numer karty</label>
                            <div className="relative">
                                <input type="text" maxLength={19} placeholder="0000 0000 0000 0000" value={cardData.number}
                                       onChange={handleCardNumberChange} className={getInputClass(errors.cardNumber)}/>
                                <div className="absolute right-0 top-3 text-gray-300 pr-3"><CreditCardIcon/></div>
                            </div>
                            {errors.cardNumber && <p className="text-red-500 text-xs mt-1 absolute">{errors.cardNumber}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-10">
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ważna do</label>
                                <input type="text" maxLength={5} placeholder="MM/YY" value={cardData.expiry}
                                       onChange={handleExpiryChange} className={getInputClass(errors.expiry)}/>
                                {errors.expiry && <p className="text-red-500 text-xs mt-1 absolute">{errors.expiry}</p>}
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">CVC</label>
                                <input type="text" maxLength={3} placeholder="123" value={cardData.cvc}
                                       onChange={e => {
                                           onCardDataChange({...cardData, cvc: e.target.value.replace(/\D/g, '')});
                                           if (errors.cvc) onErrorsClear('cvc');
                                       }} className={getInputClass(errors.cvc)}/>
                                {errors.cvc && <p className="text-red-500 text-xs mt-1 absolute">{errors.cvc}</p>}
                            </div>
                        </div>
                    </div>
                )}
                {paymentMethod === 'transfer' && (
                    <div className="animate-fade-in h-full flex flex-col">
                        {!selectedBank ? (
                            <>
                                <h4 className="text-sm font-bold text-gray-700 mb-4 text-center">Wybierz swój bank lub BLIK</h4>

                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                                    <button onClick={() => onSelectedBankChange('blik')}
                                            className="col-span-1 h-20 border border-gray-200 rounded-xl flex items-center justify-center hover:border-black hover:shadow-md transition-all bg-white">
                                        <BlikLogo/>
                                    </button>
                                    {[
                                        {id: 'mbank', name: 'mBank', color: '#e60023'}, {id: 'pko', name: 'IPKO', color: '#003c71'},
                                        {id: 'santander', name: 'Santander', color: '#ec0000'}, {id: 'ing', name: 'ING', color: '#ff6200'},
                                        {id: 'pekao', name: 'Pekao24', color: '#cc0000'}, {id: 'millennium', name: 'Millennium', color: '#bf005d'},
                                        {id: 'alior', name: 'Alior', color: '#5b1f00'}
                                    ].map(bank => (
                                        <button key={bank.id} onClick={() => onSelectedBankChange(bank.id as TBankOptionType)}
                                                className="h-20 border border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all bg-white text-xs font-bold text-gray-700">
                                            <BankLogo name={bank.name} color={bank.color}/>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col h-full animate-fade-in-up">
                                <button onClick={() => { onSelectedBankChange(null); }}
                                        className="self-start text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                                    ← Zmień metodę
                                </button>
                                {selectedBank === 'blik' ? (
                                    <div className="flex flex-col items-center justify-center py-4 flex-grow">
                                        <BlikLogo/>
                                        <label className="text-sm font-bold text-slate-500 mt-6 mb-4 block text-center">Wpisz kod z aplikacji bankowej</label>
                                        <div className="relative w-full flex flex-col items-center">
                                            <input type="text" maxLength={6} placeholder="000 000" value={blikCode}
                                                   onChange={handleBlikChange}
                                                   className={`text-4xl md:text-5xl font-black text-center tracking-[0.2em] w-full max-w-[260px] border-b-2 focus:border-blue-500 outline-none py-2 text-slate-800 placeholder:text-gray-200 bg-transparent transition-colors ${errors.blik ? 'border-red-300 text-red-900' : 'border-gray-200'}`}/>
                                            {errors.blik && <p className="text-red-500 text-xs mt-4 font-bold">{errors.blik}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-center flex-grow px-0 sm:px-4">
                                        <div className="text-center mb-6">
                                            <h4 className="text-lg font-bold text-gray-800">Logowanie do banku</h4>
                                            <p className="text-xs text-gray-500">Bezpieczne połączenie z {selectedBank?.toUpperCase()}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <input type="text" placeholder="Identyfikator / Login" value={bankLogin.login}
                                                       onChange={e => onBankLoginChange({...bankLogin, login: e.target.value})}
                                                       className={getInputClass(errors.bankLogin)}/>
                                                {errors.bankLogin && <p className="text-red-500 text-xs mt-1">{errors.bankLogin}</p>}
                                            </div>
                                            <div>
                                                <input type="password" placeholder="Hasło" value={bankLogin.password}
                                                       onChange={e => onBankLoginChange({...bankLogin, password: e.target.value})}
                                                       className={getInputClass(errors.bankPass)}/>
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
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center py-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="text-2xl text-blue-500">➔</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">Przekierowanie do operatora</h4>
                        <p className="text-slate-500 text-sm max-w-xs">Bezpieczna finalizacja transakcji nastąpi na stronie {paymentMethod === 'gpay' ? 'Google Pay' : 'PayPal'}.</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-4 md:gap-5 pt-2">
                <button onClick={onBack}
                        className="px-8 py-4 rounded-xl border border-gray-200 text-slate-500 font-bold hover:bg-gray-50 hover:text-slate-700 transition-all w-full sm:w-auto">
                    Wróć
                </button>
                <Button
                    onClick={onPayment}
                    variant="primary"
                    className="flex-1 py-4 text-lg shadow-xl shadow-blue-600/20 rounded-xl hover:shadow-blue-600/30 transition-all flex justify-center items-center gap-3 w-full"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{processingStatus}</span>
                        </>
                    ) : (
                        <span>Zapłać {amountToPayNow.toFixed(2)} zł</span>
                    )}
                </Button>
            </div>

            <div className="text-center pb-6">
                <p className="text-[10px] text-gray-400">
                    Klikając przycisk, akceptujesz <a href="#" className="underline hover:text-gray-600">Regulamin</a> świadczenia usług drogą elektroniczną.
                </p>
            </div>
        </div>
    );
}