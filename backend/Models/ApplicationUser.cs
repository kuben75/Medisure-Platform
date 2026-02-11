using Microsoft.AspNetCore.Identity;

namespace backend.Models;

public class ApplicationUser: IdentityUser
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public DateTime? BirthDate { get; set; }

    public string? Pesel { get; set;}
}