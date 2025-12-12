import type { IReviewDisplay } from "../types/review.types.ts";

export const DEFAULT_REVIEWS: IReviewDisplay[] = [
    {
        id: 1,
        userName: "Piotr",
        avatarText: "P",
        rating: 5,
        comment: "Bardzo pomocna strona przy szukaniu najlepszego pakietu medycznego. Szybko znalazłem ofertę spełniającą moje oczekiwania."

    },
    {
        id: 2,
        userName: "Anna",
        avatarText: "A",
        rating: 4,
        comment: "Dobre porównanie ofert, szybka obsługa! Proces zakupu był bardzo intuicyjny."
    },
    {
        id: 3,
        userName: "Marek",
        avatarText: "M",
        rating: 5,
        comment: "Świetne doświadczenie, polecam każdemu! W końcu mam opiekę medyczną na jaką zasługuję."
    }
];