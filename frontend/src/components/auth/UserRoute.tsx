import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from "../../hooks/useAuth.ts";

const UserRoute = () => {
    const {user, isLoading} = useAuth();

    if (isLoading) {
        return <div>Ładowanie...</div>;
    }

    if (user) {
        return <Outlet/>;
    }


    return <Navigate to="/login" replace/>;
}

export default UserRoute;