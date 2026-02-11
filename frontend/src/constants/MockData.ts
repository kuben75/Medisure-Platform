import type {IPartner} from "../types/partners.types.ts";
import luxmedLogo from '../assets/luxmed.svg';
import medicoverLogo from '../assets/medicover.svg';
import enelmedLogo from '../assets/enelmed.svg';
import pzuLogo from '../assets/pzu.svg';
import L from "leaflet";

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
];
export const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});