using backend.Data;
using backend.Services;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/packages")]
public class PackagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;
    private readonly IPricingService _pricingService;

    public PackagesController(ApplicationDbContext context, ILogService logService, IPricingService pricingService)
    {
        _context = context;
        _logService = logService;
        _pricingService = pricingService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Package>>> GetPackages()
    {
        return Ok(await _context.Packages.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Package>> GetPackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null) return NotFound();

        return Ok(package);
    }

    [HttpGet("options")]
    public IActionResult GetPricingOptions()
    {
        return Ok(_pricingService.GetOptions());
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Package>> CreatePackage([FromBody] Package package)
    {
        _context.Packages.Add(package);
        await _context.SaveChangesAsync();

        await LogActionAsync("STWORZENIE_PAKIETU", $"Pakiet '{package.Name}' został utworzony.");

        return CreatedAtAction(nameof(GetPackage), new { id = package.Id }, package);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePackage(int id, [FromBody] Package packageToUpdate)
    {
        if (id != packageToUpdate.Id)
            return BadRequest("ID w adresie URL nie zgadza się z ID w pakiecie.");

        var packageFromDb = await _context.Packages.FindAsync(id);
        if (packageFromDb == null)
            return NotFound("Nie znaleziono pakietu do aktualizacji.");

        UpdatePackageDetails(packageFromDb, packageToUpdate);

        await _context.SaveChangesAsync();
        await LogActionAsync("EDYCJA_PAKIETU", $"Pakiet '{packageFromDb.Name}' został zaktualizowany.");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
        {
            await LogActionAsync("BLAD_PAKIETU", $"Próba usunięcia nieistniejącego pakietu o ID {id}.", "warning");
            return NotFound("Nie znaleziono pakietu do usunięcia.");
        }

        _context.Packages.Remove(package);
        await _context.SaveChangesAsync();

        await LogActionAsync("USUNIECIE_PAKIETU", $"Pakiet '{package.Name}' został usunięty.");

        return NoContent();
    }

    private void UpdatePackageDetails(Package target, Package source)
    {
        target.Name = source.Name;
        target.Price = source.Price;
        target.Description = source.Description;
        target.Features = source.Features;
        target.AverageRating = source.AverageRating;
        target.Reviews = source.Reviews;
        target.IsFeatured = source.IsFeatured;
    }

    private async Task LogActionAsync(string action, string description, string level = "info")
    {
        var userName = User.Identity?.Name ?? "Admin";
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        await _logService.LogAsync(action, description, userName, userId, level);
    }
}