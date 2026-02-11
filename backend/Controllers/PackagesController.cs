using backend.Models; 
using backend.DTOs;   
using backend.Enums;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[ApiController]
[Route("api/packages")]
public class PackagesController : ControllerBase
{
    private readonly IPackageService _packageService;
    private readonly IPricingService _pricingService;

    public PackagesController(IPackageService packageService, IPricingService pricingService)
    {
        _packageService = packageService;
        _pricingService = pricingService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Package>>> GetPackages()
    {
        var packages = await _packageService.GetAllPackagesAsync();
        return Ok(packages);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Package>> GetPackage(int id)
    {
        var package = await _packageService.GetPackageByIdAsync(id);
        if (package == null) 
        {
            return NotFound(new ErrorResponse 
            { 
                Success = false, 
                Message = "Nie znaleziono pakietu.", 
                ErrorCode = (int)ErrorCode.NotFound 
            });
        }

        return Ok(package);
    }

    [HttpGet("options")]
    public IActionResult GetPricingOptions()
    {
        return Ok(_pricingService.GetOptions());
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Package>> CreatePackage([FromBody] CreatePackageDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ErrorResponse { Message = "Błąd walidacji danych.", ErrorCode = (int)ErrorCode.ValidationError });
        }

        var newPackage = await _packageService.CreatePackageAsync(dto, User.Identity?.Name);
        
        return CreatedAtAction(nameof(GetPackage), new { id = newPackage.Id }, newPackage);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePackage(int id, [FromBody] UpdatePackageDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Message = "Błąd walidacji danych.", ErrorCode = (int)ErrorCode.ValidationError });

        try
        {
            await _packageService.UpdatePackageAsync(id, dto, User.Identity?.Name);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ErrorResponse { Message = "Nie znaleziono pakietu do edycji.", ErrorCode = (int)ErrorCode.NotFound });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePackage(int id)
    {
        try
        {
            await _packageService.DeletePackageAsync(id, User.Identity?.Name);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ErrorResponse { Message = "Nie znaleziono pakietu do usunięcia.", ErrorCode = (int)ErrorCode.NotFound });
        }
    }
}