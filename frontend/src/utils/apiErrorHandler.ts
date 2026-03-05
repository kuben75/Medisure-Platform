import { STORAGE_KEYS } from "../constants/auth.constants.ts";
import type {IApiError, INotify} from "../types/error.types.ts";

export const displayApiError = (error: unknown, notify: INotify) => {

    const err = error as IApiError;

    if (err && (err.status === 401 || err.message?.includes("401") || error === "Unauthorized")) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        window.dispatchEvent(new Event('auth:unauthorized'));
        notify.error("Sesja wygasła. Zaloguj się ponownie.");
        return;
    }

    let displayMessage = "Wystąpił nieoczekiwany błąd.";
    let code: number | null = null;

    if (err && err.errors) {
        const validationMessages = Object.values(err.errors).flat().join('\n');
        if (validationMessages) {
            notify.error(validationMessages);
            return;
        }
    }

    if (err) {
        if (err.message || err.Message) {
            displayMessage = err.message || err.Message || displayMessage;
        }
        if (err.errorCode || err.ErrorCode) {
            code = err.errorCode || err.ErrorCode || null;
        }
    }

    if (code) {
        if (code < 2000) {
            notify.error(`${displayMessage} (Kod: ${code})`);
        } else {
            notify.error(displayMessage);
        }
    } else {
        if (error instanceof Error) {
            notify.error(error.message);
        } else if (typeof error === 'string') {
            notify.error(error);
        } else {
            notify.error(displayMessage);
        }
    }
};
