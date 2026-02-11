import {useEffect} from 'react';
import Button from '../Button.tsx';
import CheckIcon from '../../icons/CheckIcon.tsx';
import type {ISuccessScreenProps} from "../../../types/ui.types.ts";

export default function SuccessScreen({countdown, onCountdownChange}: ISuccessScreenProps) {
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (countdown > 0) {
            timer = setInterval(() => {
                onCountdownChange(countdown - 1);
            }, 1000);
        }
        else if (countdown === 0) {
            window.location.href = '/profile?tab=subscriptions';
        }
        return () => clearInterval(timer);
    }, [countdown, onCountdownChange]);

    return (
        <div className="text-center py-12 animate-fade-in-up flex flex-col items-center justify-center h-full">
            <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                <div
                    className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl relative z-10 animate-bounce-short">
                    <CheckIcon className="w-12 h-12 text-white"/>
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Płatność przyjęta!</h2>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-md mx-auto mb-10">
                Dziękujemy za zaufanie. Potwierdzenie oraz dokumenty polisy wysłaliśmy na Twój adres email.
            </p>

            <div className="w-full max-w-xs space-y-4">
                <Button onClick={() => window.location.href = '/'} variant="primary"
                        className="w-full py-4 rounded-xl shadow-lg !bg-green-500 shadow-green-500/20 hover:shadow-green-500/30">
                    Wróć do strony głównej
                </Button>
                <p className="text-xs text-gray-400 font-medium">
                    Automatyczne przekierowanie do panelu za <span
                    className="text-slate-800 font-bold text-base mx-1">{countdown}s</span>
                </p>
            </div>
        </div>
    );
}