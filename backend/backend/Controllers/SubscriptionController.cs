using backend.Data;
using backend.Models;
using backend.Services;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; 

namespace backend.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    [Authorize] 
    public class SubscriptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogService _logService;

        public SubscriptionsController(ApplicationDbContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;
        }

        [HttpPost("{packageId}")]
        public async Task<IActionResult> Subscribe(int packageId, [FromBody] SubscribeDto dto)
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userIdOrEmail)) 
            {
                return Unauthorized(new { Message = "Brak identyfikatora w tokenie." });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);

            if (user == null)
            {
                await _logService.LogAsync(
                    "SUBSCRIBE_PACKAGE_FAILED",
                    $"Nie znaleziono użytkownika dla identyfikatora: {userIdOrEmail}",
                    "System",
                    null,
                    "Error"
                );
                return BadRequest(new { Message = $"Nie znaleziono użytkownika dla identyfikatora: {userIdOrEmail}" });
            }
            if (string.IsNullOrEmpty(user.Pesel))
            {
                return BadRequest(new { 
                    Message = "Brak numeru PESEL. Uzupełnij dane w profilu, aby dokonać zakupu.",
                    Code = "MISSING_PESEL" 
                });
            }
            var package = await _context.Packages.FindAsync(packageId);
            if (package == null)
            {
                return NotFound(new { Message = "Taki pakiet nie istnieje." });
            }
            DateTime startDate = DateTime.UtcNow;
            DateTime endDate;
            decimal finalPrice = 0;

            switch (dto.Duration.ToLower())
            {
                case "7d": 
                    endDate = startDate.AddDays(7);
                    finalPrice = 0; 
                    break;

                case "2y": 
                    endDate = startDate.AddYears(2);
                    decimal baseTotal2Y = package.PriceValue * 24;
                    finalPrice = baseTotal2Y * 0.85m; 
                    break;

                case "1y":
                    endDate = startDate.AddYears(1);
                    break;
                default:
                    endDate = startDate.AddYears(1);
                    finalPrice = package.PriceValue * 12;
                    break;
            }
            finalPrice = Math.Round(finalPrice, 2);
            var subscription = new UserPackage
            {
                User = user,      
                PackageId = packageId,
                StartDate = startDate,
                EndDate = endDate,
                Status = "Active",
                PriceAtPurchase = $"{finalPrice} zł" 
            };

            _context.UserPackages.Add(subscription);
            await _context.SaveChangesAsync();
            await _logService.LogAsync(
                "SUBSCRIBE_PACKAGE",
                $"Użytkownik {user.Email} (ID: {user.Id}) zakupił pakiet '{package.Name}' (ID: {package.Id}).",
                user.Email,
                user.Id,
                "Success"
            );
            return Ok(new { Message = $"Sukces! Zakupiłeś pakiet: {package.Name}" });
        }

        [HttpGet]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userIdOrEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdOrEmail == null) return Unauthorized();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email == userIdOrEmail);

            if (user == null)
            {
                return BadRequest(new { Message = "Nie znaleziono użytkownika." });
            }

            var myPackages = await _context.UserPackages
                .Where(up => up.UserId == user.Id) 
                .Include(up => up.Package) 
                .Select(up => new 
                {
                    Id = up.Id,
                    PackageId = up.PackageId,
                    PackageName = up.Package.Name,
                    Price = up.PriceAtPurchase, 
                    StartDate = up.StartDate,
                    EndDate = up.EndDate,
                    Status = up.Status,
                    Features = up.Package.Features 
                })
                .ToListAsync();
    
            return Ok(myPackages);
        }
    }
}