import type { IPartner } from "../types/partners.types.ts"
import luxmedLogo from '../assets/luxmed.svg'
import medicoverLogo from '../assets/medicover.svg'
import enelmedLogo from '../assets/enelmed.svg'
import pzuLogo from '../assets/pzu.svg'

export const partners: IPartner[] = [
    {
        name: "Luxmed",
        src: luxmedLogo
    },
    {
        name: "Medicover",
        src: medicoverLogo
    },
    {
        name: "Enel-Med",
        src: enelmedLogo
    },
    {
        name: "PZU Zdrowie",
        src: pzuLogo
    }
]