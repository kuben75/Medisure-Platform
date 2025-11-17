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
    
}