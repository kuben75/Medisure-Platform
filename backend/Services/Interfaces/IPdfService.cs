using backend.Models;

namespace backend.Services.Interfaces;

public interface IPdfService
{
    byte[] GenerateCertificate(UserPackage sub, ApplicationUser user);
}