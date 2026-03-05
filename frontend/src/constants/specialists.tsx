import type {ISpecialist} from "../types/specialists.types.ts";
import StethoscopeIcon from "../components/icons/StethoscopeIcon.tsx";
import PillIcon from "../components/icons/PillIcon.tsx";
import FilePlusIcon from "../components/icons/FilePlusIcon.tsx";
import UsersIcon from "../components/icons/UsersIcon.tsx";
import ClockIcon from "../components/icons/ClockIcon.tsx";
import ShieldIcon from "../components/icons/ShieldIcon.tsx";

const getDocImg
    = (gender: 'male' | 'female', id: number) =>
    `https://randomuser.me/api/portraits/${gender === 'male' 
        ? 'men' 
        : 'women'}/${id}.jpg`;

const PKG = {
    BASIC: "Pakiet Podstawowy",
    BASIC_PLUS: "Pakiet Podstawowy Plus",
    COMFORT: "Pakiet Komfort",
    PRESTIGE: "Pakiet Prestige",

    FAMILY_2_1: "Rodzina 2+1 Start",
    FAMILY_2_2: "Rodzina 2+2 Standard",
    FAMILY_PREMIUM: "Pakiet Rodzinny Premium",
    FAMILY_2_3: "Rodzina 2+3 Premium",

    BUSINESS: "Pakiet Biznes Standard",

    SENIOR: "Senior",
    SENIOR_PLUS: "Pakiet Senior Plus"
};


const ALL_PACKAGES = Object.values(PKG);

const PLUS_AND_UP = [
    PKG.BASIC_PLUS, PKG.COMFORT, PKG.PRESTIGE,
    PKG.FAMILY_2_1, PKG.FAMILY_2_2, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3,
    PKG.BUSINESS, PKG.SENIOR, PKG.SENIOR_PLUS
];

const STANDARD_AND_UP = [
    PKG.COMFORT, PKG.PRESTIGE,
    PKG.FAMILY_2_2, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3,
    PKG.BUSINESS, PKG.SENIOR, PKG.SENIOR_PLUS
];

const PREMIUM_ONLY = [
    PKG.PRESTIGE, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3
];

const DENTAL_PACKAGES = [
    PKG.COMFORT, PKG.PRESTIGE,
    PKG.FAMILY_2_2, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3
];

const SENIOR_ONLY = [
    PKG.SENIOR, PKG.SENIOR_PLUS, PKG.PRESTIGE
];

const FAMILY_FOCUS = [
    PKG.BASIC, PKG.BASIC_PLUS, PKG.COMFORT, PKG.PRESTIGE,
    PKG.FAMILY_2_1, PKG.FAMILY_2_2, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3
];

const CHILD_DEVELOPMENT = [
    PKG.FAMILY_2_1, PKG.FAMILY_2_2, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3,
    PKG.PRESTIGE
];

const MENTAL_HEALTH = [
    PKG.COMFORT, PKG.PRESTIGE, PKG.BUSINESS,
    PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3, PKG.SENIOR_PLUS
];


export const SPECIALISTS_LIST: ISpecialist[] = [
    {
        id: 1,
        name: "Janusz Kowalski",
        title: "dr n. med.",
        category: "Internista",
        experienceYears: 25,
        gender: 'male',
        imageUrl: getDocImg('male', 10),
        description: "Specjalista chorób wewnętrznych z wieloletnim doświadczeniem klinicznym. Skupia się na profilaktyce chorób cywilizacyjnych.",
        availableInPackages: ALL_PACKAGES
    },
    {
        id: 2,
        name: "Maria Wiśniewska",
        title: "lek. med.",
        category: "Pediatria",
        experienceYears: 12,
        gender: 'female',
        imageUrl: getDocImg('female', 14),
        description: "Empatyczna pediatra uwielbiana przez małych pacjentów. Specjalizuje się w rozwoju niemowląt i szczepieniach ochronnych.",
        availableInPackages: FAMILY_FOCUS
    },
    {
        id: 3,
        name: "Piotr Zieliński",
        title: "prof. dr hab.",
        category: "Kardiologia",
        experienceYears: 35,
        gender: 'male',
        imageUrl: getDocImg('male', 33),
        description: "Wybitny specjalista kardiologii. Prowadzi pacjentów z nadciśnieniem, chorobą wieńcową i zaburzeniami rytmu.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 4,
        name: "Ewa Nowak",
        title: "dr n. med.",
        category: "Ginekologia",
        experienceYears: 18,
        gender: 'female',
        imageUrl: getDocImg('female', 45),
        description: "Ginekolog-położnik. Prowadzenie ciąży, profilaktyka onkologiczna (cytologia) oraz leczenie zaburzeń hormonalnych.",
        availableInPackages: PLUS_AND_UP
    },
    {
        id: 5,
        name: "Tomasz Lewandowski",
        title: "lek. med.",
        category: "Ortopedia",
        experienceYears: 9,
        gender: 'male',
        imageUrl: getDocImg('male', 51),
        description: "Specjalizuje się w urazach sportowych, bólach kręgosłupa i artroskopii stawów.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 6,
        name: "Agnieszka Wójcik",
        title: "dr n. med.",
        category: "Dermatologia",
        experienceYears: 15,
        gender: 'female',
        imageUrl: getDocImg('female', 60),
        description: "Ekspertka w leczeniu trądziku, atopowego zapalenia skóry oraz ocenie znamion barwnikowych.",
        availableInPackages: PLUS_AND_UP
    },
    {
        id: 7,
        name: "Marek Kamiński",
        title: "lek. med.",
        category: "Okulistyka",
        experienceYears: 20,
        gender: 'male',
        imageUrl: getDocImg('male', 12),
        description: "Zajmuje się korekcją wad wzroku, doborem szkieł oraz diagnostyką jaskry i zaćmy.",
        availableInPackages: PLUS_AND_UP
    },
    {
        id: 8,
        name: "Barbara Kaczmarek",
        title: "dr n. med.",
        category: "Endokrynologia",
        experienceYears: 22,
        gender: 'female',
        imageUrl: getDocImg('female', 11),
        description: "Leczenie chorób tarczycy (Hashimoto), insulinooporności oraz zaburzeń hormonalnych.",
        availableInPackages: PLUS_AND_UP
    },
    {
        id: 9,
        name: "Krzysztof Dąbrowski",
        title: "lek. stom.",
        category: "Stomatologia",
        experienceYears: 14,
        gender: 'male',
        imageUrl: getDocImg('male', 85),
        description: "Stomatolog zachowawczy. Oferuje przeglądy, skaling, piaskowanie oraz leczenie ubytków.",
        availableInPackages: DENTAL_PACKAGES
    },
    {
        id: 10,
        name: "Jolanta Szymańska",
        title: "mgr",
        category: "Rehabilitacja",
        experienceYears: 10,
        gender: 'female',
        imageUrl: getDocImg('female', 32),
        description: "Fizjoterapeutka. Rehabilitacja kręgosłupa, wad postawy oraz powrót do sprawności po urazach.",
        availableInPackages: [...STANDARD_AND_UP, PKG.BASIC_PLUS]
    },
    {
        id: 11,
        name: "Robert Mazur",
        title: "dr n. med.",
        category: "Neurologia",
        experienceYears: 28,
        gender: 'male',
        imageUrl: getDocImg('male', 41),
        description: "Leczenie bólów głowy, migreny, rwy kulszowej oraz schorzeń układu nerwowego.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 12,
        name: "Monika Krawczyk",
        title: "lek. med.",
        category: "Psychiatria",
        experienceYears: 16,
        gender: 'female',
        imageUrl: getDocImg('female', 65),
        description: "Leczenie farmakologiczne depresji, zaburzeń lękowych i bezsenności.",
        availableInPackages: [PKG.PRESTIGE, PKG.FAMILY_PREMIUM, PKG.FAMILY_2_3, PKG.BUSINESS]
    },
    {
        id: 13,
        name: "Andrzej Wróbel",
        title: "dr n. med.",
        category: "Chirurgia",
        experienceYears: 30,
        gender: 'male',
        imageUrl: getDocImg('male', 55),
        description: "Specjalista chirurgii ogólnej i naczyniowej. Konsultacje w zakresie żylaków i zmian skórnych.",
        availableInPackages: [...PREMIUM_ONLY, PKG.SENIOR, PKG.SENIOR_PLUS, PKG.BUSINESS]
    },
    {
        id: 14,
        name: "Paweł Jankowski",
        title: "lek. med.",
        category: "Urologia",
        experienceYears: 11,
        gender: 'male',
        imageUrl: getDocImg('male', 28),
        description: "Konsultacje urologiczne dla mężczyzn. Diagnostyka ultrasonograficzna prostaty i nerek.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 15,
        name: "Hanna Mazur",
        title: "dr n. med.",
        category: "Gastrologia",
        experienceYears: 19,
        gender: 'female',
        imageUrl: getDocImg('female', 42),
        description: "Leczenie chorób żołądka i jelit. Diagnostyka refluksu, wrzodów i IBS.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 16,
        name: "Kamil Stępień",
        title: "lek. med.",
        category: "Pulmonologia",
        experienceYears: 13,
        gender: 'male',
        imageUrl: getDocImg('male', 19),
        description: "Leczenie astmy, POChP i kaszlu przewlekłego. Spirometria i diagnostyka alergii wziewnych.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 17,
        name: "Beata Pawlak",
        title: "dr n. med.",
        category: "Reumatologia",
        experienceYears: 24,
        gender: 'female',
        imageUrl: getDocImg('female', 68),
        description: "Leczenie RZS, dny moczanowej i osteoporozy. Terapia bólów stawowych u seniorów.",
        availableInPackages: [...SENIOR_ONLY, PKG.COMFORT, PKG.PRESTIGE]
    },
    {
        id: 18,
        name: "Michał Sikora",
        title: "lek. med.",
        category: "Alergologia",
        experienceYears: 8,
        gender: 'male',
        imageUrl: getDocImg('male', 61),
        description: "Odczulanie i testy alergiczne. Leczenie kataru siennego i alergii pokarmowych.",
        availableInPackages: [...FAMILY_FOCUS, PKG.COMFORT, PKG.PRESTIGE]
    },
    {
        id: 19,
        name: "Alicja Walczak",
        title: "prof. dr hab.",
        category: "Onkologia",
        experienceYears: 40,
        gender: 'female',
        imageUrl: getDocImg('female', 77),
        description: "Onkologia kliniczna. Profilaktyka nowotworowa, konsultacje drugiej opinii, prowadzenie leczenia.",
        availableInPackages: [PKG.PRESTIGE, PKG.SENIOR_PLUS, PKG.BUSINESS]
    },
    {
        id: 20,
        name: "Grzegorz Baran",
        title: "dr n. med.",
        category: "Diabetologia",
        experienceYears: 17,
        gender: 'male',
        imageUrl: getDocImg('male', 72),
        description: "Nowoczesne leczenie cukrzycy, pompy insulinowe, leczenie otyłości i insulinooporności.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 21,
        name: "Sylwia Mróz",
        title: "lek. med.",
        category: "Hematologia",
        experienceYears: 9,
        gender: 'female',
        imageUrl: getDocImg('female', 19),
        description: "Diagnostyka niedokrwistości i zaburzeń krzepnięcia. Interpretacja wyników morfologii.",
        availableInPackages: PREMIUM_ONLY
    },
    {
        id: 22,
        name: "Dariusz Lis",
        title: "dr n. med.",
        category: "Nefrologia",
        experienceYears: 21,
        gender: 'male',
        imageUrl: getDocImg('male', 47),
        description: "Leczenie niewydolności nerek, infekcji układu moczowego i kamicy nerkowej.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 23,
        name: "Elżbieta Kwiatkowska",
        title: "lek. med.",
        category: "Geriatria",
        experienceYears: 26,
        gender: 'female',
        imageUrl: getDocImg('female', 88),
        description: "Całościowa opieka nad seniorem. Leczenie wielochorobowości i zaburzeń pamięci.",
        availableInPackages: SENIOR_ONLY
    },
    {
        id: 24,
        name: "Wojciech Chmiel",
        title: "dr n. med.",
        category: "Choroby zakaźne",
        experienceYears: 15,
        gender: 'male',
        imageUrl: getDocImg('male', 30),
        description: "Leczenie boreliozy, chorób wątroby oraz medycyna podróży (szczepienia).",
        availableInPackages: [PKG.COMFORT, PKG.PRESTIGE, PKG.BUSINESS, PKG.FAMILY_PREMIUM]
    },
    {
        id: 25,
        name: "Kinga Andrzejewska",
        title: "lek. med.",
        category: "Diagnostyka",
        experienceYears: 7,
        gender: 'female',
        imageUrl: getDocImg('female', 15),
        description: "Radiolog. Opis badań USG, RTG, TK. Wykonywanie USG Doppler żył i tętnic.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 26,
        name: "Rafał Sobczak",
        title: "lek. med.",
        category: "Anestezjologia",
        experienceYears: 12,
        gender: 'male',
        imageUrl: getDocImg('male', 82),
        description: "Poradnia leczenia bólu przewlekłego. Przygotowanie do zabiegów operacyjnych.",
        availableInPackages: PREMIUM_ONLY
    },
    {
        id: 27,
        name: "Łukasz Piotrowski",
        title: "dr n. med.",
        category: "Medycyna sportowa",
        experienceYears: 10,
        gender: 'male',
        imageUrl: getDocImg('male', 39),
        description: "Orzecznictwo dla sportowców, badania wydolnościowe, leczenie kontuzji.",
        availableInPackages: [PKG.COMFORT, PKG.PRESTIGE, PKG.FAMILY_2_2, PKG.FAMILY_2_3]
    },
    {
        id: 28,
        name: "Natalia Krupa",
        title: "lek. med.",
        category: "Laryngologia",
        experienceYears: 8,
        gender: 'female',
        imageUrl: getDocImg('female', 50),
        description: "Leczenie chorób ucha, nosa i gardła. Endoskopia laryngologiczna, leczenie chrapania.",
        availableInPackages: PLUS_AND_UP
    },
    {
        id: 29,
        name: "Marian Zając",
        title: "prof. dr hab.",
        category: "Neurochirurgia",
        experienceYears: 38,
        gender: 'male',
        imageUrl: getDocImg('male', 91),
        description: "Konsultacje w zakresie dyskopatii kręgosłupa i guzów ośrodkowego układu nerwowego.",
        availableInPackages: [PKG.PRESTIGE, PKG.BUSINESS]
    },
    {
        id: 30,
        name: "Anna Włodarczyk",
        title: "mgr",
        category: "Dietetyka",
        experienceYears: 6,
        gender: 'female',
        imageUrl: getDocImg('female', 29),
        description: "Dietetyka kliniczna. Żywienie w cukrzycy, chorobach tarczycy i redukcja masy ciała.",
        availableInPackages: STANDARD_AND_UP
    },
    {
        id: 31,
        name: "Karolina Wilk",
        title: "mgr",
        category: "Psychologia",
        experienceYears: 8,
        gender: 'female',
        imageUrl: getDocImg('female', 90),
        description: "Psycholog kliniczny. Pomoc w sytuacjach kryzysowych, terapia stresu i wypalenia zawodowego.",
        availableInPackages: MENTAL_HEALTH
    },
    {
        id: 32,
        name: "Magdalena Kot",
        title: "mgr",
        category: "Logopedia",
        experienceYears: 11,
        gender: 'female',
        imageUrl: getDocImg('female', 94),
        description: "Neurologopeda. Terapia wad wymowy u dzieci, wczesna interwencja logopedyczna.",
        availableInPackages: CHILD_DEVELOPMENT
    },
];

export const PROMO_SPECIALISTS = [
    {label: 'Kardiolog', searchTerm: 'Kardiologia'},
    {label: 'Dermatolog', searchTerm: 'Dermatologia'},
    {label: 'Pediatra', searchTerm: 'Pediatria'},
    {label: 'Ortopeda', searchTerm: 'Ortopedia'}
];
export const whyUsItems = [
    {
        icon: <StethoscopeIcon/>,
        title: "Pewność i ochrona zdrowia",
        desc: "Prezentujemy oferty tylko od sprawdzonych dostawców usług medycznych."
    },
    {
        icon: <PillIcon/>,
        title: "Nowoczesne leczenie",
        desc: "Możliwość wyboru pakietów obejmujących telemedycynę i szybki kontakt z lekarzem bez wychodzenia z domu."
    },
    {
        icon: <FilePlusIcon/>,
        title: "Elastyczna oferta",
        desc: "Elastyczne subskrypcje bez długoterminowych zobowiązań. Możesz zrezygnować w dowolnym momencie."
    },
    {
        icon: <UsersIcon/>,
        title: "Zaufanie klientów",
        desc: "Podejmuj decyzje w oparciu o opinie i oceny innych użytkowników naszej platformy."
    },
    {
        icon: <ClockIcon/>,
        title: "Całodobowe wsparcie",
        desc: "Infolinia medyczna dostępna 24/7. Pomoc zawsze wtedy, gdy jej potrzebujesz."
    },
    {
        icon: <ShieldIcon className="w-6 h-6"/>,
        title: "Bezpieczeństwo danych",
        desc: "Twoje konto jest chronione nowoczesnymi metodami autoryzacji (2FA) i szyfrowaniem danych."
    }
];
export const CATEGORY_GROUPS: Record<string, string[]> = {
    "Podstawowa i Rodzinna": ["Podstawowa", "Pediatria", "Geriatria", "Medycyna rodzinna"],
    "Specjaliści do chorób wewnętrznych": [
        "Kardiologia", "Endokrynologia", "Diabetologia", "Gastrologia", "Nefrologia",
        "Pulmonologia", "Reumatologia", "Neurologia", "Alergologia", "Hematologia",
        "Onkologia", "Choroby zakaźne", "Choroby wewnętrzne"
    ],
    "Chirurgia i Zabiegi": [
        "Chirurgia", "Ortopedia", "Urologia", "Neurochirurgia", "Laryngologia",
        "Okulistyka", "Ginekologia", "Anestezjologia"
    ],
    "Zdrowie Psychiczne": ["Psychologia", "Psychiatria"],
    "Rozwój Dziecka": ["Pediatria", "Logopedia"],
    "Inne": [
        "Stomatologia", "Dermatologia", "Dietetyka", "Rehabilitacja",
        "Diagnostyka", "Medycyna sportowa"
    ]
};
export const CATEGORY_BUTTONS = ["Wszystkie", ...Object.keys(CATEGORY_GROUPS)];