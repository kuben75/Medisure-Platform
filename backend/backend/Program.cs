using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Workers;
using backend.Services;
using Microsoft.OpenApi.Models;
using Serilog;

var seqUrl = Environment.GetEnvironmentVariable("SEQ_URL") ?? "http://localhost:5341";

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.Seq(seqUrl) 
    .CreateLogger();

try
{
    Log.Information("Uruchamianie aplikacji...");
    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();
    
    var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
    var corsOrigins = new[]
    {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080"
    };

    builder.Services.AddControllers();
    builder.Services.AddSignalR();
    builder.Services.AddMemoryCache();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<ILogService, LogService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IChatService, ChatService>();
    builder.Services.AddScoped<IContactService, ContactService>();
    builder.Services.AddScoped<IFavoritesService, FavoritesService>();
    builder.Services.AddScoped<IReviewsService, ReviewsService>();
    builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
    builder.Services.AddSingleton<UserConnectionManager>();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<IPdfService, PdfService>();
    builder.Services.AddScoped<IPricingService, PricingService>();
    builder.Services.AddHostedService<SubscriptionExpirationWorker>();
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
                    .WithOrigins(corsOrigins)
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
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
            options.Tokens.PasswordResetTokenProvider = "CustomPasswordResetTokenProvider";
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders()
        .AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>("CustomPasswordResetTokenProvider");

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
                        (path.StartsWithSegments("/api/chatHub")))
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
    app.MapHub<backend.Hubs.ChatHub>("/api/chatHub");

    try
    {
        await SeedDatabase(app);
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Wystąpił błąd podczas inicjalizacji bazy danych przy starcie aplikacji.");
        Log.Fatal(ex, "Wystąpił błąd podczas inicjalizacji bazy danych przy starcie aplikacji.");
    }

    app.Run();

    async Task SeedDatabase(IHost app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var config = services.GetRequiredService<IConfiguration>();
    
            await DbInitializer.Seed(services, config);
        }
    }
}catch (Exception ex) when (ex.GetType().Name is not "HostAbortedException") 
{
    Log.Fatal(ex, "Aplikacja zakończyła działanie z powodu nieobsłużonego wyjątku.");
}
finally
{
    Log.CloseAndFlush();
}