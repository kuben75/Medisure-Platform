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

builder.Services.AddControllers();

builder.Services.AddScoped<ILogService, LogService>(); 

builder.Services.AddEndpointsApiExplorer();

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
            policy.AllowAnyOrigin() 
                .AllowAnyHeader()
                .AllowAnyMethod();
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
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

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
    });

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// app.UseHttpsRedirection(); 


app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

SeedDatabase(app);

app.MapControllers();

app.Run();

void SeedDatabase(IHost app)
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        dbContext.Database.EnsureCreated();
    
        if (!dbContext.Packages.Any()) {
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
                    SpecialistsCount = 5, FacilitiesCount = 200, AverageRating = 4.2, Reviews = 12, IsFeatured = false
                },
                new Package
                {
                    Name = "Pakiet Komfort",
                    Category = "Individual",
                    PriceValue = 129.00m, Price = "129 zł",
                    Description = "Szeroki dostęp do specjalistów bez skierowań.",
                    Features = new List<string> { "30 Specjalistów", "Badania obrazowe (RTG, USG)", "Prowadzenie ciąży" },
                    HasDentalCare = true, HasHospitalization = false, HasRehabilitation = true,
                    SpecialistsCount = 30, FacilitiesCount = 800, AverageRating = 4.8, Reviews = 45, IsFeatured = true
                },
                new Package
                {
                    Name = "Pakiet VIP Prestige",
                    Category = "Individual",
                    PriceValue = 399.00m, Price = "399 zł",
                    Description = "Pełna opieka medyczna, stomatologia i wizyty domowe.",
                    Features = new List<string> { "Wszyscy specjaliści", "Stomatologia zachowawcza", "Wizyty domowe", "Szczepienia" },
                    HasDentalCare = true, HasHospitalization = true, HasRehabilitation = true,
                    SpecialistsCount = 65, FacilitiesCount = 1500, AverageRating = 5.0, Reviews = 10, IsFeatured = true
                },
                new Package
                {
                    Name = "Rodzina 2+2",
                    Category = "Family",
                    PriceValue = 250.00m, Price = "250 zł",
                    Description = "Ekonomiczne rozwiązanie dla całej rodziny.",
                    Features = new List<string> { "Pediatrzy bez limitu", "Szczepienia dla dzieci", "Opieka dyżurowa 24h" },
                    HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                    SpecialistsCount = 15, FacilitiesCount = 500, AverageRating = 4.6, Reviews = 120, IsFeatured = true
                },
                new Package
                {
                    Name = "Senior Aktywny",
                    Category = "Senior",
                    PriceValue = 180.00m, Price = "180 zł",
                    Description = "Pakiet dostosowany do potrzeb osób 65+.",
                    Features = new List<string> { "Geriatra", "Kardiolog", "Rehabilitacja (10 zabiegów)", "Brak limitu wieku" },
                    HasDentalCare = false, HasHospitalization = true, HasRehabilitation = true,
                    SpecialistsCount = 20, FacilitiesCount = 600, AverageRating = 4.9, Reviews = 30, IsFeatured = false
                },
                new Package
                {
                    Name = "Pakiet Biznes Premium",
                    Category = "Business",
                    PriceValue = 499.00m, Price = "499 zł",
                    Description = "Kompleksowa opieka medyczna dla pracowników firm.",
                    Features = new List<string> { "Pełny dostęp do specjalistów", "Badania okresowe", "Opieka medycyny pracy" },
                    HasDentalCare = true, HasHospitalization = true, HasRehabilitation = true,
                    SpecialistsCount = 80, FacilitiesCount = 2000, AverageRating = 4.7, Reviews = 25, IsFeatured = true
                },
                new Package
                {
                    Name = "Pakiet Podstawowy Plus",
                    Category = "Individual",
                    PriceValue = 79.00m, Price = "79 zł",
                    Description = "Rozszerzona opieka podstawowa z dodatkowymi korzyściami.",
                    Features = new List<string> { "Internista", "Pediatra", "Podstawowe badania krwi", "Konsultacja dietetyczna" },
                    HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                    SpecialistsCount = 7, FacilitiesCount = 250, AverageRating = 4.3, Reviews = 8, IsFeatured = false
                },
                new Package
                {
                    Name = "Pakiet Rodzinny Premium",
                    Category = "Family",
                    PriceValue = 350.00m, Price = "350 zł",
                    Description = "Kompleksowa opieka medyczna dla całej rodziny z dodatkowymi usługami.",
                    Features = new List<string> { "Pediatrzy bez limitu", "Szczepienia dla dzieci", "Opieka dyżurowa 24h", "Konsultacje psychologiczne" },
                    HasDentalCare = true, HasHospitalization = false, HasRehabilitation = true,
                    SpecialistsCount = 25, FacilitiesCount = 700, AverageRating = 4.8, Reviews = 60, IsFeatured = true
                },
                new Package
                {
                    Name = "Pakiet Senior Plus",
                    Category = "Senior",
                    PriceValue = 220.00m, Price = "220 zł",
                    Description = "Rozszerzona opieka dla seniorów z dodatkowymi korzyściami.",
                    Features = new List<string> { "Geriatra", "Kardiolog", "Rehabilitacja (15 zabiegów)", "Konsultacja dietetyczna" },
                    HasDentalCare = false, HasHospitalization = true, HasRehabilitation = true,
                    SpecialistsCount = 25, FacilitiesCount = 700, AverageRating = 5.0, Reviews = 15, IsFeatured = false     
                },
                new Package
                {
                    Name = "Pakiet Biznes Standard",
                    Category = "Business",
                    PriceValue = 299.00m, Price = "299 zł",
                    Description = "Podstawowa opieka medyczna dla pracowników firm.",
                    Features = new List<string> { "Dostęp do specjalistów", "Badania okresowe", "Opieka medycyny pracy" },
                    HasDentalCare = false, HasHospitalization = false, HasRehabilitation = false,
                    SpecialistsCount = 50, FacilitiesCount = 1500, AverageRating = 4.5, Reviews = 40, IsFeatured = false
                }
            };

            dbContext.Packages.AddRange(mockPackages);
            dbContext.SaveChanges();
        }

        if (!dbContext.Roles.Any()) {
            var roles = new List<IdentityRole>
            {
                new IdentityRole { Name = "Admin" },
                new IdentityRole { Name = "User" }
            };
            foreach (var role in roles) roleManager.CreateAsync(role).GetAwaiter().GetResult();
        }

        var teamAdmins = new[]
        {
            "admin@admin.com",
            "admin1@admin.com",
            "admin2@admin.com",
            "admin3@admin.com"
        };
        foreach (var email in teamAdmins)
        {
            if (userManager.FindByEmailAsync(email).Result == null)
            {
                var newAdmin = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FirstName = "Admin",
                    LastName = "Team",
                    EmailConfirmed = true
                };
                var result = userManager.CreateAsync(newAdmin, "Admin123!").GetAwaiter().GetResult();

                if (result.Succeeded) userManager.AddToRoleAsync(newAdmin, "Admin").GetAwaiter().GetResult();
            }
        }
    }
}
