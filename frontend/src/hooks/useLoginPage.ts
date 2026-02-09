import {useNavigate} from "react-router-dom"
import {useAuth} from "./useAuth.ts"
import {useNotification} from "./UseNotification.ts"
import React, {useEffect, useState} from "react"
import {handleApiError} from "../utils/apiErrorHandler.ts"

export const useLoginPage = () => {

    const navigate = useNavigate()
    const { setAuthSession, user, roles } = useAuth()
    const { notify } = useNotification()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code2FA, setCode2FA] = useState('')

    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [authEmail, setAuthEmail] = useState('')
    const [lockedError, setLockedError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            const target = roles.includes('Admin') ? '/admin' : '/'
            navigate(target, { replace: true })
        }
    }, [user, roles, navigate])

    const handleSuccessTransition = async (targetUrl: string, onComplete: () => void) => {
        setIsSuccess(true)
        setTimeout(() => {
            onComplete()
            navigate(targetUrl)
        }, 1500)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setLockedError(null)

        try {
            const API_URL = `${import.meta.env.VITE_API_URL || "https://localhost:44333/api"}/auth/login`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()

            if (!response.ok)
                throw data

            if (data.code === "REQUIRES_2FA" || data.Code === "REQUIRES_2FA") {
                setAuthEmail(email)
                setStep(2)
                notify.info("Wprowadź kod z aplikacji uwierzytelniającej.")
                setIsLoading(false)
            }
            else {
                const roles = data.roles || data.user?.roles || []
                const target = roles.includes('Admin') ? '/admin' : '/'
                await handleSuccessTransition(target, () => {
                    setAuthSession(data.token, data.user)
                })
            }
        } catch (err: any) {
            setIsLoading(false)

            if (err.errorCode === 2003)
                setLockedError(err.message || "Konto zostało zablokowane.")
            else
                handleApiError(err, notify)
        }
    }

    const handle2FAVerification = async (e: React.FormEvent) => {
        e.preventDefault()
        if (code2FA.length !== 6) {
            notify.error("Kod musi mieć 6 cyfr.")
            return
        }
        setIsLoading(true)

        try {
            const API_URL_2FA = `${import.meta.env.VITE_API_URL}/auth/login-2fa`

            const response = await fetch(API_URL_2FA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: authEmail, code: code2FA, password: password })
            })

            const data = await response.json()

            if (!response.ok)
                throw data;


            if (data.token || data.Token) {
                const token = data.token || data.Token
                const user = data.user || data.User

                await handleSuccessTransition('/', () => {
                    setAuthSession(token, user);
                })
            } else {
                throw new Error("Niepoprawna odpowiedź serwera.")
            }

        } catch (err) {
            setIsLoading(false)
            handleApiError(err, notify)
        }
    }

    return {
        email, setEmail, password,
        setPassword, code2FA, setCode2FA,
        step, isLoading, isSuccess,
        lockedError, handleSubmit, handle2FAVerification,
        navigate, authEmail, setStep
    }
}