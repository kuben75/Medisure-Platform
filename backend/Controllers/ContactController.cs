using backend.DTOs;
using backend.Services.Interfaces;
using backend.Models; 
using backend.Enums;  
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory; 

namespace backend.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;
    private readonly IMemoryCache _cache; 

    public ContactController(IContactService contactService, IMemoryCache cache)
    {
        _contactService = contactService;
        _cache = cache;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactFormDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = "Nie przesłano danych formularza.", 
                ErrorCode = (int)ErrorCode.ValidationError 
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new ErrorResponse 
            { 
                Success = false, 
                Message = "Formularz zawiera błędy.", 
                ErrorCode = (int)ErrorCode.ValidationError 
            });
        }
        
        bool isAuthenticated = User.Identity?.IsAuthenticated == true;

        if (!isAuthenticated)
        {
            var ipAddress = GetClientIpAddress();
            string cacheKey = $"contact_form_limit_{ipAddress}";

            if (_cache.TryGetValue(cacheKey, out _))
            {
                return BadRequest(new ErrorResponse 
                { 
                    Success = false, 
                    Message = "Wysłałeś już wiadomość. Następną możesz wysłać za 5 minut.", 
                    ErrorCode = (int)ErrorCode.ValidationError 
                });
            }

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

            _cache.Set(cacheKey, true, cacheOptions);
        }

        await _contactService.HandleContactFormAsync(dto);
        
        return Ok(new { Message = "Wiadomość została wysłana pomyślnie." });
    }

    private string GetClientIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For")) 
            return Request.Headers["X-Forwarded-For"].ToString();
            
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
    }
}