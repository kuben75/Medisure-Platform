using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
namespace backend.Services;

public class PasswordResetTokenProviderOptions : DataProtectionTokenProviderOptions
{
    public PasswordResetTokenProviderOptions()
    {
        Name = "PasswordResetDataProtectorTokenProvider";
        TokenLifespan = TimeSpan.FromMinutes(15); 
    }
}

public class PasswordResetTokenProvider<TUser> : DataProtectorTokenProvider<TUser> where TUser : class
{
    public PasswordResetTokenProvider(
        IDataProtectionProvider dataProtectionProvider, 
        IOptions<PasswordResetTokenProviderOptions> options, 
        ILogger<DataProtectorTokenProvider<TUser>> logger) 
        : base(dataProtectionProvider, options, logger)
    {
    }
}