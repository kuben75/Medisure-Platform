using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var frontendUrl = builder.Configuration["FrontendUrl"];

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddScoped<ILogService, LogService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<UserConnectionManager>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Moje API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Wprowadź token JWT w formacie: Bearer [TwójToken]",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
                .WithOrigins(frontendUrl) 
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
        });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.User.RequireUniqueEmail = true;
        options.Tokens.PasswordResetTokenProvider = "CustomPasswordResetTokenProvider";
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders()
    .AddTokenProvider<PasswordResetTokenProvider<ApplicationUser>>("CustomPasswordReset");

builder.Services.Configure<DataProtectionTokenProviderOptions>(opt =>
    opt.TokenLifespan = TimeSpan.FromHours(24));

builder.Services.Configure<PasswordResetTokenProviderOptions>(opt =>
    opt.TokenLifespan = TimeSpan.FromMinutes(15));

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/chatHub")))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var useHttps = Environment.GetEnvironmentVariable("USE_HTTPS_REDIRECTION");
if (useHttps == "true")
{
    app.UseHttpsRedirection();
}


app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<backend.Hubs.ChatHub>("/chatHub");

try
{
    SeedDatabase(app);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Wystąpił błąd podczas inicjalizacji bazy danych przy starcie aplikacji.");
}
app.Run();

void SeedDatabase(IHost app)
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var dbContext = services.GetRequiredService<ApplicationDbContext>();

            int retries = 5;
            while (retries > 0)
            {
                if (dbContext.Database.CanConnect()) break;
                
                Console.WriteLine($"Czekam na bazę danych... pozostało prób: {retries}");
                Thread.Sleep(2000);
                retries--;
            }
            dbContext.Database.Migrate();

            if (!dbContext.Packages.Any())
            {
                var mockPackages = new List<Package>
                {
                    new Package
                    {
                        Name = "Pakiet Podstawowy",
                        Category = "Individual",
                        PriceValue = 59.00m, Price = "59 zł",
                        Description = "Podstawowa opieka dla młodych i zdrowych.",
                        Features = new List<string> { "Internista", "Pediatra", "Podstawowe badania krwi" },
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 5, FacilitiesCount = 200, IsFeatured = false
                    },
                    new Package
                    {
                        Name = "Pakiet Podstawowy Plus",
                        Category = "Individual",
                        PriceValue = 79.00m, Price = "79 zł",
                        Description = "Rozszerzona opieka podstawowa z dodatkowymi korzyściami.",
                        Features = new List<string>
                            { "Internista", "Pediatra", "Podstawowe badania krwi", "Konsultacja dietetyczna" },
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 7, FacilitiesCount = 250, IsFeatured = false
                    },
                    new Package
                    {
                        Name = "Pakiet Komfort",
                        Category = "Individual",
                        PriceValue = 129.00m, Price = "129 zł",
                        Description = "Szeroki dostęp do specjalistów bez skierowań.",
                        Features = new List<string>
                            { "30 Specjalistów", "Badania obrazowe (RTG, USG)", "Prowadzenie ciąży" },
                        HasDentalCare = true, HasHospitalization = false, HasRehabilitation = true,
                        SpecialistsCount = 15, FacilitiesCount = 800, IsFeatured = true
                    },
                    new Package
                    {
                        Name = "Pakiet Prestige",
                        Category = "Individual",
                        PriceValue = 399.00m, Price = "399 zł",
                        Description = "Pełna opieka medyczna, stomatologia i wizyty domowe.",
                        Features = new List<string>
                            { "Wszyscy specjaliści", "Stomatologia zachowawcza", "Wizyty domowe", "Szczepienia" },
                        HasDentalCare = true, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 30, FacilitiesCount = 1500, IsFeatured = true
                    },
                    new Package
                    {
                        Name = "Rodzina 2+1 Start", Category = "Family", PriceValue = 199.00m, Price = "199 zł",
                        Description = "Ekonomiczny pakiet dla rodziców z jednym dzieckiem.",
                        Features = new List<string> { "Pediatra bez limitu", "Internista", "Szczepienia podstawowe" },
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 10, FacilitiesCount = 400, IsFeatured = false
                    },
                    new Package
                    {
                        Name = "Rodzina 2+2 Standard", Category = "Family", PriceValue = 299.00m, Price = "299 zł",
                        Description = "Optymalna opieka dla 4-osobowej rodziny.",
                        Features = new List<string>
                            { "Specjaliści dziecięcy", "Opieka dyżurowa 24h", "Wizyty domowe (2/rok)" },
                        HasDentalCare = true, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 20, FacilitiesCount = 600, IsFeatured = true
                    },
                    new Package
                    {
                        Name = "Pakiet Rodzinny Premium",
                        Category = "Family",
                        PriceValue = 350.00m, Price = "350 zł",
                        Description = "Kompleksowa opieka medyczna dla całej rodziny z dodatkowymi usługami.",
                        Features = new List<string>
                        {
                            "Pediatrzy bez limitu", "Szczepienia dla dzieci", "Opieka dyżurowa 24h",
                            "Konsultacje psychologiczne"
                        },
                        HasDentalCare = true, HasHospitalization = false, HasRehabilitation = true,
                        SpecialistsCount = 25, FacilitiesCount = 700, IsFeatured = true
                    },
                    new Package
                    {
                        Name = "Rodzina 2+3 Premium", Category = "Family", PriceValue = 450.00m, Price = "450 zł",
                        Description = "Pełna ochrona dla dużej rodziny z nielimitowanym dostępem.",
                        Features = new List<string>
                        {
                            "Wszyscy specjaliści bez skierowań", "Stomatologia dla dzieci", "Rehabilitacja",
                            "Szczepienia"
                        },
                        HasDentalCare = true, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 30, FacilitiesCount = 1200, IsFeatured = true
                    },
                    new Package
                    {
                        Name = "Senior",
                        Category = "Senior",
                        PriceValue = 180.00m, Price = "180 zł",
                        Description = "Pakiet dostosowany do potrzeb osób 65+.",
                        Features = new List<string>
                            { "Geriatra", "Kardiolog", "Rehabilitacja (10 zabiegów)", "Brak limitu wieku" },
                        HasDentalCare = false, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 20, FacilitiesCount = 600, IsFeatured = false
                    },
                    new Package
                    {
                        Name = "Pakiet Senior Plus",
                        Category = "Senior",
                        PriceValue = 220.00m, Price = "220 zł",
                        Description = "Rozszerzona opieka dla seniorów z dodatkowymi korzyściami.",
                        Features = new List<string>
                            { "Geriatra", "Kardiolog", "Rehabilitacja (15 zabiegów)", "Konsultacja dietetyczna" },
                        HasDentalCare = false, HasHospitalization = true, HasRehabilitation = true,
                        SpecialistsCount = 25, FacilitiesCount = 700, IsFeatured = false
                    },
                    new Package
                    {
                        Name = "Pakiet Biznes Standard",
                        Category = "Business",
                        PriceValue = 299.00m, Price = "299 zł",
                        Description = "Podstawowa opieka medyczna dla pracowników firm.",
                        Features = new List<string>
                            { "Dostęp do specjalistów", "Badania okresowe", "Opieka medycyny pracy" },
                        HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                        SpecialistsCount = 25, FacilitiesCount = 1500, IsFeatured = false
                    }
                };

                dbContext.Packages.AddRange(mockPackages);
                dbContext.SaveChanges();
            }
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            
            if (!dbContext.Roles.Any())
            {
                var roles = new List<IdentityRole>
                {
                    new IdentityRole { Name = "Admin" },
                    new IdentityRole { Name = "User" }
                };
                foreach (var role in roles) roleManager.CreateAsync(role).GetAwaiter().GetResult();
            }

            var usersToCreate = new List<(string Email, string First, string Last, string Role)>
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
            foreach (var u in usersToCreate)
            {
                if (userManager.FindByEmailAsync(u.Email).Result == null)
                {
                    var newUser = new ApplicationUser
                    {
                        UserName = u.Email, Email = u.Email, FirstName = u.First, LastName = u.Last,
                        EmailConfirmed = true
                    };
                    var res = userManager.CreateAsync(newUser, "Admin123!").GetAwaiter().GetResult();
                    if (res.Succeeded) userManager.AddToRoleAsync(newUser, u.Role).GetAwaiter().GetResult();
                }
            }

            if (!dbContext.Reviews.Any())
            {
                var packages = dbContext.Packages.ToList();
                var users = dbContext.Users.ToList().Where(u => !u.Email.StartsWith("admin@")).ToList();

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

                dbContext.Reviews.AddRange(reviews);
                dbContext.SaveChanges();

                foreach (var pkg in packages)
                {
                    var pkgReviews = reviews.Where(r => r.PackageId == pkg.Id).ToList();
                    if (pkgReviews.Any())
                    {
                        pkg.Reviews = pkgReviews.Count;
                        pkg.AverageRating = pkgReviews.Average(r => r.Rating);
                    }
                }

                dbContext.SaveChanges();
            }
        }catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Wystąpił błąd podczas inicjalizacji bazy danych.");
        }
    }
}