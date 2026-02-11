using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Stare hasło jest wymagane")]
    public string CurrentPassword { get; set; } = null!;

    [Required(ErrorMessage = "Nowe hasło jest wymagane")]
    [MinLength(8, ErrorMessage = "Nowe hasło musi mieć min. 8 znaków")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Hasło musi zawierać wielką literę, małą literę, cyfrę i znak specjalny.")]
    public string NewPassword { get; set; } = null!;

    [Compare("NewPassword", ErrorMessage = "Hasła nie są identyczne")]
    public string ConfirmNewPassword { get; set; } = null!;
    public string? TwoFactorCode { get; set; }
}