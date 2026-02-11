import {createContext, useContext} from "react";
import type {INotificationsContext} from "../types/notifications.types.ts";

export const UserNotificationsContext = createContext<INotificationsContext>(null as any);
export const useUserNotifications = () => useContext(UserNotificationsContext);