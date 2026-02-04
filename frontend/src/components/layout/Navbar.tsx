import { useNavbar } from "../../hooks/useNavbar.ts";
import NavbarHeader from "./NavbarHeader";
import NavbarDrawers from "./NavbarDrawers";

export default function Navbar() {
    const navbarLogic = useNavbar()

    return (
        <>
            <NavbarHeader
                {...navbarLogic}
            />

            <NavbarDrawers
                {...navbarLogic}
            />
        </>
    )
}