export const handleApiError = (error: any, notify: any) => {
    console.error("API Error Debug:", error)

    let displayMessage = "Wystąpił nieoczekiwany błąd."
    let code = null

    if (error && error.errors) {
        const validationMessages = Object.values(error.errors).flat().join('\n')

        if (validationMessages) {
            notify.error(validationMessages)
            return
        }
    }

    if (error) {
        if (error.message || error.Message)
            displayMessage = error.message || error.Message;

        if (error.errorCode || error.ErrorCode)
            code = error.errorCode || error.ErrorCode;

    }

    if (code) {
        if (code < 2000)
            notify.error(`${displayMessage} (Kod: ${code})`)
         else
            notify.error(displayMessage)

    } else {
         if (error instanceof Error)
            notify.error(error.message)

         else if (typeof error === 'string')
            notify.error(error)

         else
            notify.error(displayMessage)

    }
}