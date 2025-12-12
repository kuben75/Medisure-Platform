import type {ReactNode} from "react";
import {NotificationProvider} from "./NotificationContext.tsx";
import {ConfirmationProvider} from "./ConfirmationContext.tsx";
import {AuthProvider} from "./AuthContext.tsx";
import {FavoritesProvider} from "./FavouritesContext.tsx";
import {ComparisonProvider} from "./ComparisonContext.tsx";
import {UserNotificationsProvider} from "./UserNotificationsContext.tsx";
import {ChatProvider} from "./ChatContext.tsx";

export const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <NotificationProvider>
            <ConfirmationProvider>
                <AuthProvider>
                    <FavoritesProvider>
                        <ComparisonProvider>
                            <UserNotificationsProvider>
                                <ChatProvider>
                                    {children}
                                </ChatProvider>
                            </UserNotificationsProvider>
                        </ComparisonProvider>
                    </FavoritesProvider>
                </AuthProvider>
            </ConfirmationProvider>
        </NotificationProvider>
    );
};