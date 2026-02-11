using backend.Models;
using Microsoft.EntityFrameworkCore; 
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
namespace backend.Data;
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
            
    }
    
    public DbSet<Package> Packages { get; set; } = null!;
    public DbSet<ChatMessage> ChatMessages { get; set; }  = null!;
    public DbSet<UserPackage> UserPackages { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; }  = null!;
    public DbSet<SystemLog> SystemLogs { get; set; } = null!;
    public DbSet<Favorite> Favorites { get; set; } = null!;
    public DbSet<SystemNotification> SystemNotifications { get; set; } = null!;
    
}