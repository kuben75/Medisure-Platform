using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbInitializer
{
    public static async Task Seed(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        
        try
        {
            var dbContext = services.GetRequiredService<ApplicationDbContext>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            int retries = 5;
            while (retries > 0)
            {
                if (await dbContext.Database.CanConnectAsync()) break;
                Console.WriteLine("Oczekiwanie na bazę danych...");
                await Task.Delay(2000);
                retries--;
            }
            await dbContext.Database.MigrateAsync();

            if (!await dbContext.Packages.AnyAsync())
            {
                var mockPackages = GetPackages(); 
                await dbContext.Packages.AddRangeAsync(mockPackages);
                await dbContext.SaveChangesAsync();
            }

            if (!await dbContext.Roles.AnyAsync())
            {
                var roles = new List<IdentityRole>
                {
                    new IdentityRole { Name = "SuperAdmin" },
                    new IdentityRole { Name = "Admin" },
                    new IdentityRole { Name = "User" }
                };
                foreach (var role in roles) await roleManager.CreateAsync(role);
            }


            var adminEmail = configuration["SuperAdmin:Email"] ?? "root@medisure.pl";
            var adminPassword = configuration["SuperAdmin:Password"] ?? "SuperSecretPassword1!";
            var adminFirstName = configuration["SuperAdmin:FirstName"] ?? "System";
            var adminLastName = configuration["SuperAdmin:LastName"] ?? "Root";

            var rootUser = await userManager.FindByEmailAsync(adminEmail);

            if (rootUser == null)
            {
                var superUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = adminFirstName,
                    LastName = adminLastName,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(superUser, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRolesAsync(superUser, new[] { "SuperAdmin", "Admin", "User" });
                    Console.WriteLine($"--> SuperAdmin utworzony: {adminEmail}");
                }
                else
                {
                    Console.WriteLine($"--> Błąd tworzenia SuperAdmina: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                if (!await userManager.IsInRoleAsync(rootUser, "SuperAdmin"))
                {
                    await userManager.AddToRoleAsync(rootUser, "SuperAdmin");
                    Console.WriteLine("--> Rola SuperAdmin dodana do istniejącego konta.");
                }
            }

            var usersToCreate = GetUsersToCreate(); 
            foreach (var u in usersToCreate)
            {
                if (await userManager.FindByEmailAsync(u.Email) == null)
                {
                    var newUser = new ApplicationUser
                    {
                        UserName = u.Email, Email = u.Email, FirstName = u.First, LastName = u.Last,
                        EmailConfirmed = true
                    };
                    var res = await userManager.CreateAsync(newUser, "Admin123!"); 
                    if (res.Succeeded) await userManager.AddToRoleAsync(newUser, u.Role);
                }
            }

            if (!await dbContext.Reviews.AnyAsync())
            {
                await SeedReviews(dbContext); 
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Wystąpił błąd podczas inicjalizacji bazy danych: {ex.Message}");
        }
    }


    private static List<Package> GetPackages()
    {
        return new List<Package>
        {
             new Package
                    {
                        Name = "Pakiet Podstawowy",
                        Category = "Indywidualny",
                        PriceValue = 69.00m, Price = "69 zł",
                        Description = "Niezbędna opieka medyczna na start.",
                        Features = "Nielimitowane konsultacje u lekarza internisty oraz pediatry.;Dostęp do alergologa w ramach opieki podstawowej.;Podstawowe badania krwi i moczu bez opłat.;Gwarantowane terminy wizyt w ciągu 24h.;Portal pacjenta: e-recepty i wyniki badań online.",
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 3,
                        FacilitiesCount = 200, IsFeatured = false,
                        IncludedSpecializations = "Internista;Pediatria;Alergologia"
                    },
                    new Package
                    {
                        Name = "Pakiet Podstawowy Plus",
                        Category = "Indywidualny",
                        PriceValue = 99.00m, Price = "99 zł",
                        Description = "Rozszerzona diagnostyka i specjaliści pierwszego kontaktu.",
                        Features = "Dostęp do Ginekologa, Dermatologa, Okulisty i Laryngologa.;Rozszerzone badania laboratoryjne (w tym hormony tarczycy).;Konsultacje internistyczne bez limitów.;Bezpłatne szczepienie przeciw grypie raz w roku.;Dostęp do fizjoterapeuty i rehabilitacji.",
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 9,
                        FacilitiesCount = 250, IsFeatured = false,
                        IncludedSpecializations = "Internista;Pediatria;Alergologia;Ginekologia;Dermatologia;Okulistyka;Endokrynologia;Rehabilitacja;Laryngologia"
                    },
                    new Package
                    {
                        Name = "Pakiet Komfort",
                        Category = "Indywidualny",
                        PriceValue = 169.00m, Price = "169 zł",
                        Description = "Szeroki dostęp do specjalistów, rehabilitacja i stomatologia.",
                        Features = "Dostęp do ponad 20 specjalistów bez skierowań.;Stomatologia: Przegląd, skaling i piaskowanie raz w roku.;Nielimitowane badania USG i RTG.;Pakiet 5 zabiegów rehabilitacyjnych.;Wsparcie psychologa i lekarza chorób zakaźnych.",
                        HasDentalCare = true, HasHospitalization = false, HasRehabilitation = true,
                        SpecialistsCount = 24,
                        FacilitiesCount = 800, IsFeatured = true,
                        IncludedSpecializations = "Internista;Pediatria;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Stomatologia;Rehabilitacja;Neurologia;Urologia;Gastrologia;Pulmonologia;Alergologia;Diabetologia;Nefrologia;Choroby zakaźne;Diagnostyka;Medycyna sportowa;Laryngologia;Dietetyka;Psychologia;Reumatologia"
                    },
                    new Package
                    {
                        Name = "Pakiet Prestige",
                        Category = "Indywidualny",
                        PriceValue = 450.00m, Price = "450 zł",
                        Description = "Opieka VIP: wszyscy specjaliści, wizyty domowe i pełna stomatologia.",
                        Features = "Pełny dostęp do wszystkich 32 specjalistów.;Stomatologia zachowawcza (leczenie) bez limitów kosztów.;Wizyty domowe lekarza i pielęgniarki.;Prowadzenie ciąży i szkoła rodzenia w cenie.;Indywidualny opiekun medyczny.",
                        HasDentalCare = true, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 32,
                        FacilitiesCount = 1500, IsFeatured = true,
                        IncludedSpecializations = "Internista;Pediatria;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Stomatologia;Rehabilitacja;Neurologia;Psychiatria;Chirurgia;Urologia;Gastrologia;Pulmonologia;Reumatologia;Alergologia;Onkologia;Diabetologia;Hematologia;Nefrologia;Geriatria;Choroby zakaźne;Diagnostyka;Anestezjologia;Medycyna sportowa;Laryngologia;Neurochirurgia;Dietetyka;Psychologia;Logopedia"
                    },
                    new Package
                    {
                        Name = "Rodzina 2+1 Start", Category = "Rodzinny", PriceValue = 219.00m, Price = "219 zł",
                        Description = "Ochrona zdrowia dla rodziców i dziecka.",
                        Features = "Pediatra i Internista dla całej rodziny.;Dostęp do Ginekologa i Dermatologa.;Bilans zdrowia dziecka i szczepienia obowiązkowe.;Pomoc doraźna 24/7 (Hotline).;Wsparcie logopedyczne (konsultacja wstępna).",
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 9,
                        FacilitiesCount = 400, IsFeatured = false,
                        IncludedSpecializations = "Internista;Pediatria;Ginekologia;Dermatologia;Okulistyka;Endokrynologia;Alergologia;Laryngologia;Logopedia"
                        
                    },
                    new Package
                    {
                        Name = "Rodzina 2+2 Standard", Category = "Rodzinny", PriceValue = 380.00m,
                        Price = "380 zł",
                        Description = "Optymalny pakiet dla rodziny z dostępem do stomatologa.",
                        Features = "Dostęp do większości specjalistów dziecięcych i dorosłych.;Stomatologia: przeglądy i higienizacja dla całej rodziny.;Wizyty domowe (2 w roku) w nagłych zachorowaniach.;Wsparcie logopedy i medycyny sportowej dla dzieci.;Opieka stomatologiczna w nagłych bólach.",
                        HasDentalCare = true, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 22,
                        FacilitiesCount = 600, IsFeatured = true,
                        IncludedSpecializations = "Internista;Pediatria;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Stomatologia;Rehabilitacja;Neurologia;Urologia;Gastrologia;Pulmonologia;Alergologia;Diabetologia;Nefrologia;Diagnostyka;Medycyna sportowa;Laryngologia;Dietetyka;Logopedia"
                        
                    },
                    new Package
                    {
                        Name = "Pakiet Rodzinny Premium",
                        Category = "Rodzinny",
                        PriceValue = 550.00m, Price = "550 zł",
                        Description = "Pełne bezpieczeństwo i komfort dla wymagających rodzin.",
                        Features = "Szeroki zakres specjalistów bez skierowań dla każdego.;Pełna profilaktyka stomatologiczna i leczenie próchnicy.;Psycholog dziecięcy i logopeda (cykl 5 spotkań).;Szczepienia dodatkowe (np. meningokoki, grypa) w cenie.;Dostęp do psychiatry i lekarza chorób zakaźnych.",
                        HasDentalCare = true, HasHospitalization = false, HasRehabilitation = true,
                        SpecialistsCount = 28,
                        FacilitiesCount = 700, IsFeatured = true,
                        IncludedSpecializations = "Internista;Pediatria;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Stomatologia;Rehabilitacja;Neurologia;Psychiatria;Chirurgia;Urologia;Gastrologia;Pulmonologia;Alergologia;Diabetologia;Hematologia;Nefrologia;Choroby zakaźne;Diagnostyka;Anestezjologia;Medycyna sportowa;Laryngologia;Dietetyka;Psychologia;Logopedia"
                        
                    },
                    new Package
                    {
                        Name = "Rodzina 2+3 Premium", Category = "Rodzinny", PriceValue = 690.00m, Price = "690 zł",
                        Description = "Maksymalna ochrona dla rodzin wielodzietnych.",
                        Features = "Wszystkie korzyści pakietu Premium dla 5 osób.;Nielimitowana rehabilitacja wad postawy u dzieci.;Wizyty domowe bez limitów.;Stomatologia zachowawcza dla wszystkich członków rodziny.;Transport medyczny w razie wypadku.",
                        HasDentalCare = true, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 32,
                        FacilitiesCount = 1200, IsFeatured = true,
                        IncludedSpecializations = "Internista;Pediatria;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Stomatologia;Rehabilitacja;Neurologia;Psychiatria;Chirurgia;Urologia;Gastrologia;Pulmonologia;Alergologia;Diabetologia;Hematologia;Nefrologia;Diagnostyka;Anestezjologia;Medycyna sportowa;Laryngologia;Dietetyka;Psychologia;Logopedia;Choroby zakaźne; Geriatria; Onkologia; Neurochirurgia;Reumatologia"
                    },
                    new Package
                    {
                        Name = "Senior",
                        Category = "Senior",
                        PriceValue = 210.00m, Price = "210 zł",
                        Description = "Dedykowana opieka geriatryczna i kardiologiczna.",
                        Features = "Nielimitowany dostęp do Geriatry, Kardiologa i Reumatologa.;Badania EKG spoczynkowe bez limitu.;Pakiet 10 zabiegów rehabilitacyjnych.;Pomoc w organizacji leków i transportu.;Brak ankiety medycznej przy przystąpieniu.",
                        HasDentalCare = false, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 20,
                        FacilitiesCount = 600, IsFeatured = false,
                        IncludedSpecializations = "Internista;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Rehabilitacja;Neurologia;Chirurgia;Urologia;Gastrologia;Pulmonologia;Reumatologia;Diabetologia;Nefrologia;Geriatria;Diagnostyka;Laryngologia;Dietetyka"
                    },
                    new Package
                    {
                        Name = "Pakiet Senior Plus",
                        Category = "Senior",
                        PriceValue = 290.00m, Price = "290 zł",
                        Description = "Rozszerzona opieka dla seniora z wizytami domowymi.",
                        Features = "Wizyty domowe lekarza i pielęgniarki.;Rozszerzona diagnostyka (Tomografia, Rezonans).;Opieka psychologa i onkologa.;Konsultacje dietetyczne i diabetologiczne.;Pełny zakres rehabilitacji usprawniającej.",
                        HasDentalCare = false, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 23,
                        FacilitiesCount = 700, IsFeatured = false,
                        IncludedSpecializations = "Internista;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Rehabilitacja;Neurologia;Chirurgia;Urologia;Gastrologia;Pulmonologia;Reumatologia;Onkologia;Diabetologia;Nefrologia;Geriatria;Diagnostyka;Laryngologia;Dietetyka;Psychologia"
                    },
                    new Package
                    {
                        Name = "Pakiet Biznes Standard",
                        Category = "Biznesowy",
                        PriceValue = 350.00m, Price = "350 zł",
                        Description = "Zdrowie pracowników to zysk firmy. Kompleksowa opieka.",
                        Features = "Szybka ścieżka Medycyny Pracy (1 dzień).;Dostęp do specjalistów i badań w całej Polsce.;Wsparcie psychologiczne dla pracowników (stres, wypalenie).;Programy profilaktyczne (Kręgosłup, Serce).;Dedykowany opiekun klienta biznesowego.",
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 23,
                        FacilitiesCount = 1500, IsFeatured = false,
                        IncludedSpecializations = "Internista;Kardiologia;Ginekologia;Ortopedia;Dermatologia;Okulistyka;Endokrynologia;Rehabilitacja;Neurologia;Psychiatria;Chirurgia;Urologia;Gastrologia;Pulmonologia;Onkologia;Diabetologia;Nefrologia;Choroby zakaźne;Diagnostyka;Laryngologia;Neurochirurgia;Dietetyka;Psychologia"
                    }
        };
    }

    private static List<(string Email, string First, string Last, string Role)> GetUsersToCreate()
    {
        return new List<(string Email, string First, string Last, string Role)>
        {
            ("admin@admin.com", "Admin", "Główny", "Admin"),
            ("admin@admin1.com", "Admin", "Główny", "Admin"),
            ("admin@admin2.com", "Admin", "Główny", "Admin"),
            ("admin@admin3.com", "Admin", "Główny", "Admin"),
            ("jan.kowalski@test.pl", "Jan", "Kowalski", "User"),
             ("anna.nowak@test.pl", "Anna", "Nowak", "User"),
                ("piotr.wisniewski@test.pl", "Piotr", "Wiśniewski", "User"),
                ("maria.wojcik@test.pl", "Maria", "Wójcik", "User"),
                ("adam.nowak@test.com", "Adam", "Nowak", "User"),

                ("katarzyna.kaminska@test.com", "Katarzyna", "Kamińska", "User"),
                ("krzysztof.lewandowski@test.pl", "Krzysztof", "Lewandowski", "User"),
                ("malgorzata.zielinska@test.org", "Małgorzata", "Zielińska", "User"),
                ("michal.szymanski@test.com", "Michał", "Szymański", "User"),
                ("ewa.wozniak@test.pl", "Ewa", "Woźniak", "User"),

                ("andrzej.dabrowski@test.net", "Andrzej", "Dąbrowski", "User"),
                ("magdalena.kozlowska@test.pl", "Magdalena", "Kozłowska", "User"),
                ("tomasz.jankowski@test.com", "Tomasz", "Jankowski", "User"),
                ("barbara.mazur@test.org", "Barbara", "Mazur", "User"),
                ("pawel.krawczyk@test.pl", "Paweł", "Krawczyk", "User"),

                ("agnieszka.piotrowska@test.net", "Agnieszka", "Piotrowska", "User"),
                ("marcin.zalewski@test.com", "Marcin", "Zalewski", "User"),
                ("elzbieta.szczepanska@test.pl", "Elżbieta", "Szczepańska", "User"),
                ("jakub.gorski@test.org", "Jakub", "Górski", "User"),
                ("joanna.witkowska@test.com", "Joanna", "Witkowska", "User"),

                ("aleksander.rutkowski@test.pl", "Aleksander", "Rutkowski", "User"),
                ("monika.kwiatkowska@test.net", "Monika", "Kwiatkowska", "User"),
                ("lukasz.stasiak@test.com", "Łukasz", "Stasiak", "User"),
                ("natalia.adamek@test.pl", "Natalia", "Adamek", "User"),
                ("rafal.borowiec@test.org", "Rafał", "Borowiec", "User")
        };
    }

    private static async Task SeedReviews(ApplicationDbContext dbContext)
    {
        var packages = await dbContext.Packages.ToListAsync();
        var users = await dbContext.Users.Where(u => !u.Email.StartsWith("admin@")).ToListAsync();
        if (!users.Any()) return;

        var random = new Random();
        var reviews = new List<Review>();

        string[] commentsHigh =
                {
                    "Świetna oferta!", "Bardzo szybkie terminy.", "Polecam każdemu.", "Profesjonalna obsługa.",
                    "Wszystko w porządku.", "Jestem zadowolony z wyboru.",
                    "Dobra jakość usług.", "Bardzo konkurencyjna cena.", "Elastyczne podejście do pacjenta.",
                    "Kompleksowa opieka.", "Dostęp do wielu specjalistów.",

                    "Absolutnie bezkonkurencyjni!", "5/5, bez wahania!", "Pełen profesjonalizm od A do Z.",
                    "Usługa na najwyższym poziomie.", "Zero zastrzeżeń, same plusy.",
                    "Warto było, różnica w dostępie do lekarzy jest kolosalna.",
                    "Szybko, sprawnie i co najważniejsze — skutecznie w realizacji usług.",
                    "Błyskawiczna rezerwacja wizyty przez aplikację.",
                    "Personel jest niezwykle pomocny przy wyborze pakietu.",
                    "Doskonały stosunek ceny do jakości świadczonych usług.",
                    "Bardzo przejrzysty system pakietów i warunków.",
                    "Zaoszczędzono mi mnóstwo czasu na poszukiwaniach.",
                    "Intuicyjna strona internetowa i łatwość obsługi.", "Szeroki wybór placówek w mojej okolicy.",
                    "Lepszej opcji zarządzania opieką zdrowotną nie znaleziono.",

                    "Uzyskano szybką wizytę u kardiologa, co jest kluczowe, a platforma działa bezproblemowo i intuicyjnie.",
                    "Polecano to miejsce jako świetnego pośrednika, który zapewnia dostęp do wielu sieci medycznych w jednym miejscu.",
                    "W końcu można było wybrać pakiet idealnie dopasowany do potrzeb i budżetu, bez konieczności przeglądania setek stron.",
                    "Dostęp do lekarzy specjalistów jest błyskawiczny i zawsze udaje się znaleźć placówkę blisko miejsca zamieszkania.",
                    "Platforma jest bardzo przejrzysta, co sprawia, że porównanie ofert pakietów medycznych zajmuje tylko chwilę.",
                    "Otrzymano kompleksową opiekę, co obejmuje zarówno fizjoterapeutę, jak i stomatologa, zgodnie z oczekiwaniami.",
                    "Wybrano tę opcję ze względu na elastyczne podejście do pacjenta i możliwość szybkiego przełożenia terminu wizyty.",
                    "Zapewnia to duży komfort psychiczny i pewność, że w razie potrzeby szybko uzyska się pomoc medyczną.",
                    "Widać, że współpracuje się tylko z najlepszymi placówkami, ponieważ jakość badań i konsultacji jest rewelacyjna.",
                    "Jest to idealne rozwiązanie dla osób ceniących czas i chcących efektywnie zarządzać swoim zdrowiem.",
                    "Największym atutem jest możliwość sprawdzenia dostępności lekarzy od ręki, bez długiego oczekiwania na infolinii.",
                    "Transakcja przebiegła bardzo sprawnie, a pakiet aktywowano niemal natychmiast po opłaceniu subskrypcji.",
                    "Wybór ten znacząco ułatwił życie, dając gwarancję dostępu do opieki medycznej, kiedy tylko jest ona potrzebna.",
                    "Otrzymano pełne wsparcie techniczne i pomoc w wyborze najkorzystniejszej opcji dla całej rodziny.",
                    "Usługa jest godna zaufania, a wszystkie obietnice dotyczące dostępności lekarzy zostały spełnione z nadwyżką."
                };
                string[] commentsMid =
                {
                    "Może być.", "Terminy mogłyby być krótsze.", "Dobra cena, ale słaby dojazd.", "Ok.",
                    "Średnia jakość usług.", "Brak niektórych specjalistów.", "Obsługa mogłaby być lepsza."
                };

        foreach (var pkg in packages)
        {
            int reviewsCount = random.Next(11, 21);
            for (int i = 0; i < reviewsCount; i++)
            {
                var user = users[random.Next(users.Count)];
                int rating = random.Next(4, 6);
                string comment = rating >= 4
                    ? commentsHigh[random.Next(commentsHigh.Length)]
                    : commentsMid[random.Next(commentsMid.Length)];

                reviews.Add(new Review
                {
                    PackageId = pkg.Id,
                    UserId = user.Id,
                    Rating = rating,
                    Comment = comment,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 100)),
                    IsApproved = true
                });
            }
        }

        await dbContext.Reviews.AddRangeAsync(reviews);
        await dbContext.SaveChangesAsync();

        foreach (var pkg in packages)
        {
            var pkgReviews = reviews.Where(r => r.PackageId == pkg.Id).ToList();
            if (pkgReviews.Any())
            {
                pkg.Reviews = pkgReviews.Count;
                pkg.AverageRating = pkgReviews.Average(r => r.Rating);
            }
        }
        await dbContext.SaveChangesAsync();
    }
}