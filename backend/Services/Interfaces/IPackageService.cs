using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces;

public interface IPackageService
{
    Task<IEnumerable<Package>> GetAllPackagesAsync();
    Task<Package?> GetPackageByIdAsync(int id);
    Task<Package> CreatePackageAsync(CreatePackageDto dto, string? adminName);
    Task UpdatePackageAsync(int id, UpdatePackageDto dto, string? adminName);
    Task DeletePackageAsync(int id, string? adminName);
}