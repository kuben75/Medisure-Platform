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

    public PackagesController(ApplicationDbContext context, ILogService logService)
    {
        _context = context;
        _logService = logService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Package>>> GetPackages()
    {
        var packages = await _context.Packages.ToListAsync();
        return Ok(packages);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Package>> GetPackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);

        if (package == null)
        {
            return NotFound();
        }

        return Ok(package);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Package>> CreatePackage([FromBody] Package package)
    {
        _context.Packages.Add(package);
        await _context.SaveChangesAsync();
        await _logService.LogAsync(
            "CREATE_PACKAGE", 
            $"Pakiet '{package.Name}' został utworzony przez {User.Identity?.Name ?? "Admin"}.", 
            User.Identity?.Name ?? "Admin", 
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null, 
            "info");

        return CreatedAtAction(nameof(GetPackage), new { id = package.Id }, package);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePackage(int id, [FromBody] Package packageToUpdate)
    {
        if (id != packageToUpdate.Id)
        {
            return BadRequest("ID w adresie URL nie zgadza się z ID w pakiecie.");
        }

        var packageFromDb = await _context.Packages.FindAsync(id);
        if (packageFromDb == null)
        {
            return NotFound("Nie znaleziono pakietu do aktualizacji.");
        }

        packageFromDb.Name = packageToUpdate.Name;
        packageFromDb.Price = packageToUpdate.Price;
        packageFromDb.Description = packageToUpdate.Description;
        packageFromDb.Features = packageToUpdate.Features;
        packageFromDb.AverageRating = packageToUpdate.AverageRating;
        packageFromDb.Reviews = packageToUpdate.Reviews;
        packageFromDb.IsFeatured = packageToUpdate.IsFeatured;

        await _context.SaveChangesAsync();
        await _logService.LogAsync(
            "UPDATE_PACKAGE", 
            $"Pakiet '{packageFromDb.Name}' został zaktualizowany przez {User.Identity?.Name ?? "Admin"}.", 
            User.Identity?.Name ?? "Admin", 
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null, 
            "info");
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
        {
            await _logService.LogAsync(
                "DELETE_PACKAGE_FAILED", 
                $"Próba usunięcia nieistniejącego pakietu o ID {id}.", 
                User.Identity?.Name ?? "Admin", 
                User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null, 
                "warning");
            return NotFound("Nie znaleziono pakietu do usunięcia.");
        }

        _context.Packages.Remove(package);
        await _context.SaveChangesAsync();
        await _logService.LogAsync(
            "DELETE_PACKAGE", 
            $"Pakiet '{package.Name}' został usunięty przez {User.Identity?.Name ?? "Admin"}.", 
            User.Identity?.Name ?? "Admin", 
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? null, 
            "info");
        return NoContent();
    }
}