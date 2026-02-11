using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Services.Interfaces;

namespace backend.Services;

public class PackageService : IPackageService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogService _logService;

    public PackageService(ApplicationDbContext context, ILogService logService)
    {
        _context = context;
        _logService = logService;
    }

    public async Task<IEnumerable<Package>> GetAllPackagesAsync()
    {
        return await _context.Packages
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Package?> GetPackageByIdAsync(int id)
    {
        return await _context.Packages.FindAsync(id);
    }

    public async Task<Package> CreatePackageAsync(CreatePackageDto dto, string? adminName)
    {
        var package = new Package
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            PriceValue = dto.PriceValue ?? 0,
            Price = dto.Price,
            IncludedSpecializations = string.Join(";", dto.IncludedSpecializations ?? new List<string>()),
            SpecialistsCount = dto.SpecialistsCount,
            FacilitiesCount = dto.FacilitiesCount,
            HasDentalCare = dto.HasDentalCare,
            HasHospitalization = dto.HasHospitalization,
            HasRehabilitation = dto.HasRehabilitation,
            IsFeatured = dto.IsFeatured,
            Features = string.Join(";", dto.Features ?? new List<string>())
        };

        _context.Packages.Add(package);
        await _context.SaveChangesAsync();

        await _logService.LogAsync("STWORZENIE_PAKIETU", $"Utworzono pakiet: {package.Name}", adminName ?? "System");
        
        return package;
    }

    public async Task UpdatePackageAsync(int id, UpdatePackageDto dto, string? adminName)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null) throw new KeyNotFoundException();

        package.Name = dto.Name;
        package.Description = dto.Description;
        package.Category = dto.Category;
        package.PriceValue = dto.PriceValue ?? 0;
        package.Price = dto.Price;
        package.IncludedSpecializations = string.Join(";", dto.IncludedSpecializations ?? new List<string>());
        package.SpecialistsCount = dto.SpecialistsCount;
        package.FacilitiesCount = dto.FacilitiesCount;
        package.HasDentalCare = dto.HasDentalCare;
        package.HasHospitalization = dto.HasHospitalization;
        package.HasRehabilitation = dto.HasRehabilitation;
        package.IsFeatured = dto.IsFeatured;
        package.Features = string.Join(";", dto.Features ?? new List<string>());

        await _context.SaveChangesAsync();
        await _logService.LogAsync("EDYCJA_PAKIETU", $"Zaktualizowano pakiet ID: {id}", adminName ?? "System");
    }

    public async Task DeletePackageAsync(int id, string? adminName)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
        {
            await _logService.LogAsync("BLAD_PAKIETU", $"Próba usunięcia nieistniejącego pakietu ID {id}", adminName ?? "System", null, "Warning");
            throw new KeyNotFoundException();
        }


        var hasActiveSubscriptions = await _context.UserPackages.AnyAsync(up => up.PackageId == id);
        if (hasActiveSubscriptions)
        {
            await _logService.LogAsync("BLAD_USUNIECIA", $"Nie można usunąć pakietu ID {id} - istnieją aktywne subskrypcje", adminName ?? "System", null, "Error");
            
            throw new InvalidOperationException("Nie można usunąć pakietu, który jest przypisany do użytkowników.");
        }

        _context.Packages.Remove(package);
        await _context.SaveChangesAsync();
        await _logService.LogAsync("USUNIECIE_PAKIETU", $"Usunięto pakiet: {package.Name}", adminName ?? "System");
    }
}