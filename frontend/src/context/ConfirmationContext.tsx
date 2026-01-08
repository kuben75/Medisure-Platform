import {type ReactNode, useRef, useState} from 'react'
import Button from '../components/ui/Button.tsx'
import type {IConfirmOptions} from "../types/notifications.types.ts"
import {ConfirmationContext as ConfirmationContext1} from "../hooks/UseConfrim.ts";

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<IConfirmOptions>({})

    const resolver = useRef<((value: boolean) => void) | null>(null)

    const confirm = (opts: IConfirmOptions): Promise<boolean> => {
        setOptions({
            title: opts.title || "Potwierdzenie",
            description: opts.description || "Czy na pewno chcesz wykonać tę operację?",
            confirmText: opts.confirmText || "Potwierdź",
            cancelText: opts.cancelText || "Anuluj",
            variant: opts.variant || 'info'
        })
        setIsOpen(true)

        return new Promise((resolve) => resolver.current = resolve)
    }

    const handleConfirm = () => {
        resolver.current?.(true)
        setIsOpen(false)
    }

    const handleCancel = () => {
        resolver.current?.(false)
        setIsOpen(false)
    }

    return (
        <ConfirmationContext1 value={{ confirm }}>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCancel}
                    />

                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10 transform scale-100 animate-scale-in border border-gray-100">

                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            options.variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {options.variant === 'danger' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {options.title}
                        </h3>

                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {options.description}
                        </p>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="!py-2 !px-4 !text-base !border-gray-300 !text-gray-700 hover:!bg-gray-50"
                            >
                                {options.cancelText}
                            </Button>

                            <Button
                                variant={options.variant === 'danger' ? 'primary' : 'primary'}
                                onClick={handleConfirm}
                                className={`!py-2 !px-6 !text-base shadow-none ${
                                    options.variant === 'danger' ? '!bg-red-600 hover:!bg-red-700 !border-red-600' : ''
                                }`}
                            >
                                {options.confirmText}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
            `}</style>
        </ConfirmationContext1>
    )
}

