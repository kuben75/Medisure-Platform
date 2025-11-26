using backend.Models;
using Microsoft.EntityFrameworkCore; 
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
namespace backend.Data;
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
            
    }
    
    public DbSet<Package> Packages { get; set; }
    
    public DbSet<UserPackage> UserPackages { get; set; }
    public DbSet<Review> Reviews { get; set; } 
    
}