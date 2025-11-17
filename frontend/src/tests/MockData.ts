import type { IReview, IPartner} from "../types/types.ts"

export const reviews: IReview[] = [
    {
        name: "Piotr",
        rating: 5,
        comment: "Bardzo pomocna strona przy szukaniu najlepszego pakietu medycznego. " +
            "Szybko znalazłem ofertę spełniającą moje oczekiwania.",
        img: "https://placehold.co/64x64/E4E7FE/4E61F6?text=P"
    },
    {
        name: "Anna",
        rating: 4,
        comment: "Dobre porównanie ofert, szybka obsługa!",
        img: "https://placehold.co/64x64/E4E7FE/4E61F6?text=A",
    },
    {
        name: "Marek",
        rating: 5,
        comment: "Świetne doświadczenie, polecam każdemu!",
        img: "https://placehold.co/64x64/E4E7FE/4E61F6?text=M",
    },
]

export const partners: IPartner[] = [
    {
        name: "Luxmed",
        src: "src/assets/luxmed.svg"
    },
    {
        name: "Medicover",
        src: "src/assets/medicover.svg"
    },
    {
        name: "Enel-Med",
        src: "src/assets/enelmed.svg"
    },
    {
        name: "PZU Zdrowie",
        src: "src/assets/pzu.svg"
    }
]