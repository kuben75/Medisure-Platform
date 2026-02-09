using backend.DTOs;
namespace backend.Services.Interfaces;

public interface IContactService
{
    Task HandleContactFormAsync(ContactFormDto dto);
}