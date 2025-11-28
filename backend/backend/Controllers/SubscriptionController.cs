using backend.Data;
using backend.Models;
using backend.Services;
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
        public async Task<IActionResult> Subscribe(int packageId)
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

            var package = await _context.Packages.FindAsync(packageId);
            if (package == null)
            {
                return NotFound(new { Message = "Taki pakiet nie istnieje." });
            }

            var subscription = new UserPackage
            {
                User = user,      
                PackageId = packageId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(12),
                Status = "Active",
                PriceAtPurchase = package.Price
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