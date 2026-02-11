namespace backend.DTOs;

public class UserDto
{
    public string Id { get; set; }  = null!;
        
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public DateTime? BirthDate { get; set; }
    
    public List<string> Roles { get; set; } = null!;
    public bool IsLocked { get; set; } 
}