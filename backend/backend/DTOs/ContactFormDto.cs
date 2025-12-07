namespace backend.DTOs;
using System.ComponentModel.DataAnnotations;

public class ContactFormDto
{
    [Required] public string Name { get; set; }
    [Required] public string Surname { get; set; }
    [Required] [EmailAddress] public string Email { get; set; }
    [Required] public string Phone { get; set; }
    [Required] public string Topic { get; set; }
    public string Message { get; set; }
}