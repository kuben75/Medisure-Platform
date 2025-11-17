
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddControllers(); 

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
            new string[] {}
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy  =>
        {
            policy.WithOrigins("http://localhost:5173") 
                .AllowAnyHeader() 
                .AllowAnyMethod(); 
        });
});
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 4;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
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

        if (!dbContext.Packages.Any())
        {
            var mockPackages = new List<Package>
            {
                new Package 
                {
                    Name = "Pakiet podstawowy",
                    Price = "199 zł",
                    Features = new List<string> { "Konsultacje lekarskie", "Badania labolatoryjne", "Opieka stomatologiczna" },
                    Description = "Idealny wybór dla osób szukających podstawowej opieki zdrowotnej",
                    AverageRating = 4.5,
                    Reviews = 69,
                    IsFeatured = false
                },
                new Package 
                {
                    Name = "Pakiet Premium",
                    Price = "399 zł",
                    Features = new List<string> { "Konsultacje lekarskie", "Badania labolatoryjne", "Opieka stomatologiczna", "Umowa na X miesięcy" },
                    Description = "Najszersza opieka medyczna na wysokim poziomie",
                    AverageRating = 4.7,
                    Reviews = 70,
                    IsFeatured = true
                },
                new Package 
                {
                    Name = "Pakiet Rozszerzony",
                    Price = "299 zł",
                    Features = new List<string> { "Konsultacje lekarskie", "Badania labolatoryjne", "Opieka stomatologiczna" },
                    Description = "Dobry wybór dla osób szukających podstawowej opieki zdrowotnej",
                    AverageRating = 4.7,
                    Reviews = 75,
                    IsFeatured = false
                }
            };
            
            dbContext.Packages.AddRange(mockPackages);
            dbContext.SaveChanges();
        }

        if (!dbContext.Roles.Any())
        {
            var roles = new List<IdentityRole>
            {
                new IdentityRole { Name = "Admin" }, 
                new IdentityRole { Name = "User" }  
            };
            foreach (var role in roles) {
                roleManager.CreateAsync(role).GetAwaiter().GetResult();
            }
        }
        if (!dbContext.Users.Any())
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@admin.com",
                Email = "admin@admin.com",
                FirstName = "Super",
                LastName = "Admin",
                EmailConfirmed = true 
            };

            var result = userManager.CreateAsync(adminUser, "Admin123!").GetAwaiter().GetResult();

            if (result.Succeeded)
            {
                userManager.AddToRoleAsync(adminUser, "Admin").GetAwaiter().GetResult();
            }
        }
    }
}